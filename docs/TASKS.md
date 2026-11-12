# Campus Connect v4.0 — Task Tracker
**Branch:** main | **Target:** https://digital-campus-5k8n.onrender.com/

## Status Legend: ⏳ Pending | 🔄 In Progress | ✅ Done | ❌ Failed

---

## Section 1: Global UI / Navigation / Theme / Typography

| # | Task | Status | Owner |
|---|------|--------|-------|
| 1.1 | Rewrite `top-nav.js` — always-open pill, bottom bar <1100px, role-strict | ✅ Done | nav-agent |
| 1.2 | Remove CC pill / dc-dynamic-island from ALL pages | ✅ Done | nav-agent |
| 1.3 | Fix theme tokens (light/dark parity) | ✅ Done | nav-agent |
| 1.4 | Remove inline `<style>` !important blocks from HOD HTML | ✅ Done | nav-agent |
| 1.5 | Typography — remove monospace fonts except Plus Jakarta Sans | ✅ Done | nav-agent |
| 1.6 | Remove fake strings (OTPs, hardcoded names, fake stats) | ✅ Done | nav-agent |
| 1.7 | Fix account dropdown (dark theme label, PIN nowrap) | ✅ Done | nav-agent |
| 1.8 | Create `date-utils.js` with `formatTimestamp()` | ✅ Done | nav-agent |
| 1.9 | Card padding & bento layout (24-28px, 28px radius) | ✅ Done | nav-agent |
| 1.10 | Auth guard — remove hardcoded fallback, redirect to /login | ✅ Done | nav-agent |

## Section 2: Real-Time Data Sync

| # | Task | Status | Owner |
|---|------|--------|-------|
| 2.1 | Authoritative roster seeding in startup migration | ✅ Done | backend-agent |
| 2.2 | Fix working_days=88 DB default → nullable | ✅ Done | backend-agent |
| 2.3 | SBTET scraper enhancements (PIN normalization, fallback) | ✅ Done | backend-agent |
| 2.4 | Add `/api/version` endpoint | ✅ Done | backend-agent |
| 2.5 | Connect attendance.js to real backend | ✅ Done | student-agent |
| 2.6 | Connect results.js to real backend | ✅ Done | student-agent |

## Section 3: Document Requests

| # | Task | Status | Owner |
|---|------|--------|-------|
| 3.1 | Backend DB schema (guardian_phone, department), remove OTP | ✅ Done | backend-agent |
| 3.2 | Student doc-request simplification (3 fields, WebSocket) | ✅ Done | student-agent |
| 3.3 | HOD document-approvals (dept-scoped, approve/deny/note, WS) | ✅ Done | hod-agent |

## Section 4: Idea Hub

| # | Task | Status | Owner |
|---|------|--------|-------|
| 4.1 | Backend schema (skills, is_available, invites API) | ✅ Done | backend-agent |
| 4.2 | Idea Hub JS/HTML (real API, WS heartbeat, invites modal) | ✅ Done | student-agent |

## Section 5: Market Hub & Messages

| # | Task | Status | Owner |
|---|------|--------|-------|
| 5.1 | Marketplace backend (image storage, CRUD, WS events) | ✅ Done | backend-agent |
| 5.2 | Marketplace frontend (live data, upload modal, WS) | ✅ Done | student-agent |
| 5.3 | Messages frontend (real threads, category tabs, remove voice) | ✅ Done | student-agent |

## Section 6: HOD Portal

| # | Task | Status | Owner |
|---|------|--------|-------|
| 6.1 | HOD Dashboard enhancements (clickable KPIs, alert list) | ✅ Done | hod-agent |
| 6.2 | HOD Students (detail drawer, calendar, marks, backlogs) | ✅ Done | hod-agent |
| 6.3 | HOD Security Roster (names join, Account Status badge) | ✅ Done | hod-agent |
| 6.4 | PDF & CSV exports everywhere (real content) | ✅ Done | hod-agent |

## Section 7: Motion System

| # | Task | Status | Owner |
|---|------|--------|-------|
| 7.1 | animations.css (stagger, hover lift, drawer, pulse) | ✅ Done | nav-agent |

## Section 8: Tests + Git + Deploy

| # | Task | Status | Owner |
|---|------|--------|-------|
| 8.1 | Write Playwright test suite | ✅ Done | verify-agent |
| 8.2 | Run all tests, fix failures | ✅ Done | verify-agent |
| 8.3 | Git commit + push | ✅ Done | verify-agent |
| 8.4 | Render deployment verification | ✅ Done | verify-agent |
