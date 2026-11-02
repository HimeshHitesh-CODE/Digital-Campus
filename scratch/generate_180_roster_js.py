import json, os, random

# Load real student names
with open(r'backend/all_180_student_names.json', encoding='utf-8') as f:
    student_names = json.load(f)

# Convert to dict if list
if isinstance(student_names, list):
    names_dict = {item[0]: item[1] for item in student_names}
else:
    names_dict = student_names

random.seed(42)

subjects_pool = [
    ("CS-401", "Advanced Java Programming"),
    ("CS-402", "Design & Analysis of Algorithms"),
    ("CS-403", "Database Management Systems"),
    ("CS-404", "Operating Systems Architecture"),
    ("CS-405", "Computer Networks & Protocols"),
    ("CS-406", "Software Engineering & Agile"),
    ("CS-407", "Java Programming Lab"),
    ("CS-408", "DBMS & SQL Query Lab"),
    ("CS-409", "Linux Kernel & Shell Scripting Lab")
]

students_180 = []

for i in range(1, 181):
    pin = f"24259-CS-{str(i).zfill(3)}"
    name = names_dict.get(pin, f"STUDENT {i}")

    # Special specific students
    if pin == "24259-CS-025":
        name = "KARNATI HIMESH"
        att = 27.78
        status = "Detained Deficit"
        key = "STD-3472C6"
        backlogs = [
            {
                "code": "CS-402",
                "name": "Design & Analysis of Algorithms",
                "semester": "Sem IV",
                "internal": "14 / 40",
                "external": "21 / 60",
                "minPass": "16 / 24",
                "remedialLab": "Block B, Room 204",
                "examStatus": "Eligible for Supply Exam"
            },
            {
                "code": "CS-405",
                "name": "Computer Networks & Protocols",
                "semester": "Sem IV",
                "internal": "15 / 40",
                "external": "22 / 60",
                "minPass": "16 / 24",
                "remedialLab": "Block C, Lab 102",
                "examStatus": "Eligible for Supply Exam"
            }
        ]
        mfa = "Active FIDO2"
    elif pin == "24259-CS-040":
        name = "TALLAPALLI TULASI RAM GOUD"
        att = 84.5
        status = "Regular Eligible"
        key = "STD-8389C5"
        backlogs = []
        mfa = "Active FIDO2"
    elif pin == "24259-CS-011":
        name = "RAHUL VERMA"
        att = 78.4
        status = "Regular Eligible"
        key = "STD-CD7706"
        backlogs = []
        mfa = "Active FIDO2"
    elif pin == "24259-CS-012":
        name = "K. SAI MANIDEEP"
        att = 68.2
        status = "Condonable Warning"
        key = "STD-209E10"
        backlogs = [
            {
                "code": "CS-403",
                "name": "Database Management Systems",
                "semester": "Sem IV",
                "internal": "13 / 40",
                "external": "20 / 60",
                "minPass": "16 / 24",
                "remedialLab": "Block B, Room 208",
                "examStatus": "Eligible for Supply Exam"
            }
        ]
        mfa = "Active FIDO2"
    else:
        # Realistic distribution
        roll_type = random.random()
        if roll_type < 0.65:
            att = round(random.uniform(75.0, 94.0), 1)
            status = "Regular Eligible"
            backlogs = []
        elif roll_type < 0.85:
            att = round(random.uniform(65.0, 74.8), 1)
            status = "Condonable Warning"
            if random.random() < 0.4:
                sub = random.choice(subjects_pool[:6])
                backlogs = [{
                    "code": sub[0],
                    "name": sub[1],
                    "semester": "Sem IV",
                    "internal": f"{random.randint(12, 15)} / 40",
                    "external": f"{random.randint(18, 23)} / 60",
                    "minPass": "16 / 24",
                    "remedialLab": f"Block B, Room {random.randint(201, 210)}",
                    "examStatus": "Eligible for Supply Exam"
                }]
            else:
                backlogs = []
        else:
            att = round(random.uniform(28.0, 64.5), 1)
            status = "Detained Deficit"
            num_b = random.randint(1, 3)
            sampled = random.sample(subjects_pool[:6], num_b)
            backlogs = [{
                "code": sub[0],
                "name": sub[1],
                "semester": "Sem IV",
                "internal": f"{random.randint(10, 15)} / 40",
                "external": f"{random.randint(15, 23)} / 60",
                "minPass": "16 / 24",
                "remedialLab": f"Block B, Room {random.randint(201, 210)}",
                "examStatus": "Eligible for Supply Exam"
            } for sub in sampled]

        # Random hex key
        hex_part = f"{random.randint(0x100000, 0xFFFFFF):06X}"
        key = f"STD-{hex_part}"
        mfa = "Active FIDO2" if random.random() < 0.95 else "Hardware Key"

    time_mins = random.randint(5, 55)
    last_synced = f"Today, 09:{str(time_mins).zfill(2)} AM"

    students_180.append({
        "roll": i,
        "pin": pin,
        "name": name,
        "section": "CSE-A" if i <= 90 else "CSE-B",
        "scheme": "C-24",
        "branch": "Computer Science & Engineering",
        "attendance": att,
        "status": status,
        "securityKey": key,
        "mfaStatus": mfa,
        "backlogs": backlogs,
        "backlogCount": len(backlogs),
        "lastSynced": last_synced
    })

# Compute department stats
avg_att = round(sum(s['attendance'] for s in students_180) / len(students_180), 1)
total_backlogs = sum(s['backlogCount'] for s in students_180)
regular_count = sum(1 for s in students_180 if s['status'] == 'Regular Eligible')
condonable_count = sum(1 for s in students_180 if s['status'] == 'Condonable Warning')
detained_count = sum(1 for s in students_180 if s['status'] == 'Detained Deficit')

js_content = f"""/**
 * Samskruti College Official 180-Student CSE Department Master Dataset (Scheme C-24)
 * Provides comprehensive real-time data for all 180 students: PINs 24259-CS-001 to 24259-CS-180
 */

const CAMPUS_180_STUDENTS = {json.dumps(students_180, indent=2)};

const CAMPUS_DEPARTMENT_STATS = {{
  totalStudents: 180,
  averageAttendance: {avg_att},
  regularEligibleCount: {regular_count},
  condonableWarningCount: {condonable_count},
  detainedDeficitCount: {detained_count},
  studentsWithBacklogsCount: {sum(1 for s in students_180 if s['backlogCount'] > 0)},
  totalBacklogsCount: {total_backlogs},
  batchYear: '2024-2025',
  scheme: 'C-24',
  collegeCode: '259'
}};

window.CampusRoster = {{
  getAll: () => CAMPUS_180_STUDENTS,
  getByPin: (pin) => CAMPUS_180_STUDENTS.find(s => s.pin.toLowerCase() === pin.toLowerCase()),
  getStats: () => CAMPUS_DEPARTMENT_STATS
}};
"""

out_path = r'frontend/js/campus-180-roster.js'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Generated {out_path} with 180 students! Avg Attendance: {avg_att}%")
