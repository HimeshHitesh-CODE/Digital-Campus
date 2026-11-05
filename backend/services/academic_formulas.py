"""
Samskruti Digital Campus — Academic & Telemetry Formulas
State Board of Technical Education & Training (SBTET) Standards

Ensures 100% mathematical consistency across all student attendance,
backlogs, and marks calculations.
"""

import math
from typing import Dict, Any, List

def calculate_attendance_percentage(present_days: float, working_days: float) -> float:
    """Calculates attendance percentage rounded to two decimals."""
    if working_days <= 0:
        return 0.0
    return round((float(present_days) / float(working_days)) * 100.0, 2)

def get_attendance_eligibility(percentage: float) -> Dict[str, Any]:
    """
    Determines SBTET statutory eligibility status based on cutoff thresholds:
    - >= 75.0%: Regular Eligible
    - 65.0% to 74.99%: Condonable Warning
    - < 65.0%: Detained / Critical Shortage
    """
    pct = float(percentage)
    if pct >= 75.0:
        return {
            "code": "REGULAR",
            "status": "Regular Eligible",
            "is_eligible": True,
            "condonation_required": False,
            "is_detained": False,
            "color": "success",
            "badge": "bg-[#D6F25E] text-[#1A1A1A]"
        }
    elif pct >= 65.0:
        return {
            "code": "CONDONABLE",
            "status": "Condonable Warning",
            "is_eligible": True,
            "condonation_required": True,
            "is_detained": False,
            "color": "warning",
            "badge": "bg-[#FFF0C7] text-[#8A5A00]"
        }
    else:
        return {
            "code": "DETAINED",
            "status": "Critical Detainment Alert (<65%)",
            "is_eligible": False,
            "condonation_required": False,
            "is_detained": True,
            "color": "danger",
            "badge": "bg-[#FFE1DE] text-[#B42318]"
        }

def calculate_days_needed_for_75(present_days: float, working_days: float) -> int:
    """
    Calculates consecutive days of attendance needed to reach 75.0%:
    Equation: (present + x) / (working + x) >= 0.75
    => 0.25 * x >= 0.75 * working - present
    => x = ceil(3 * working - 4 * present)
    """
    p = float(present_days)
    w = float(working_days)
    if w <= 0:
        return 0
    if (p / w) * 100.0 >= 75.0:
        return 0
    needed = math.ceil(3.0 * w - 4.0 * p)
    return max(0, needed)

def calculate_remaining_days(working_days: float, total_semester_days: float = 180.0) -> int:
    """Calculates remaining days in semester."""
    return max(0, int(total_semester_days - working_days))

def calculate_marks_total(internal: float, end_sem: float) -> float:
    """Derives total marks strictly as internal + end_sem."""
    return round(float(internal) + float(end_sem), 2)
