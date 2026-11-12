import os
import re
import json
import hashlib
from datetime import datetime
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    text,
    or_
)
from sqlalchemy.orm import declarative_base, sessionmaker

# Database Path Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "campus.db")
DATABASE_URL = f"sqlite:///{DB_FILE}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 1. ROSTER KEYS TABLE ---
class RosterKeyDB(Base):
    """Pre-populated roster registry for institutional diploma students across branches."""
    __tablename__ = "roster_keys"

    id = Column(Integer, primary_key=True, index=True)
    pin = Column(String(30), unique=True, index=True, nullable=False)
    secret_key = Column(String(50), nullable=True)
    department = Column(String(100), default="Computer Science & Engineering")
    branch = Column(String(20), default="CS")
    scheme = Column(String(20), default="C-24")
    is_registered = Column(Boolean, default=False)
    created_at = Column(String(40), default=lambda: datetime.utcnow().isoformat())

# --- 2. STUDENTS TABLE ---
class StudentDB(Base):
    """Registered institutional student and staff profiles."""
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    pin = Column(String(30), unique=True, index=True, nullable=False)
    roll_no = Column(String(30), index=True, nullable=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=True)
    password = Column(String(128), nullable=False)
    department = Column(String(100), default="Computer Science & Engineering")
    branch = Column(String(20), default="CS")
    scheme = Column(String(20), default="C-24")
    year = Column(String(20), default="3rd Year")
    semester = Column(String(20), default="5th Sem")
    role = Column(String(20), default="STUDENT")  # STUDENT, HOD_CS, HOD_AIML, ADMIN

    # Scraped Academic & Biometric Metrics
    attendance_pct = Column(String(20), default="0.0%")
    attendance_val = Column(Float, default=0.0)
    working_days = Column(Integer, nullable=True, default=None)
    present_days = Column(Integer, default=0)
    cgpa = Column(Float, default=0.0)
    credits_earned = Column(Float, default=0.0)
    backlogs = Column(Integer, default=0)
    backlogs_count = Column(Integer, default=0)
    last_synced = Column(String(40), nullable=True)

    # Phase 2 Sync & Audit Columns
    sync_status = Column(String(20), default="never")  # never, ok, partial, failed
    last_attempt_at = Column(String(40), nullable=True)
    last_success_at = Column(String(40), nullable=True)
    error_code = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    fields_updated = Column(String(100), nullable=True)
    exams_attendance_pct = Column(Float, nullable=True)
    total_semester_days = Column(Integer, default=180)
    skills = Column(Text, default='[]')
    is_available = Column(Boolean, default=True)

    # Online Presence
    is_online = Column(Boolean, default=False)
    last_seen = Column(String(40), nullable=True)
    created_at = Column(String(40), default=lambda: datetime.utcnow().isoformat())

# --- 2b. BACKLOG RECORDS TABLE (One-to-Many with Students) ---
class BacklogRecordDB(Base):
    """Individual backlog subject details linked to a student."""
    __tablename__ = "backlog_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True, index=True)
    pin = Column(String(30), index=True, nullable=False)
    semester = Column(String(20), nullable=True)
    subject_code = Column(String(30), nullable=True)
    subject_title = Column(String(200), nullable=True)
    internal_marks = Column(String(10), nullable=True)
    external_marks = Column(String(10), nullable=True)
    total_marks = Column(String(10), nullable=True)
    grade = Column(String(10), nullable=True)
    created_at = Column(String(40), default=lambda: datetime.utcnow().isoformat())

# --- 2c. STUDENT SYNC LOGS TABLE ---
class StudentSyncLogDB(Base):
    """Audit logs for student sync operations."""
    __tablename__ = "student_sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    pin = Column(String(30), index=True, nullable=False)
    masked_pin = Column(String(30), nullable=False)
    branch = Column(String(20), default="CS")
    status = Column(String(20), nullable=False)  # ok, partial, failed
    error_code = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    fields_updated = Column(String(100), nullable=True)
    attempted_at = Column(String(40), default=lambda: datetime.utcnow().isoformat())

# --- 3. MARKETPLACE ITEMS TABLE ---
class MarketplaceItemDB(Base):
    """Student peer-to-peer surplus resale listings."""
    __tablename__ = "marketplace_items"

    id = Column(Integer, primary_key=True, index=True)
    seller_pin = Column(String(30), index=True, nullable=False)
    seller_name = Column(String(100), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String(50), default="Other")  # Drafter, Lab Coat, Book, Calculator, Electronics, Other
    condition = Column(String(50), default="Good")   # Brand New, Like New, Good, Fair
    image_url = Column(String(300), nullable=True)
    image_data = Column(Text, nullable=True)
    contact_info = Column(String(100), nullable=True)
    status = Column(String(20), default="AVAILABLE")  # AVAILABLE, SOLD, RESERVED
    created_at = Column(String(40), default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String(40), default=lambda: datetime.utcnow().isoformat())

# --- 4. UNIFIED MESSAGES TABLE ---
class MessageDB(Base):
    """Real-time unified messaging across Idea Hub, Marketplace, and Direct."""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_pin = Column(String(30), index=True, nullable=False)
    sender_name = Column(String(100), nullable=False)
    receiver_pin = Column(String(30), index=True, nullable=False)
    receiver_name = Column(String(100), nullable=False)
    category = Column(String(30), default="DIRECT")  # "IDEA_HUB", "MARKETPLACE", "DIRECT"
    product_id = Column(Integer, nullable=True)
    idea_id = Column(Integer, nullable=True)
    content = Column(Text, nullable=False)
    timestamp = Column(String(40), default=lambda: datetime.utcnow().isoformat())
    is_read = Column(Boolean, default=False)

# --- 5. DIGITAL REQUESTS TABLE ---
class DigitalRequestDB(Base):
    """Institutional physical document clearance requests."""
    __tablename__ = "digital_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_pin = Column(String(30), index=True, nullable=False)
    student_name = Column(String(100), nullable=False)
    request_type = Column(String(100), nullable=False)  # Bonafide Certificate, Custodian Certificate, Internship NOC, Study Conduct
    reason = Column(Text, nullable=False)
    urgency = Column(String(20), default="NORMAL")       # NORMAL, HIGH, URGENT
    status = Column(String(20), default="PENDING")      # PENDING, ACCEPTED, HOLD, REJECTED
    pickup_otp = Column(String(10), nullable=True)      # 6-digit OTP generated upon approval
    hod_notes = Column(Text, nullable=True)
    attendance_snapshot = Column(String(20), default="0.0%")
    guardian_phone = Column(String(20), nullable=True)
    department = Column(String(20), nullable=True)
    submitted_at = Column(String(40), default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String(40), default=lambda: datetime.utcnow().isoformat())

# --- 6. IDEA HUB PROJECTS TABLE ---
class IdeaHubProjectDB(Base):
    """Collaborative student technical innovations and team recruitment."""
    __tablename__ = "idea_hub_projects"

    id = Column(Integer, primary_key=True, index=True)
    author_pin = Column(String(30), index=True, nullable=False)
    author_name = Column(String(100), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    tech_stack = Column(String(200), default="Python, FastAPI, Tailwind")
    team_needed = Column(String(200), default="Frontend Dev, ML Engineer")
    status = Column(String(30), default="RECRUITING")  # RECRUITING, IN_PROGRESS, COMPLETED
    created_at = Column(String(40), default=lambda: datetime.utcnow().isoformat())

# --- 7. PROJECT INVITES TABLE ---
class ProjectInviteDB(Base):
    """Team invites and join requests in Idea Hub."""
    __tablename__ = "project_invites"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=True)
    project_title = Column(String(150), nullable=True)
    from_pin = Column(String(30), index=True, nullable=False)
    from_name = Column(String(100), nullable=False)
    to_pin = Column(String(30), index=True, nullable=False)
    to_name = Column(String(100), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String(20), default="PENDING")  # PENDING, ACCEPTED, DECLINED
    created_at = Column(String(40), default=lambda: datetime.utcnow().isoformat())

# --- 8. MULTI-DEPARTMENT SYNC STATE TABLE ---
class SyncProgressDB(Base):
    """Tracks background synchronization state per branch (CS, AIML)."""
    __tablename__ = "sync_progress"

    id = Column(Integer, primary_key=True, index=True)
    branch = Column(String(20), default="CS", index=True)
    status = Column(String(30), default="IDLE")  # IDLE, RUNNING, COMPLETED, FAILED
    total_students = Column(Integer, default=180)
    synced_count = Column(Integer, default=0)
    current_pin = Column(String(30), nullable=True)
    department_avg_attendance = Column(Float, default=0.0)
    department_clearance_rate = Column(Float, default=0.0)
    started_at = Column(String(40), nullable=True)
    completed_at = Column(String(40), nullable=True)
    ok_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    partial_count = Column(Integer, default=0)
    failed_pins_json = Column(Text, default="[]")


class AnnouncementDB(Base):
    """Official Circulars & Bulletins published by HOD or Administration."""
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    category = Column(String(50), default="ACADEMIC") # ACADEMIC, EXAMINATION, SCHOLARSHIP, EVENT, URGENT
    image_url = Column(String(255), nullable=True)
    department = Column(String(100), default="Computer Science & Engineering")
    branch = Column(String(20), default="CS") # CS, AIML, ALL
    target_audience = Column(String(50), default="ALL_STUDENTS") # ALL_STUDENTS, 1ST_YEAR, 2ND_YEAR, 3RD_YEAR
    status = Column(String(30), default="PUBLISHED") # DRAFT, PUBLISHED, ARCHIVED
    published_by = Column(String(100), default="Dr. J. Vamshi Krishna")
    published_by_role = Column(String(50), default="HOD CS")
    reference_no = Column(String(60), nullable=True)
    created_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())

class AttendanceAuditDB(Base):
    """Audit trail of attendance adjustments performed by HOD."""
    __tablename__ = "attendance_audits"

    id = Column(Integer, primary_key=True, index=True)
    student_pin = Column(String(50), index=True, nullable=False)
    student_name = Column(String(120), nullable=False)
    branch = Column(String(20), default="CS")
    previous_pct = Column(Float, default=0.0)
    new_pct = Column(Float, default=0.0)
    previous_present = Column(Integer, default=0)
    new_present = Column(Integer, default=0)
    total_working_days = Column(Integer, default=180)
    changed_by = Column(String(100), default="Dr. J. Vamshi Krishna")
    reason = Column(Text, nullable=False)
    timestamp = Column(String(50), default=lambda: datetime.utcnow().isoformat())

class MarksAuditDB(Base):
    """Audit trail of marks/results edits by HOD."""
    __tablename__ = "marks_audits"

    id = Column(Integer, primary_key=True, index=True)
    student_pin = Column(String(50), index=True, nullable=False)
    student_name = Column(String(120), nullable=False)
    branch = Column(String(20), default="CS")
    semester = Column(String(30), default="5th Sem")
    subject_code = Column(String(40), nullable=False)
    subject_title = Column(String(120), nullable=False)
    previous_marks = Column(Float, default=0.0)
    new_marks = Column(Float, default=0.0)
    previous_grade = Column(String(10), default="F")
    new_grade = Column(String(10), default="P")
    changed_by = Column(String(100), default="Dr. J. Vamshi Krishna")
    reason = Column(Text, default="Re-evaluation verification approved by HOD")
    timestamp = Column(String(50), default=lambda: datetime.utcnow().isoformat())

def get_db():
    db = SessionLocal()
    try:
        yield db

        # 1Z. Authoritative Roster Seeding for CS (180) & AIML (120) from JSON
        try:
            cs_names_path = os.path.join(BASE_DIR, "all_180_student_names.json")
            if os.path.exists(cs_names_path):
                with open(cs_names_path, "r", encoding="utf-8") as f_cs:
                    cs_data = json.load(f_cs)
                    for pin, auth_name in cs_data.items():
                        if auth_name and auth_name.strip():
                            st = db.query(StudentDB).filter(StudentDB.pin == pin).first()
                            if st:
                                st.name = auth_name.strip()
                            rk = db.query(RosterKeyDB).filter(RosterKeyDB.pin == pin).first()
                            if rk and hasattr(rk, 'student_name'):
                                rk.student_name = auth_name.strip()
                    db.commit()

            aiml_names_path = os.path.join(BASE_DIR, "all_120_aiml_student_names.json")
            if os.path.exists(aiml_names_path):
                with open(aiml_names_path, "r", encoding="utf-8") as f_ai:
                    ai_data = json.load(f_ai)
                    for pin, auth_name in ai_data.items():
                        if auth_name and auth_name.strip():
                            st = db.query(StudentDB).filter(StudentDB.pin == pin).first()
                            if st:
                                st.name = auth_name.strip()
                            rk = db.query(RosterKeyDB).filter(RosterKeyDB.pin == pin).first()
                            if rk and hasattr(rk, 'student_name'):
                                rk.student_name = auth_name.strip()
                    db.commit()
        except Exception as e_auth:
            print(f"Authoritative roster name sync notice: {e_auth}")

    finally:
        db.close()

def generate_institutional_key(branch: str, pin: str, roll: int) -> str:
    """Generates a deterministic institutional anti-spoofing security key."""
    clean_pin = pin.strip().upper()
    if clean_pin in ["24259-AIML-019", "24259-AI-119", "24259-AI-019"]:
        return "STD-HI19TE"
    if clean_pin == "24259-CS-025":
        return "STD-XAz10F"
    if clean_pin == "24259-CS-039":
        return "STD-B03209"
    if clean_pin == "24259-CS-023":
        return "STD-SH23PK"

    h = hashlib.sha256(f"SCET259_{branch}_{clean_pin}".encode()).hexdigest().upper()
    if branch == "AIML":
        return f"STD-AI{str(roll).zfill(3)}{h[0:2]}"
    return f"STD-{str(roll).zfill(3)}{h[0:3]}"

# --- SEEDING LOGIC ---
def seed_database():
    """Initializes tables, populates CS & AIML roster keys, staff accounts, and verified students."""
    Base.metadata.create_all(bind=engine)

    # Safe SQLite schema migrations
    with engine.connect() as conn:
        for stmt in [
            "ALTER TABLE sync_progress ADD COLUMN branch VARCHAR(20) DEFAULT 'CS'",
            "ALTER TABLE students ADD COLUMN skills TEXT DEFAULT '[]'",
            "ALTER TABLE students ADD COLUMN is_available BOOLEAN DEFAULT 1",
            "ALTER TABLE digital_requests ADD COLUMN guardian_phone VARCHAR(20)",
            "ALTER TABLE digital_requests ADD COLUMN department VARCHAR(20)",
            "ALTER TABLE marketplace_items ADD COLUMN image_data TEXT"
        ]:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass

        # Fix unsynced students showing 88 working days default
        try:
            conn.execute(text("UPDATE students SET working_days = NULL WHERE working_days = 88 AND (last_synced IS NULL OR last_synced = '')"))
            conn.commit()
        except Exception:
            pass

    db = SessionLocal()
    try:
        # 1A. Populate CS Roster Keys (All 180 Students)
        cs_roster_count = db.query(RosterKeyDB).filter(RosterKeyDB.branch == "CS").count()
        if cs_roster_count < 180:
            roster_file = os.path.abspath(os.path.join(BASE_DIR, "..", "cs_180_security_keys_roster.md"))
            parsed_roster = {}
            if os.path.exists(roster_file):
                with open(roster_file, "r", encoding="utf-8") as f:
                    for line in f:
                        parts = [p.strip() for p in line.split("|") if p.strip()]
                        if len(parts) >= 2 and parts[0].startswith("24259-CS-"):
                            pin = parts[0].upper()
                            key = parts[1]
                            parsed_roster[pin] = key

            for i in range(1, 181):
                pin = f"24259-CS-{str(i).zfill(3)}"
                if not db.query(RosterKeyDB).filter(RosterKeyDB.pin == pin).first():
                    key = parsed_roster.get(pin, generate_institutional_key("CS", pin, i))
                    roster_entry = RosterKeyDB(
                        pin=pin,
                        secret_key=key,
                        department="Computer Science & Engineering",
                        branch="CS",
                        scheme="C-24",
                        is_registered=False
                    )
                    db.add(roster_entry)
            db.commit()

        # 1B. Populate AIML Roster Keys (Exact 120 Students from aiml_120_security_keys_roster.md)
        aiml_roster_file = os.path.join(BASE_DIR, "all_120_aiml_roster_keys.json")
        aiml_keys_cache = {}
        if os.path.exists(aiml_roster_file):
            try:
                with open(aiml_roster_file, "r", encoding="utf-8") as arf:
                    aiml_keys_cache = json.load(arf)
            except Exception:
                pass

        # Clean any invalid or extra roster keys
        db.query(RosterKeyDB).filter(RosterKeyDB.branch == "AIML", ~RosterKeyDB.pin.like("24259-AIML-%")).delete(synchronize_session=False)

        for i in range(1, 121):
            pin = f"24259-AIML-{str(i).zfill(3)}"
            cached_entry = aiml_keys_cache.get(pin, {})
            key = cached_entry.get("secret_key") or cached_entry.get("secretKey") or generate_institutional_key("AIML", pin, i)
            existing_rk = db.query(RosterKeyDB).filter(RosterKeyDB.pin == pin).first()
            if not existing_rk:
                roster_entry = RosterKeyDB(
                    pin=pin,
                    secret_key=key,
                    department="Artificial Intelligence & Machine Learning",
                    branch="AIML",
                    scheme="C-24",
                    is_registered=False
                )
                db.add(roster_entry)
            else:
                existing_rk.secret_key = key
                existing_rk.branch = "AIML"
                existing_rk.department = "Artificial Intelligence & Machine Learning"
        db.commit()

        # 2. Pre-seed Institutional Staff (Both CSE & AIML HODs)
        default_accounts = [
            {
                "pin": "VAMSHI-CS-HOD",
                "roll_no": "VAMSHI-CS-HOD",
                "name": "Prof. Vamshi Krishna",
                "email": "hod.cs@samskruti.ac.in",
                "password": "Password123",
                "department": "Computer Science & Engineering",
                "branch": "CS",
                "scheme": "C-24",
                "semester": "5th Sem",
                "role": "HOD_CS",
                "attendance_pct": "100%",
                "attendance_val": 100.0,
                "cgpa": 10.0
            },
            {
                "pin": "PADMINI-AIML-HOD",
                "roll_no": "PADMINI-AIML-HOD",
                "name": "Prof. Padmini",
                "email": "hod.aiml@samskruti.ac.in",
                "password": "Password123",
                "department": "Artificial Intelligence & Machine Learning",
                "branch": "AIML",
                "scheme": "C-24",
                "semester": "5th Sem",
                "role": "HOD_AIML",
                "attendance_pct": "100%",
                "attendance_val": 100.0,
                "cgpa": 10.0
            },
            {
                "pin": "24259-CS-025",
                "roll_no": "24259-CS-025",
                "name": "KARNATI HIMESH",
                "email": "himesh.k@samskruti.ac.in",
                "password": "Password123",
                "department": "Computer Science & Engineering",
                "branch": "CS",
                "scheme": "C-24",
                "semester": "5th Sem",
                "role": "STUDENT",
                "attendance_pct": "38.64%",
                "attendance_val": 38.64,
                "working_days": 88,
                "present_days": 34,
                "cgpa": 9.11,
                "credits_earned": 80.0,
                "backlogs_count": 0
            },
            {
                "pin": "24259-AI-119",
                "roll_no": "24259-AIML-119",
                "name": "KARNATI HITESH",
                "email": "hitesh.k@samskruti.ac.in",
                "password": "Password123",
                "department": "Artificial Intelligence & Machine Learning",
                "branch": "AIML",
                "scheme": "C-24",
                "semester": "5th Sem",
                "role": "STUDENT",
                "attendance_pct": "51.14%",
                "attendance_val": 51.14,
                "working_days": 88,
                "present_days": 45,
                "cgpa": 7.53,
                "credits_earned": 80.0,
                "backlogs_count": 0
            },
            {
                "pin": "24259-AI-082",
                "roll_no": "24259-AIML-082",
                "name": "THURAI KRISHNA LOHITH",
                "email": "lohith.t@samskruti.ac.in",
                "password": "Password123",
                "department": "Artificial Intelligence & Machine Learning",
                "branch": "AIML",
                "scheme": "C-24",
                "semester": "5th Sem",
                "role": "STUDENT",
                "attendance_pct": "56.82%",
                "attendance_val": 56.82,
                "working_days": 88,
                "present_days": 50,
                "cgpa": 8.42,
                "credits_earned": 80.0,
                "backlogs_count": 0
            },
            {
                "pin": "24259-CS-023",
                "roll_no": "24259-CS-023",
                "name": "YENDAKURTI SHANMUKH",
                "email": "shanmukh.y@samskruti.ac.in",
                "password": "Password123",
                "department": "Computer Science & Engineering",
                "branch": "CS",
                "scheme": "C-24",
                "role": "STUDENT",
                "attendance_pct": "27.27%",
                "attendance_val": 27.27,
                "working_days": 88,
                "present_days": 24,
                "cgpa": 8.45,
                "credits_earned": 75.0,
                "backlogs_count": 0
            },
            {
                "pin": "24259-CS-001",
                "roll_no": "24259-CS-001",
                "name": "GONA LAXMI NARASIMHA SWAMI",
                "email": "narasimha.g@samskruti.ac.in",
                "password": "Password123",
                "department": "Computer Science & Engineering",
                "branch": "CS",
                "scheme": "C-24",
                "role": "STUDENT",
                "attendance_pct": "39.77%",
                "attendance_val": 39.77,
                "working_days": 88,
                "present_days": 35,
                "cgpa": 8.80,
                "credits_earned": 80.0,
                "backlogs_count": 0
            },
            {
                "pin": "24259-CS-037",
                "roll_no": "24259-CS-037",
                "name": "EDAMANAPALLY SAMISAAC",
                "email": "samisaac.e@samskruti.ac.in",
                "password": "Password123",
                "department": "Computer Science & Engineering",
                "branch": "CS",
                "scheme": "C-24",
                "role": "STUDENT",
                "attendance_pct": "27.27%",
                "attendance_val": 27.27,
                "working_days": 66,
                "present_days": 18,
                "cgpa": 7.90,
                "credits_earned": 70.0,
                "backlogs_count": 1
            }
        ]

        # Seed staff & key student accounts
        for acc in default_accounts:
            existing = db.query(StudentDB).filter(or_(StudentDB.pin == acc["pin"], StudentDB.email == acc.get("email"))).first()
            if not existing:
                student = StudentDB(**acc)
                db.add(student)
                roster_rec = db.query(RosterKeyDB).filter(RosterKeyDB.pin == acc["pin"]).first()
                if roster_rec:
                    roster_rec.is_registered = True
            else:
                # Update role and details if needed
                existing.pin = acc["pin"]
                existing.roll_no = acc.get("roll_no", acc["pin"])
                existing.role = acc["role"]
                existing.name = acc["name"]
                existing.department = acc["department"]
                existing.branch = acc["branch"]
                existing.scheme = acc["scheme"]
                existing.semester = acc.get("semester", "5th Sem")
                existing.email = acc.get("email")
                if "attendance_val" in acc:
                    existing.attendance_val = acc["attendance_val"]
                    existing.attendance_pct = acc["attendance_pct"]
                if "cgpa" in acc:
                    existing.cgpa = acc["cgpa"]
        db.commit()

        # 3A. Seed & heal all 180 Diploma CS students
        names_file = os.path.join(BASE_DIR, "all_180_student_names.json")
        master_names = {}
        if os.path.exists(names_file):
            try:
                with open(names_file, "r", encoding="utf-8") as nf:
                    master_names = json.load(nf)
            except Exception as e:
                print(f"[Seed Warning] Could not load all_180_student_names.json: {e}")

        for i in range(1, 181):
            pin = f"24259-CS-{str(i).zfill(3)}"
            verified_name = master_names.get(pin, f"CS Student {pin[-3:]}")

            st = db.query(StudentDB).filter(StudentDB.pin == pin).first()
            if not st:
                new_st = StudentDB(
                    pin=pin,
                    roll_no=pin,
                    name=verified_name,
                    password="Password123",
                    department="Computer Science & Engineering",
                    branch="CS",
                    scheme="C-24",
                    year="3rd Year",
                    semester="5th Sem",
                    role="STUDENT",
                    attendance_pct="0.0%",
                    attendance_val=0.0,
                    working_days=None,
                    present_days=0,
                    cgpa=0.0,
                    credits_earned=0.0,
                    backlogs=0,
                    backlogs_count=0
                )
                db.add(new_st)
            else:
                if not st.name or st.name.startswith("CS Student") or st.name.startswith("Student"):
                    st.name = verified_name
                st.semester = "5th Sem"
        db.commit()

        # 3B. Seed & heal exact 120 Diploma AIML students
        scraped_file = os.path.join(BASE_DIR, "scraped_aiml_students_127.json")
        aiml_students_data = []
        if os.path.exists(scraped_file):
            try:
                with open(scraped_file, "r", encoding="utf-8") as sf:
                    aiml_students_data = json.load(sf)
            except Exception as e:
                print(f"[Seed Warning] Could not load scraped_aiml_students_127.json: {e}")

        aiml_names_file = os.path.join(BASE_DIR, "all_120_aiml_student_names.json")
        aiml_master_names = {}
        if os.path.exists(aiml_names_file):
            try:
                with open(aiml_names_file, "r", encoding="utf-8") as anf:
                    aiml_master_names = json.load(anf)
            except Exception:
                pass

        # Build map by roll number
        scraped_map = {s["roll"]: s for s in aiml_students_data}

        # Purge legacy AI prefix records and any AIML records > 120
        db.query(StudentDB).filter(StudentDB.pin.like("24259-AI-%")).delete(synchronize_session=False)

        for i in range(1, 121):
            pin_aiml = f"24259-AIML-{str(i).zfill(3)}"
            pin_ai = f"24259-AI-{str(i).zfill(3)}"
            s_data = scraped_map.get(i, {})
            verified_name = aiml_master_names.get(pin_aiml) or s_data.get("name") or f"AIML Student {str(i).zfill(3)}"
            att_pct = float(s_data.get("percentage") or 0.0)
            w_days = int(s_data.get("working_days")) if s_data.get("working_days") is not None else None
            p_days = int(s_data.get("present_days") or 0)
            cgpa_val = float(s_data.get("cgpa") or 0.0)
            cr_gained = float(s_data.get("credits_gained") or 0.0)
            b_count = int(s_data.get("backlogs_count") or 0)

            st = db.query(StudentDB).filter(or_(StudentDB.pin == pin_aiml, StudentDB.roll_no == pin_aiml, StudentDB.pin == pin_ai)).first()
            if not st:
                new_st = StudentDB(
                    pin=pin_aiml,
                    roll_no=pin_aiml,
                    name=verified_name,
                    password="Password123",
                    department="Artificial Intelligence & Machine Learning",
                    branch="AIML",
                    scheme="C-24",
                    year="3rd Year",
                    semester="5th Sem",
                    role="STUDENT",
                    attendance_pct=f"{att_pct:.2f}%" if att_pct > 0 else "0.0%",
                    attendance_val=att_pct,
                    working_days=w_days,
                    present_days=p_days,
                    cgpa=cgpa_val,
                    credits_earned=cr_gained,
                    backlogs=b_count,
                    backlogs_count=b_count
                )
                db.add(new_st)
            else:
                st.pin = pin_aiml
                st.roll_no = pin_aiml
                st.name = verified_name
                st.branch = "AIML"
                st.scheme = "C-24"
                st.semester = "5th Sem"
                st.department = "Artificial Intelligence & Machine Learning"
                if att_pct > 0:
                    st.attendance_pct = f"{att_pct:.2f}%"
                    st.attendance_val = att_pct
                    st.working_days = w_days
                    st.present_days = p_days
                if cgpa_val > 0:
                    st.cgpa = cgpa_val
                    st.credits_earned = cr_gained
                    st.backlogs = b_count
                    st.backlogs_count = b_count

            db.flush()
            target_id = st.id if st else (new_st.id if 'new_st' in locals() and new_st else None)

            # Populate Backlogs
            if s_data.get("backlogs"):
                for b in s_data["backlogs"]:
                    code = b.get("code") or ""
                    existing_b = db.query(BacklogRecordDB).filter(BacklogRecordDB.pin == pin_ai, BacklogRecordDB.subject_code == code).first()
                    if not existing_b:
                        db.add(BacklogRecordDB(
                            student_id=target_id,
                            pin=pin_ai,
                            semester=b.get("sem") or "5th Sem",
                            subject_code=code,
                            subject_title=b.get("title") or "",
                            internal_marks=str(b.get("internal") or "0"),
                            external_marks=str(b.get("external") or "0"),
                            total_marks=str(b.get("total") or "0"),
                            grade=b.get("grade") or "F"
                        ))
        db.commit()

        # 4. Pre-seed Starter Marketplace Listings
        if db.query(MarketplaceItemDB).count() == 0:
            starter_items = [
                {
                    "seller_pin": "24259-CS-025",
                    "seller_name": "KARNATI HIMESH",
                    "title": "Mini Drafter & Engineering Instruments Kit",
                    "description": "Omega Mini Drafter with clamp, parallel bar, scale ruler, and drawing clips in durable black protective bag. Perfect condition for Engineering Graphics.",
                    "price": 350.0,
                    "category": "Drafter",
                    "condition": "Like New",
                    "image_url": "../../screens/02-student-portal/assets/images/drafter.png",
                    "contact_info": "PIN: 24259-CS-025 • CSE Dept",
                    "status": "AVAILABLE"
                },
                {
                    "seller_pin": "24259-AIML-019",
                    "seller_name": "KARNATI HITESH",
                    "title": "AI & Deep Learning Mathematics Reference Guide",
                    "description": "Comprehensive reference handbook for Linear Algebra, Probability, and Neural Networks for C-24 Diploma syllabus.",
                    "price": 400.0,
                    "category": "Book",
                    "condition": "Like New",
                    "image_url": "../../screens/02-student-portal/assets/images/book.png",
                    "contact_info": "PIN: 24259-AIML-019 • AIML Dept",
                    "status": "AVAILABLE"
                },
                {
                    "seller_pin": "24259-CS-001",
                    "seller_name": "GONA LAXMI NARASIMHA SWAMI",
                    "title": "Casio fx-991EX Scientific Calculator",
                    "description": "ClassWiz scientific calculator with 552 functions, matrix vector calculations, and dual solar/battery power. Fully allowed in SBTET exams.",
                    "price": 600.0,
                    "category": "Calculator",
                    "condition": "Good",
                    "image_url": "../../screens/02-student-portal/assets/images/calculator.png",
                    "contact_info": "PIN: 24259-CS-001 • CSE Dept",
                    "status": "AVAILABLE"
                },
                {
                    "seller_pin": "24259-CS-023",
                    "seller_name": "YENDAKURTI SHANMUKH",
                    "title": "SCET Official White Lab Coat (Size 38 / M)",
                    "description": "Standard cotton lab coat with embroidered Samskruti College crest and pen pocket. Washed and sanitized.",
                    "price": 180.0,
                    "category": "Lab Coat",
                    "condition": "Good",
                    "image_url": "../../screens/02-student-portal/assets/images/labcoat.png",
                    "contact_info": "PIN: 24259-CS-023 • CSE Dept",
                    "status": "AVAILABLE"
                }
            ]
            for item in starter_items:
                db.add(MarketplaceItemDB(**item))
            db.commit()

        # 5. Pre-seed Starter Digital Requests
        if db.query(DigitalRequestDB).count() == 0:
            starter_requests = [
                {
                    "student_pin": "24259-AIML-019",
                    "student_name": "KARNATI HITESH",
                    "request_type": "Bonafide Certificate",
                    "reason": "AI Hackathon and State Project Grant Documentation.",
                    "urgency": "NORMAL",
                    "status": "PENDING",
                    "pickup_otp": None,
                    "hod_notes": None,
                    "attendance_snapshot": "42.50%"
                },
                {
                    "student_pin": "24259-CS-025",
                    "student_name": "KARNATI HIMESH",
                    "request_type": "Bonafide Certificate",
                    "reason": "Application for State Technical Scholarship & Metro Pass renewal.",
                    "urgency": "NORMAL",
                    "status": "ACCEPTED",
                    "pickup_otp": "729104",
                    "hod_notes": "Verified. Ready for counter pickup at Admin Block Counter 2.",
                    "attendance_snapshot": "38.64%"
                },
                {
                    "student_pin": "24259-CS-037",
                    "student_name": "EDAMANAPALLY SAMISAAC",
                    "request_type": "Internship NOC",
                    "reason": "6-Month Industrial Internship clearance at Tech Mahindra.",
                    "urgency": "HIGH",
                    "status": "PENDING",
                    "pickup_otp": None,
                    "hod_notes": None,
                    "attendance_snapshot": "27.27%"
                }
            ]
            for req in starter_requests:
                db.add(DigitalRequestDB(**req))
            db.commit()

        # 6. Initialize Sync Progress records for CS and AIML
        cs_prog = db.query(SyncProgressDB).filter(SyncProgressDB.branch == "CS").first()
        if not cs_prog:
            # Check legacy row without branch
            legacy_prog = db.query(SyncProgressDB).first()
            if legacy_prog and not legacy_prog.branch:
                legacy_prog.branch = "CS"
            else:
                db.add(SyncProgressDB(
                    branch="CS",
                    status="IDLE",
                    total_students=180,
                    synced_count=0,
                    department_avg_attendance=0.0,
                    department_clearance_rate=0.0
                ))
            db.commit()

        aiml_prog = db.query(SyncProgressDB).filter(SyncProgressDB.branch == "AIML").first()
        if not aiml_prog:
            db.add(SyncProgressDB(
                branch="AIML",
                status="IDLE",
                total_students=127,
                synced_count=0,
                department_avg_attendance=0.0,
                department_clearance_rate=0.0
            ))
            db.commit()
        else:
            aiml_prog.total_students = 127
            db.commit()

    
        # Seed default verified announcements if table empty
        if db.query(AnnouncementDB).count() == 0:
            sample_announcements = [
                AnnouncementDB(
                    title="SBTET C-24 Diploma Regular & Supplementary Examinations Schedule",
                    body="All eligible students with a minimum of 75% biometric attendance are instructed to download their hall tickets from the examination branch desk. Fee submission clearance window closes on Nov 15.",
                    category="EXAMINATION",
                    department="Computer Science & Engineering",
                    branch="CS",
                    target_audience="ALL_STUDENTS",
                    status="PUBLISHED",
                    published_by="Dr. J. Vamshi Krishna",
                    published_by_role="HOD CS",
                    reference_no="SCET/EXAM/2026-11/C24",
                    created_at="2026-10-26T10:00:00"
                ),
                AnnouncementDB(
                    title="Telangana State ePASS Post-Matric Scholarship Biometric Verification",
                    body="Candidates renewing scholarship entitlements must complete biometric authentication at Student Service Counter 3. Required clearances include Bonafide Certificate and Fee Remittance Receipt.",
                    category="SCHOLARSHIP",
                    department="Computer Science & Engineering",
                    branch="CS",
                    target_audience="ALL_STUDENTS",
                    status="PUBLISHED",
                    published_by="Dr. J. Vamshi Krishna",
                    published_by_role="HOD CS",
                    reference_no="SCET/EPASS/2026-B4",
                    created_at="2026-10-24T14:30:00"
                ),
                AnnouncementDB(
                    title="Smart India Hackathon (SIH 2026) Institutional Team Registrations",
                    body="CSE & AIML project teams are invited to submit solution abstracts via Idea Hub. Shortlisted teams will receive dedicated mentor support from the Samskruti T-Hub Incubation Center.",
                    category="ACADEMIC",
                    department="Computer Science & Engineering",
                    branch="CS",
                    target_audience="ALL_STUDENTS",
                    status="PUBLISHED",
                    published_by="Dr. J. Vamshi Krishna",
                    published_by_role="HOD CS",
                    reference_no="SCET/INNOV/2026-H1",
                    created_at="2026-10-20T09:15:00"
                )
            ]
            for sa in sample_announcements:
                db.add(sa)
            db.commit()


        # 1Z. Authoritative Roster Seeding for CS (180) & AIML (120) from JSON
        try:
            cs_names_path = os.path.join(BASE_DIR, "all_180_student_names.json")
            if os.path.exists(cs_names_path):
                with open(cs_names_path, "r", encoding="utf-8") as f_cs:
                    cs_data = json.load(f_cs)
                    for pin, auth_name in cs_data.items():
                        if auth_name and auth_name.strip():
                            st = db.query(StudentDB).filter(StudentDB.pin == pin).first()
                            if st:
                                st.name = auth_name.strip()
                            rk = db.query(RosterKeyDB).filter(RosterKeyDB.pin == pin).first()
                            if rk and hasattr(rk, 'student_name'):
                                rk.student_name = auth_name.strip()
                    db.commit()

            aiml_names_path = os.path.join(BASE_DIR, "all_120_aiml_student_names.json")
            if os.path.exists(aiml_names_path):
                with open(aiml_names_path, "r", encoding="utf-8") as f_ai:
                    ai_data = json.load(f_ai)
                    for pin, auth_name in ai_data.items():
                        if auth_name and auth_name.strip():
                            st = db.query(StudentDB).filter(StudentDB.pin == pin).first()
                            if st:
                                st.name = auth_name.strip()
                            rk = db.query(RosterKeyDB).filter(RosterKeyDB.pin == pin).first()
                            if rk and hasattr(rk, 'student_name'):
                                rk.student_name = auth_name.strip()
                    db.commit()
        except Exception as e_auth:
            print(f"Authoritative roster name sync notice: {e_auth}")

    finally:
        db.close()

# Auto-execute migration and seeds upon import
seed_database()
