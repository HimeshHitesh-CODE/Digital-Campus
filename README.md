# Samskruti College Portal — Campus Connect

> **Digital Institutional Operating System for Samskruti College of Engineering & Technology (Code: 259)**  
> Production-grade student and department management platform featuring real-time telemetry, automated SBTET academic tracking, dynamic island navigation, institutional document logistics with 3-way decisions, and peer-to-peer campus exchange.

---

## 🏛️ Project Overview

**Campus Connect** is the unified web portal for Samskruti College, providing students, faculty, and department heads (HOD) with real-time academic workflows. The UI has been designed according to the master institutional design specifications (Image B in Light Theme and Image A in Dark Theme), featuring translucent glassmorphic components, emerald/mint color tokens, fluid dynamic island dock navigation, and 60 FPS ambient background waves.

---

## 🎨 Master Design Specifications

- **Light Mode Canvas**: Crisp mint-white background (`#f2f7f4`) with frosted glass panels (`rgba(255, 255, 255, 0.88)`), dark green headings (`#064e3b`), and emerald accent highlights (`#10b981`).
- **Dark Mode Canvas**: Deep forest green (`#042013` / `#02140b`) with translucent emerald glass cards (`rgba(13, 71, 34, 0.48)`), light mint monograms (`#bbf7d0`), and soft emerald glows.
- **Dynamic Island Dock**:
  - Always expanded on desktop viewports with icon stacked vertically above label.
  - Thin dividers between items (`.dock-item-divider`).
  - Active filled pill (`#bbf7d0` with dark emerald text in light mode; emerald glow in dark mode) with subtle accent indicator dot beneath.
  - Collapses smoothly into a compact monogram capsule on mobile and reduced viewports.
- **Top Bar & Account Dropdown**:
  - Left: Samskruti College branding with institutional code `259` and logged-in student PIN.
  - Right: Theme toggle pill + user avatar button with initials and last name.
  - Custom dropdown menu showing User Profile, Theme Switcher, and Logout.
- **Dashboard Showcasing**:
  - Full-width hero without card wrapper sitting directly on the canvas.
  - Seamless gradient-masked campus photo fading smoothly on left and bottom edges.
  - Script tagline `"Learn · Grow · Achieve"` with hand-drawn swoosh and twinkling sparkle accents.
  - 4-column divided attendance telemetry card with real statistics and green SVG sparklines.
  - 3x2 grid of institutional module action cards and latest campus circulars.

---

## ⚙️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.11+, FastAPI, Uvicorn, SQLite, SQLAlchemy ORM, WebSockets |
| **Frontend** | Vanilla HTML5, CSS3 Custom Properties (Design Tokens), ES6 JavaScript Modules |
| **Icons & Visuals** | Lucide Icons, Chart.js (with custom frosted glass tooltips), Ambient SVG Waves |
| **Real-Time Layer** | WebSocket connection manager for instant notifications, message alerts, and HOD status updates |

---

## 🚀 Live Working URL & Local Setup

### 1. Starting the Backend Server
```bash
# Navigate to the repository root
cd Digital-Campus

# Install required dependencies
pip install fastapi uvicorn sqlalchemy requests pydantic

# Launch the FastAPI application
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Accessing the Application
Open your browser and navigate to:
- **Student Portal (Dashboard)**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/) or [http://127.0.0.1:8000/screens/02-student-portal/dashboard.html](http://127.0.0.1:8000/screens/02-student-portal/dashboard.html)
- **Login Screen**: [http://127.0.0.1:8000/screens/01-auth/login.html](http://127.0.0.1:8000/screens/01-auth/login.html)
- **HOD Portal**: [http://127.0.0.1:8000/screens/04-hod-portal/hod-dashboard.html](http://127.0.0.1:8000/screens/04-hod-portal/hod-dashboard.html)
- **HOD Document Approvals**: [http://127.0.0.1:8000/screens/04-hod-portal/document-approvals.html](http://127.0.0.1:8000/screens/04-hod-portal/document-approvals.html)

---

## 🔑 Test Accounts & Credentials

| Role | PIN / ID | Name / Title | Description |
|---|---|---|---|
| **Student A** | `24259-CS-025` | KARNATI HIMESH | Student account with complete attendance, marketplace listings, and document requests |
| **Student B** | `24259-CS-040` | TALLAPALLI TULASI RAM GOUD | Student account with live attendance telemetry and project invite receiving |
| **HOD** | `VAMSHI-CS-HOD` | Dr. J. Vamshi Krishna | Head of Department with 3-way request decision console and auto-reply |

---

## 🧪 Automated End-to-End Verification

To verify that all features work end-to-end in real time, run the automated integration suite:

```bash
python scratch/verify_all_features_e2e.py
```

### Verified Test Matrix:
- [x] **Attendance Telemetry**: Fetches live attendance percentages, working days, and present days via SBTET gateway (`/api/v1/attendance`).
- [x] **Results & Backlogs**: Verifies student marks, credits, and GPA records (`/api/v1/results`).
- [x] **Marketplace CRUD**: Full listing lifecycle (POST create, GET feed, PUT edit, DELETE remove) and "DM Seller" direct linking.
- [x] **Idea Hub Collaboration**: Peer roster browsing (180 CSE students), availability status toggle, and invitation dispatching (`/api/v1/ideahub/invites`).
- [x] **Document Logistics & HOD 3-Way Decisions**:
  - Student submits digital application (Bonafide, Custodian, Leave).
  - HOD reviews in approval console.
  - HOD Option 1: Request Revision with feedback notes (student sees amber `REVISION` badge).
  - HOD Option 2: Approve with 6-digit counter pickup OTP generation.
  - HOD Option 3: Reject with regulatory rationale.
- [x] **Real-Time Messaging**: Instant WebSocket delivery between students and automatic official departmental acknowledgment from Dr. J. Vamshi Krishna.

---

## 📦 Deployment Guide

### Vercel / Netlify Deployment
1. Static frontend files are located in `frontend/`.
2. Connect your GitHub repository to Vercel/Netlify.
3. Configure the build directory as `frontend` or root with rewrite rules pointing to your hosted FastAPI backend (e.g. Railway or Render).
4. Set environment variable `API_BASE_URL` to point to the production backend API.

---

## 📄 License
© 2026 Samskruti College of Engineering and Technology (Code: 259). All Rights Reserved.
