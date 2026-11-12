import asyncio
import httpx
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger("sbtet_integration")

class SBTETIntegrationService:
    """
    Direct Cloud API Data Bridge for Telangana State Board of Technical Education
    and Training (SBTET) via https://sbtetconnect.app underlying Gateway.
    """
    PRIMARY_API_URL = "https://0r1gmpo9bh.execute-api.ap-south-2.amazonaws.com"
    FALLBACK_API_URL = "https://sbtet-api-pgmbqcchaq-em.a.run.app"
    GATEWAYS = [
        "https://0r1gmpo9bh.execute-api.ap-south-2.amazonaws.com",
        "https://sbtet-api-pgmbqcchaq-em.a.run.app"
    ]

    COMMON_HEADERS = {
        "x-sbtet-connect-app": "true",
        "x-api-key": "d1d519447c6f0839a6f4995ac579f7e1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    }

    def __init__(self, timeout: float = 15.0):
        self.timeout = timeout
        self.cache: Dict[str, Dict[str, Any]] = {}

    def _normalize_pin(self, pin: str) -> str:
        return pin.strip().upper()

    def _get_pin_variants(self, pin: str) -> List[str]:
        clean = self._normalize_pin(pin)
        variants = [clean]
        if "-AIML-" in clean:
            variants.append(clean.replace("-AIML-", "-AI-"))
        elif "-AI-" in clean:
            variants.append(clean.replace("-AI-", "-AIML-"))
        return variants

    async def fetch_student_attendance(self, pin: str) -> Dict[str, Any]:
        """
        Fetch live biometric attendance records from SBTET gateway with complete
        day-by-day calendar matrices, with alt-PIN retry and gateway fallback.
        """
        clean_pin = self._normalize_pin(pin)
        pin_variants = self._get_pin_variants(clean_pin)

        raw_json = None
        last_error = None

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for gw in self.GATEWAYS:
                for p in pin_variants:
                    url = f"{gw}/api/attendance?pin={p}"
                    try:
                        response = await client.get(url, headers=self.COMMON_HEADERS)
                        if response.status_code == 200:
                            data_candidate = response.json()
                            if data_candidate.get("data", {}).get("Table"):
                                raw_json = data_candidate
                                break
                        elif response.status_code == 404:
                            last_error = "Student PIN not found on SBTET portal."
                    except httpx.TimeoutException:
                        last_error = "SBTET portal request timed out. Please try again."
                        continue
                    except Exception as e:
                        last_error = f"Failed to connect to SBTET portal: {str(e)}"
                        continue
                if raw_json:
                    break

        if not raw_json:
            return {
                "success": False,
                "pin": clean_pin,
                "error": last_error or "No attendance records found for this student PIN."
            }

        data = raw_json.get("data", {})
        table = data.get("Table", [])
        if not table:
            return {
                "success": False,
                "pin": clean_pin,
                "error": "No attendance records found for this student PIN."
            }

        summary = table[0]
        working_days = float(summary.get("WorkingDays") or summary.get("TotalWorkingDays") or 0)
        days_present = float(summary.get("NumberOfDaysPresent") or 0)
        percentage = float(summary.get("Percentage") or summary.get("TotalPercentage") or 0)

        # Recalculate percentage if missing from raw table
        if percentage == 0 and working_days > 0 and days_present > 0:
            percentage = round((days_present / working_days) * 100, 2)

        total_sem_days = int(summary.get("TotalWorkingDays") or summary.get("ExamsWorkingDays") or 90)
        remaining_days = max(0, total_sem_days - int(working_days))
        status_text = "Eligible" if percentage >= 75.0 else ("Condonation (65-75%)" if percentage >= 65.0 else "Shortage / Detention Risk")

        # Map day-by-day biometric attendance logs into monthly calendar dictionary
        table1 = data.get("Table1", [])
        table2 = data.get("Table2", [])
        monthly_logs_map: Dict[str, List[Dict[str, Any]]] = {}

        for row in table1:
            m_name = (row.get("AttendanceMonth") or "").strip().lower()
            if m_name:
                if m_name not in monthly_logs_map:
                    monthly_logs_map[m_name] = []
                day_num = int(row.get("Day") or 1)
                st = row.get("Status", "A")
                monthly_logs_map[m_name].append({
                    "day": day_num,
                    "date": row.get("Date"),
                    "status": st,
                    "present": st == "P",
                    "absent": st == "A",
                    "isAbsent": st == "A",
                    "isPresent": st == "P"
                })

        return {
            "success": True,
            "pin": clean_pin,
            "name": summary.get("Name", "Student"),
            "college_code": summary.get("CollegeCode", "259"),
            "branch": summary.get("BranchCode", "CS"),
            "scheme": summary.get("Scheme", "C-24"),
            "semester": summary.get("Semester") or "5th Sem",
            "workingDays": int(working_days),
            "presentDays": int(days_present),
            "absentDays": max(0, int(working_days - days_present)),
            "remainingDays": remaining_days,
            "totalSemesterDays": total_sem_days,
            "errors": 0,
            "attendancePercentage": percentage,
            "metrics": {
                "working_days": int(working_days),
                "days_present": int(days_present),
                "days_absent": max(0, int(working_days - days_present)),
                "remaining_days": remaining_days,
                "total_semester_days": total_sem_days,
                "percentage": f"{percentage:.2f}%",
                "percentage_value": percentage,
                "status": status_text,
                "is_eligible": percentage >= 75.0,
                "days_needed_for_75": max(0, int(round((working_days * 0.75) - days_present)))
            },
            "monthlyLogs": monthly_logs_map,
            "monthlyCalendars": monthly_logs_map,
            "monthly_summary": table2,
            "source": "SBTET_LIVE_GATEWAY"
        }

    async def fetch_student_results(self, pin: str, scheme: str = "C24") -> Dict[str, Any]:
        """
        Fetch consolidated semester results and backlogs from SBTET gateway,
        formatting into semester subject breakdowns with alt-PIN retry and gateway fallback.
        """
        clean_pin = self._normalize_pin(pin)
        pin_variants = self._get_pin_variants(clean_pin)

        raw_json = None
        last_error = None

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for gw in self.GATEWAYS:
                for p in pin_variants:
                    url = f"{gw}/api/consolidated?pin={p}&scheme={scheme}"
                    try:
                        response = await client.get(url, headers=self.COMMON_HEADERS)
                        if response.status_code == 200:
                            data_candidate = response.json()
                            if data_candidate.get("subjects") or data_candidate.get("summary"):
                                raw_json = data_candidate
                                break
                        elif response.status_code == 404:
                            last_error = "No consolidated marksheet found for this PIN."
                    except Exception as e:
                        last_error = f"Could not retrieve marksheet from SBTET: {str(e)}"
                        continue
                if raw_json:
                    break

        if not raw_json:
            return {
                "success": False,
                "pin": clean_pin,
                "error": last_error or "No consolidated marksheet found for this PIN."
            }

        summary = raw_json.get("summary", {})
        subjects = raw_json.get("subjects", [])
        semester_summary = raw_json.get("semesterSummary", [])
        student_info = raw_json.get("student", {})

        # Group subjects by semester
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

            # Map status and grade
            is_pass = sub.get("ExamStatus") == "P" or sub.get("Result") != "FAILED"
            grade = sub.get("HybridGrade") or sub.get("Grade") or ("P" if is_pass else "F")
            if grade in ["F", "AB"] or not is_pass:
                is_pass = False
                status_str = "FAIL"
            else:
                status_str = "PASS"

            subject_obj = {
                "code": sub.get("Subject_Code") or sub.get("SubjectCode") or "",
                "name": sub.get("SubjectName") or "",
                "internal": sub.get("InternalMarks") or "0",
                "external": sub.get("EndExamMarks") or "0",
                "total": sub.get("SubjectTotal") or 0,
                "grade": grade,
                "status": status_str,
                "credits": sub.get("MaxCredits") or sub.get("CreditsGained") or 0,
                "semester": sem_key
            }
            semesters_map[sem_key]["subjects"].append(subject_obj)

            if not is_pass:
                backlogs.append(subject_obj)

        # Sort available semesters
        available_semesters.sort(key=lambda s: int(''.join(filter(str.isdigit, s))) if any(c.isdigit() for c in s) else 0)

        cgpa_val = summary.get("CGPA", 0.0)
        credits_gained = summary.get("CreditsGained", 0.0)
        total_max_credits = summary.get("TotalMaxCredits", 80.0)
        latest_sem = available_semesters[-1] if available_semesters else "Current"

        formatted_summary = {
            "cgpa": cgpa_val,
            "creditsRatio": f"{credits_gained} / {total_max_credits}",
            "creditsGained": credits_gained,
            "totalMaxCredits": total_max_credits,
            "activeBacklogs": len(backlogs),
            "latestSemester": latest_sem,
            "promotionStatus": "Promoted" if len(backlogs) == 0 else f"{len(backlogs)} Backlogs"
        }

        return {
            "success": True,
            "studentName": student_info.get("Name") or "",
            "pin": clean_pin,
            "scheme": scheme,
            "branch": student_info.get("Branch_Code") or "CS",
            "summary": formatted_summary,
            "semesters": semesters_map,
            "availableSemesters": available_semesters,
            "cgpa": cgpa_val,
            "credits_gained": credits_gained,
            "max_credits": total_max_credits,
            "backlogs_count": len(backlogs),
            "backlog_subjects": backlogs,
            "semester_summary": semester_summary,
            "source": "SBTET_LIVE_GATEWAY"
        }

    async def sync_student_full_profile(self, pin: str, scheme: str = "C24") -> Dict[str, Any]:
        """
        Concurrently sync both attendance and marksheet for a student.
        """
        clean_pin = self._normalize_pin(pin)
        attendance_task = self.fetch_student_attendance(clean_pin)
        results_task = self.fetch_student_results(clean_pin, scheme=scheme)

        attendance, results = await asyncio.gather(attendance_task, results_task)

        return {
            "success": attendance.get("success", False) or results.get("success", False),
            "pin": clean_pin,
            "attendance": attendance,
            "results": results
        }

    async def sync_bulk_department(self, pins: List[str], max_concurrency: int = 4) -> Dict[str, Any]:
        """
        Bulk synchronize an entire department roster with controlled concurrency (4) and retry with backoff.
        """
        semaphore = asyncio.Semaphore(max_concurrency)

        async def worker(pin: str):
            async with semaphore:
                for attempt in range(2):
                    res = await self.fetch_student_attendance(pin)
                    if res.get("success"):
                        return res
                    if attempt == 0:
                        await asyncio.sleep(0.5)
                return res

        tasks = [worker(pin) for pin in pins]
        results = await asyncio.gather(*tasks)

        successful = [r for r in results if r.get("success")]
        failed = [r for r in results if not r.get("success")]

        total = len(results)
        eligible_count = sum(1 for r in successful if r.get("metrics", {}).get("is_eligible"))
        avg_pct = (
            sum(r.get("metrics", {}).get("percentage_value", 0) for r in successful) / len(successful)
            if successful else 0
        )

        return {
            "success": True,
            "total_queried": total,
            "synced_count": len(successful),
            "failed_count": len(failed),
            "department_average_attendance": f"{avg_pct:.2f}%",
            "eligible_for_exams_count": eligible_count,
            "detention_risk_count": len(successful) - eligible_count,
            "students": successful,
            "failed_pins": [f.get("pin") for f in failed]
        }

# Global Singleton Instance
sbtet_service = SBTETIntegrationService()
