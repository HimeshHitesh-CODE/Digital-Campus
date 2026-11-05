# Samskruti College Portal — Campus Connect

> **Digital Institutional Operating System for Samskruti College of Engineering & Technology (Institution Code: 259)**  
> Production-grade student and department management platform featuring real-time SBTET academic telemetry, Kinetic Bento tactile layout, permanent open navigation dock, zero-trust hardware anti-spoofing security keys, and peer-to-peer campus exchange.

---

## 🏛️ System Overview

**Campus Connect** is the unified web portal for Samskruti College of Engineering & Technology (Affiliated to State Board of Technical Education & Training - SBTET, Telangana). It provides students, faculty, and Heads of Departments (HOD) with real-time academic workflows built on the **Kinetic Bento Tactile Design System**:

- **Dual-Theme Token Architecture**: Strict CSS custom properties (`/css/theme-tokens.css`) enabling instantaneous, layout-invariant theme switching between **Warm Parchment Light** (`#E4E4E1`) and **Deep Charcoal Dark** (`#121212`).
- **Tactile Bento Grids**: Flat, high-contrast surfaces (`#FFFFFF` light / `#1C1C1C` dark) with hairline borders (`rgba(0,0,0,0.08)` / `rgba(255,255,255,0.08)`), Electric Lime accents (`#D6F25E`), and intentional Feature Dark Cards (`#1E1E1F` / `#262626`).
- **Permanent Open Navigation Dock**: Centered floating capsule pill on desktop (≥ 1100px) and fixed 44px capsule bottom bar on mobile (< 1100px) with icon stacked vertically above label and thin hairline dividers. **Strictly 0 collapsed monogram code**.
- **Continuous Scroll Department Ledger**: HOD Students Dossier tab renders all **180 CSE** or **120 AIML** records in a continuous vertical scroll container with sortable column headers and **zero pagination controls** (`< 1 2 3 >` eliminated).

---

## 📐 SBTET Statutory Formulas & Academic Rules

All calculations across student views and backend routes adhere to statutory state board rules:

1. **Total Subject Marks ($T$)**:
   $$T = I + E$$
   Where $I$ is Internal Assessment (max 20) and $E$ is External Board Examination (max 80). Pass threshold: $E \ge 28$ and $T \ge 35$.

2. **Biometric Attendance Percentage ($A$)**:
   $$A = \text{round}\left(\frac{P}{W} \times 100, 2\right)$$
   Where $P$ is present days and $W$ is elapsed working days.

3. **Statutory Examination Eligibility**:
   - $A \ge 75.00\%$: **Direct Hall Ticket Clearance** (Statutory Safe).
   - $65.00\% \le A < 75.00\%$: **Condonation Required** (Medical proof + formal SBTET fee).
   - $A < 65.00\%$: **Detained** (Repeat semester required).

4. **Days Needed for 75% Threshold**:
   $$\text{Days Needed} = \max\left(0, \lceil 3W - 4P \rceil\right)$$

---

## 💻 Tech Stack & Deployment

| Layer | Technologies |
|---|---|
| **Frontend** | Vanilla ES6+ JavaScript, Tailwind CSS (Custom Config), Self-Hosted Fonts (`Plus Jakarta Sans`, `IBM Plex Mono`, `Caveat`), Material Symbols Outlined |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, SQLite, SQLAlchemy ORM, WebSockets |
| **Authentication** | Dual-Role Gateway (Student PIN vs Executive HOD Clearance), Anti-Spoofing Hardware Keys (`STD-XXXXXX`), Session Guards |
| **Hosting** | Render Cloud Platform (`https://digital-campus-5k8n.onrender.com/`) |
| **Test Automation** | Playwright Chromium (Headless Chrome), WCAG 2.1 Contrast Suite |

---

## 👥 Verified User Personas

| Role | Identifier | Name | Context / Department |
|---|---|---|---|
| **Student (CSE)** | `24259-CS-025` | KARNATI HIMESH | Computer Science & Engineering (Batch 2024–27, Sem 4, CGPA 9.11) |
| **Student (AIML)** | `24259-AIML-119` | KARNATI HITESH | Artificial Intelligence & Machine Learning (Batch 2024–27, Sem 4, CGPA 7.53) |
| **HOD (CSE)** | `VAMSHI-CS-HOD` | Dr. J. Vamshi Krishna | HOD Computer Science & Engineering (180 Students Roster) |
| **HOD (AIML)** | `AIML-HOD` | Prof. Padma | HOD Artificial Intelligence & Machine Learning (120 Students Roster) |

---

## 🚀 Running the Project Locally

```bash
# 1. Clone repository
git clone https://github.com/HimeshHimesh-CODE/Digital-Campus.git
cd Digital-Campus

# 2. Install backend dependencies
pip install -r backend/requirements.txt

# 3. Start development server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

# 4. Open in browser
# Student & HOD Login Gateway: http://127.0.0.1:8000/screens/01-auth/login.html
```

---

## 🧪 Automated Verification Suite

```bash
# Run comprehensive Playwright E2E regression across all 4 personas
python scratch/test_phase6_e2e_regression.py

# Run WCAG AA accessibility contrast audit
python scratch/test_a11y_contrast.py
```

&copy; 2025–2026 Samskruti College of Engineering & Technology. Autonomous SBTET Affiliation Code: 259.
