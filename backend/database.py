from sqlalchemy import create_engine, Column, Integer, String, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import os

# --- DATABASE SETUP (SQLite + SQLAlchemy) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "campus.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- DATABASE MODELS ---
class StudentDB(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    roll_no = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    department = Column(String, default="Computer Science & Engineering")
    role = Column(String, default="STUDENT")
    attendance_pct = Column(String, default="0.0%")
    cgpa = Column(String, default="N/A")
    backlogs = Column(Integer, default=0)
    last_synced = Column(String, default=None)

# Create tables in the SQLite database
Base.metadata.create_all(bind=engine)

# Safe SQLite Schema Migration Helper
def migrate_schema():
    with engine.connect() as conn:
        for col, col_type in [
            ("attendance_pct", "VARCHAR DEFAULT '0.0%'"),
            ("cgpa", "VARCHAR DEFAULT 'N/A'"),
            ("backlogs", "INTEGER DEFAULT 0"),
            ("last_synced", "VARCHAR DEFAULT NULL"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE students ADD COLUMN {col} {col_type}"))
                conn.commit()
            except Exception:
                pass

migrate_schema()

# Dependency to provide a database session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initial seed data helper for Samskruti College campus accounts
def seed_initial_students():
    db = SessionLocal()
    try:
        count = db.query(StudentDB).count()
        if count == 0:
            initial_students = [
                StudentDB(
                    roll_no="24259-CS-025",
                    name="Karnati Himesh",
                    password="Password123",
                    department="Computer Science & Engineering",
                    role="STUDENT",
                    attendance_pct="38.64%",
                    cgpa="9.11",
                    backlogs=0
                ),
                StudentDB(
                    roll_no="24259-CS-023",
                    name="P. Shankum",
                    password="Password123",
                    department="Computer Science & Engineering",
                    role="STUDENT",
                    attendance_pct="78.4%",
                    cgpa="8.50",
                    backlogs=0
                ),
                StudentDB(
                    roll_no="24259-CS-001",
                    name="Gona Laxmi Narasimha Swami",
                    password="Password123",
                    department="Computer Science & Engineering",
                    role="STUDENT",
                    attendance_pct="85.0%",
                    cgpa="8.80",
                    backlogs=0
                ),
                StudentDB(
                    roll_no="24259-CS-037",
                    name="Edamanapally Samisaac",
                    password="Password123",
                    department="Computer Science & Engineering",
                    role="STUDENT",
                    attendance_pct="72.0%",
                    cgpa="7.90",
                    backlogs=1
                ),
                StudentDB(
                    roll_no="Vamshi-CS-HOD",
                    name="Prof. Vamshi Krishna",
                    password="Password123",
                    department="Computer Science & Engineering",
                    role="HOD"
                )
            ]
            db.add_all(initial_students)
            db.commit()
            print(f"[Database] Seeded {len(initial_students)} initial campus accounts.")
    finally:
        db.close()

# Run seed on import
seed_initial_students()
