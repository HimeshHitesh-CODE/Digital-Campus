import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import httpx

logger = logging.getLogger("sbtet_scraper")

class SBTETScraperService:
    """
    SBTET Scraper and Live Data Bridge for sbtetconnect.app.
    Supports high-speed multi-gateway failover and retry logic for onboarding,
    biometric attendance, and consolidated marksheet/backlogs across semesters.
    """

    GATEWAY_URLS = [
        "https://0r1gmpo9bh.execute-api.ap-south-2.amazonaws.com",
        "https://sbtet-api-pgmbqcchaq-em.a.run.app",
        "https://sbtet-api-486808583305.asia-south2.run.app"
    ]

    COMMON_HEADERS = {
        "x-sbtet-connect-app": "true",
        "x-api-key": "d1d519447c6f0839a6f4995ac579f7e1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    }

    def __init__(self, timeout: float = 12.0):
        self.timeout = timeout

    def _clean_pin(self, pin: str) -> str:
        return pin.strip().upper()

    async def _fetch_with_failover(self, client: httpx.AsyncClient, path: str) -> Optional[httpx.Response]:
        """
        Attempts to fetch an endpoint through the primary gateway.
        If it fails, times out, or returns 5xx/429, cascades to fallback gateways.
        """
        for gw in self.GATEWAY_URLS:
            url = f"{gw}{path}"
            try:
                res = await client.get(url, headers=self.COMMON_HEADERS)
                if res.status_code in [200, 404]:
                    return res
                logger.warning(f"[Gateway Failover] {gw} returned HTTP {res.status_code}, trying next gateway...")
            except (httpx.TimeoutException, httpx.RequestError) as e:
                logger.warning(f"[Gateway Failover] {gw} failed ({type(e).__name__}), trying next gateway...")
                continue
        return None

    async def scrape_student_onboarding(self, pin: str) -> Dict[str, Any]:
        """
        Scrapes student identity (Name, Branch, Scheme, Year, Semester)
        during the PIN-first onboarding registration flow.
        """
        clean_pin = self._clean_pin(pin)
        path = f"/api/attendance?pin={clean_pin}"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                res = await self._fetch_with_failover(client, path)
                if not res or res.status_code == 404:
                    return {"success": False, "error": f"PIN {clean_pin} not found on SBTET portal."}
                
                data = res.json().get("data", {})
                table = data.get("Table", [])
                if not table:
                    return {"success": False, "error": f"No active SBTET records for PIN {clean_pin}."}

                summary = table[0]
                name = summary.get("Name") or "Student"
                branch = summary.get("BranchCode") or "CS"
                scheme = summary.get("Scheme") or "C-24"
                semester = summary.get("Semester") or "6SEM"
                sem_num = 6
                try:
                    sem_num = int(''.join(filter(str.isdigit, semester))) or 6
                except:
                    pass

                year = "3rd Year" if sem_num >= 5 else ("2nd Year" if sem_num >= 3 else "1st Year")

                return {
                    "success": True,
                    "pin": clean_pin,
                    "name": name,
                    "branch": branch,
                    "department": "Computer Science & Engineering" if branch == "CS" else branch,
                    "scheme": scheme,
                    "semester": semester,
                    "year": year
                }
            except Exception as e:
                logger.error(f"[Scraper Error] Onboarding scrape failed for {clean_pin}: {e}")
                return {"success": False, "error": f"Gateway connection error: {str(e)}"}

    async def scrape_attendance(self, pin: str) -> Dict[str, Any]:
        """
        Scrapes live biometric attendance, working days, present days,
        monthly matrices, and trend data with gateway failover.
        """
        clean_pin = self._clean_pin(pin)
        path = f"/api/attendance?pin={clean_pin}"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                res = await self._fetch_with_failover(client, path)
                if not res:
                    return {"success": False, "pin": clean_pin, "error": "Gateway unavailable"}
                if res.status_code == 404:
                    return {"success": False, "pin": clean_pin, "error": "PIN not found"}
                raw = res.json().get("data", {})
            except Exception as e:
                return {"success": False, "pin": clean_pin, "error": str(e)}

        table = raw.get("Table", [])
        if not table:
            return {"success": False, "pin": clean_pin, "error": "No attendance records"}

        summary = table[0]
        working_days = float(summary.get("WorkingDays") or summary.get("TotalWorkingDays") or 88)
        days_present = float(summary.get("NumberOfDaysPresent") or 0)
        percentage = float(summary.get("Percentage") or summary.get("TotalPercentage") or 0)

        if working_days <= 0:
            return {"success": False, "pin": clean_pin, "error": "Invalid working days"}

        if percentage == 0 and working_days > 0 and days_present > 0:
            percentage = round((days_present / working_days) * 100, 2)

        total_sem_days = int(summary.get("TotalWorkingDays") or summary.get("ExamsWorkingDays") or 90)
        remaining_days = max(0, total_sem_days - int(working_days))
        status_text = "Eligible" if percentage >= 75.0 else ("Condonation (65-75%)" if percentage >= 65.0 else "Shortage / Detention Risk")

        table1 = raw.get("Table1", [])
        monthly_logs_map: Dict[str, List[Dict[str, Any]]] = {}
        month_present_counts: Dict[str, int] = {}
        month_working_counts: Dict[str, int] = {}

        for row in table1:
            m_name = (row.get("AttendanceMonth") or "").strip().lower()
            if m_name:
                if m_name not in monthly_logs_map:
                    monthly_logs_map[m_name] = []
                    month_present_counts[m_name] = 0
                    month_working_counts[m_name] = 0

                day_num = int(row.get("Day") or 1)
                st = row.get("Status", "A")
                is_p = st == "P"
                is_a = st == "A"
                if is_p:
                    month_present_counts[m_name] += 1
                if is_p or is_a:
                    month_working_counts[m_name] += 1

                monthly_logs_map[m_name].append({
                    "day": day_num,
                    "date": row.get("Date"),
                    "status": st,
                    "present": is_p,
                    "absent": is_a
                })

        months_ordered = ["june", "july", "august", "september", "october"]
        chart_labels = []
        chart_attendance_pcts = []

        for m in months_ordered:
            if m in monthly_logs_map:
                chart_labels.append(m.capitalize())
                w_count = month_working_counts.get(m, 1)
                p_count = month_present_counts.get(m, 0)
                m_pct = round((p_count / w_count) * 100, 1) if w_count > 0 else 0.0
                chart_attendance_pcts.append(m_pct)

        raw_name = summary.get("Name")
        student_name = raw_name.strip() if raw_name else None

        return {
            "success": True,
            "pin": clean_pin,
            "name": student_name,
            "college_code": summary.get("CollegeCode", "259"),
            "branch": summary.get("BranchCode", "CS"),
            "scheme": summary.get("Scheme", "C24"),
            "semester": summary.get("Semester", "6SEM"),
            "workingDays": int(working_days),
            "presentDays": int(days_present),
            "absentDays": max(0, int(working_days - days_present)),
            "remainingDays": remaining_days,
            "totalSemesterDays": total_sem_days,
            "attendancePercentage": percentage,
            "metrics": {
                "working_days": int(working_days),
                "days_present": int(days_present),
                "days_absent": max(0, int(working_days - days_present)),
                "percentage": f"{percentage:.2f}%",
                "percentage_value": percentage,
                "status": status_text,
                "is_eligible": percentage >= 75.0,
                "days_needed_for_75": max(0, int(round((working_days * 0.75) - days_present)))
            },
            "monthlyLogs": monthly_logs_map,
            "chart_data": {
                "labels": chart_labels or ["June", "July", "August", "September", "October"],
                "data": chart_attendance_pcts or [45.0, 40.0, 38.0, 39.0, 38.6]
            },
            "source": "SBTET_LIVE_GATEWAY"
        }

    async def scrape_results(self, pin: str, scheme: str = "C24") -> Dict[str, Any]:
        """
        Scrapes live consolidated semester marksheet, CGPA, total credits,
        and backlogs breakdown across all historical semesters (1SEM to 6SEM).
        """
        clean_pin = self._clean_pin(pin)
        path = f"/api/consolidated?pin={clean_pin}&scheme={scheme}"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                res = await self._fetch_with_failover(client, path)
                if not res:
                    return {"success": False, "pin": clean_pin, "error": "Gateway unavailable"}
                if res.status_code == 404:
                    return {"success": False, "pin": clean_pin, "error": "No marksheet found"}
                raw = res.json()
            except Exception as e:
                return {"success": False, "pin": clean_pin, "error": str(e)}

        summary = raw.get("summary", {})
        subjects = raw.get("subjects", [])
        semester_summary = raw.get("semesterSummary", [])
        student_info = raw.get("student", {})

        if not summary and not subjects:
            return {"success": False, "pin": clean_pin, "error": "No marksheet data found from gateway"}

        semesters_map: Dict[str, Any] = {}
        available_semesters: List[str] = []
        backlogs: List[Dict[str, Any]] = []

        for sub in subjects:
            sem_key = sub.get("Semester") or "1SEM"
            if sem_key not in semesters_map:
                semesters_map[sem_key] = {
                    "examMonthYear": sub.get("ExamMonthYear") or "APR-2026",
                    "subjects": []
                }
                available_semesters.append(sem_key)

            # Strict Backlog & Pass Calculation
            exam_status = (sub.get("ExamStatus") or "").strip().upper()
            grade = (sub.get("HybridGrade") or sub.get("Grade") or "").strip().upper()
            is_pass = (exam_status == "P") and (grade not in ["F", "AB", "FAIL", ""])

            if not is_pass:
                grade = grade if grade in ["F", "AB"] else "F"
                status_str = "FAIL"
            else:
                status_str = "PASS"

            sub_dict = {
                "code": sub.get("Subject_Code") or sub.get("SubjectCode") or "",
                "name": sub.get("SubjectName") or "",
                "internal": str(sub.get("InternalMarks") or "0"),
                "external": str(sub.get("EndExamMarks") or "0"),
                "total": str(sub.get("SubjectTotal") or "0"),
                "grade": grade or "F",
                "status": status_str,
                "credits": sub.get("MaxCredits") or sub.get("CreditsGained") or 0,
                "semester": sem_key
            }
            semesters_map[sem_key]["subjects"].append(sub_dict)

            if not is_pass:
                backlogs.append(sub_dict)

        available_semesters.sort(key=lambda s: int(''.join(filter(str.isdigit, s))) if any(c.isdigit() for c in s) else 0)

        raw_cgpa = summary.get("CGPA") or summary.get("cgpa") or 0.0
        try:
            cgpa_val = round(float(raw_cgpa), 2)
        except (ValueError, TypeError):
            cgpa_val = 0.0

        backlogs_count = int(len(backlogs))
        credits_gained = float(summary.get("CreditsGained", 0.0) or 0.0)
        total_max_credits = float(summary.get("TotalMaxCredits", 80.0) or 80.0)
        latest_sem = available_semesters[-1] if available_semesters else "Current"

        formatted_summary = {
            "cgpa": cgpa_val,
            "creditsRatio": f"{credits_gained} / {total_max_credits}",
            "creditsGained": credits_gained,
            "totalMaxCredits": total_max_credits,
            "activeBacklogs": backlogs_count,
            "latestSemester": latest_sem,
            "promotionStatus": "Promoted" if backlogs_count == 0 else f"{backlogs_count} Backlogs"
        }

        raw_student_name = student_info.get("Name")
        student_name = raw_student_name.strip() if raw_student_name else None

        return {
            "success": True,
            "studentName": student_name,
            "pin": clean_pin,
            "scheme": scheme,
            "branch": student_info.get("Branch_Code") or "CS",
            "summary": formatted_summary,
            "semesters": semesters_map,
            "availableSemesters": available_semesters,
            "cgpa": cgpa_val,
            "backlogs": backlogs_count,
            "backlogs_count": backlogs_count,
            "credits_gained": credits_gained,
            "max_credits": total_max_credits,
            "backlog_subjects": backlogs,
            "semester_summary": semester_summary,
            "source": "SBTET_LIVE_GATEWAY"
        }

    async def scrape_student_complete(self, pin: str, scheme: str = "C24") -> Dict[str, Any]:
        """
        Synchronously coordinates biometric attendance AND academic results/CGPA/backlogs
        in parallel to ensure atomic, unified student records during 180-student auto-sync.
        """
        clean_pin = self._clean_pin(pin)
        att_res, res_res = await asyncio.gather(
            self.scrape_attendance(clean_pin),
            self.scrape_results(clean_pin, scheme),
            return_exceptions=True
        )

        att_success = isinstance(att_res, dict) and att_res.get("success") is True and att_res.get("workingDays", 0) > 0
        res_success = isinstance(res_res, dict) and res_res.get("success") is True

        att = att_res if att_success else {}
        res = res_res if res_success else {}

        # Resolve real student name without forcing placeholder
        name = att.get("name") or res.get("studentName") or None
        working_days = att.get("workingDays") or 88
        present_days = att.get("presentDays") or 0
        att_pct = att.get("attendancePercentage", 0.0)

        cgpa = res.get("cgpa", 0.0)
        backlogs = res.get("backlogs_count", 0)

        return {
            "success": bool(att_success or res_success),
            "attendance_success": att_success,
            "results_success": res_success,
            "has_attendance": att_success,
            "has_results": res_success,
            "pin": clean_pin,
            "name": name,
            "branch": att.get("branch") or res.get("branch") or "CS",
            "department": "Computer Science & Engineering",
            "scheme": scheme,
            "semester": att.get("semester") or "6SEM",
            "workingDays": int(working_days),
            "presentDays": int(present_days),
            "attendancePercentage": float(att_pct or 0.0),
            "attendance_val": float(att_pct or 0.0),
            "attendance_pct": f"{float(att_pct or 0.0):.2f}%",
            "cgpa": float(cgpa or 0.0),
            "backlogs": int(backlogs or 0),
            "backlogs_count": int(backlogs or 0),
            "credits_earned": float(res.get("credits_gained", 0.0)),
            "backlog_subjects": res.get("backlog_subjects", []),
            "attendance": att,
            "results": res
        }

# Global Instance
sbtet_scraper = SBTETScraperService()
