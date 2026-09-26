import os
import re
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
    ForeignKey
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
    """Pre-populated roster registry for 180 CS diploma students."""
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
    semester = Column(String(20), default="6SEM")
    role = Column(String(20), default="STUDENT")  # STUDENT, HOD_CS, ADMIN

    # Scraped Academic & Biometric Metrics
    attendance_pct = Column(String(20), default="0.0%")
    attendance_val = Column(Float, default=0.0)
    working_days = Column(Integer, default=88)
    present_days = Column(Integer, default=0)
    cgpa = Column(Float, default=0.0)
    credits_earned = Column(Float, default=0.0)
    backlogs = Column(Integer, default=0)
    backlogs_count = Column(Integer, default=0)
    last_synced = Column(String(40), nullable=True)

    # Online Presence
    is_online = Column(Boolean, default=False)
    last_seen = Column(String(40), nullable=True)
    created_at = Column(String(40), default=lambda: datetime.utcnow().isoformat())

# --- 2b. BACKLOG RECORDS TABLE (One-to-Many with Students) ---
class BacklogRecordDB(Base):
    """Individual backlog subject details linked to a student."""
    __tablename__ = "backlog_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    pin = Column(String(30), index=True, nullable=False)
    semester = Column(String(20), nullable=True)
    subject_code = Column(String(30), nullable=True)
    subject_title = Column(String(200), nullable=True)
    internal_marks = Column(String(10), nullable=True)
    external_marks = Column(String(10), nullable=True)
    total_marks = Column(String(10), nullable=True)
    grade = Column(String(10), nullable=True)
    created_at = Column(String(40), default=lambda: datetime.utcnow().isoformat())

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

# --- 8. HOD 180-STUDENT SYNC STATE TABLE ---
class SyncProgressDB(Base):
    """Tracks background synchronization state for all 180 department students."""
    __tablename__ = "sync_progress"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(30), default="IDLE")  # IDLE, RUNNING, COMPLETED, FAILED
    total_students = Column(Integer, default=180)
    synced_count = Column(Integer, default=0)
    current_pin = Column(String(30), nullable=True)
    department_avg_attendance = Column(Float, default=0.0)
    department_clearance_rate = Column(Float, default=0.0)
    started_at = Column(String(40), nullable=True)
    completed_at = Column(String(40), nullable=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- SEEDING LOGIC ---
def seed_database():
    """Initializes tables, populates 180 roster keys, default accounts, and starter items."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Populate Roster Keys (All 180 Students)
        roster_count = db.query(RosterKeyDB).count()
        if roster_count < 180:
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

            # Insert all 180 keys
            for i in range(1, 181):
                pin = f"24259-CS-{str(i).zfill(3)}"
                if not db.query(RosterKeyDB).filter(RosterKeyDB.pin == pin).first():
                    key = parsed_roster.get(pin, f"STD-{pin[-3:]}X9A")
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

        # 2. Pre-seed Institutional Staff and Key Verified Students
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
                "role": "HOD_CS",
                "attendance_pct": "100%",
                "attendance_val": 100.0,
                "cgpa": "10.0"
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
                "role": "STUDENT",
                "attendance_pct": "38.64%",
                "attendance_val": 38.64,
                "working_days": 88,
                "present_days": 34,
                "cgpa": "9.11",
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
                "cgpa": "8.45",
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
                "cgpa": "8.80",
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
                "cgpa": "7.90",
                "credits_earned": 70.0,
                "backlogs_count": 1
            }
        ]

        for acc in default_accounts:
            existing = db.query(StudentDB).filter(StudentDB.pin == acc["pin"]).first()
            if not existing:
                student = StudentDB(**acc)
                db.add(student)
                # Mark roster entry as registered
                roster_rec = db.query(RosterKeyDB).filter(RosterKeyDB.pin == acc["pin"]).first()
                if roster_rec:
                    roster_rec.is_registered = True
        db.commit()

        # 3. Pre-seed Starter Marketplace Listings
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

        # 4. Pre-seed Starter Digital Requests
        if db.query(DigitalRequestDB).count() == 0:
            starter_requests = [
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
                },
                {
                    "student_pin": "24259-CS-001",
                    "student_name": "GONA LAXMI NARASIMHA SWAMI",
                    "request_type": "Custodian Certificate",
                    "reason": "Verification of original 10th and SSC records for passport application.",
                    "urgency": "URGENT",
                    "status": "PENDING",
                    "pickup_otp": None,
                    "hod_notes": None,
                    "attendance_snapshot": "39.77%"
                }
            ]
            for req in starter_requests:
                db.add(DigitalRequestDB(**req))
            db.commit()

        # 5. Pre-seed Idea Hub Projects
        if db.query(IdeaHubProjectDB).count() == 0:
            starter_projects = [
                {
                    "author_pin": "24259-CS-025",
                    "author_name": "KARNATI HIMESH",
                    "title": "Smart Campus Biometric AI & Real-Time Sync",
                    "description": "Building an automated biometric attendance bridge connecting SBTET cloud logs with edge IoT devices for Samskruti campus.",
                    "tech_stack": "Python, FastAPI, WebSockets, Tailwind",
                    "team_needed": "IoT Firmware Dev, UI Designer",
                    "status": "RECRUITING"
                },
                {
                    "author_pin": "24259-CS-001",
                    "author_name": "GONA LAXMI NARASIMHA SWAMI",
                    "title": "Campus Surplus Re-Commerce Platform",
                    "description": "Zero-waste circular economy platform allowing senior students to pass drafters, lab equipment, and textbooks to juniors securely.",
                    "tech_stack": "JavaScript, SQLite, WebSockets",
                    "team_needed": "Database Engineer, Marketing Lead",
                    "status": "IN_PROGRESS"
                }
            ]
            for proj in starter_projects:
                db.add(IdeaHubProjectDB(**proj))
            db.commit()

        # 6. Initialize Sync Progress record if missing
        if not db.query(SyncProgressDB).first():
            db.add(SyncProgressDB(
                status="IDLE",
                total_students=180,
                synced_count=4,
                department_avg_attendance=33.56,
                department_clearance_rate=0.0
            ))
            db.commit()

    finally:
        db.close()

# Auto-execute migration and seeds upon import
seed_database()
