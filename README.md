# 🛡️ FluidHR SaaS Protocol

> **High-Fidelity Human Resource Management Orchestration**

FluidHR is a state-of-the-art, full-stack HRMS designed with a high-contrast, "Binance-inspired" aesthetic. It leverages a 4-module node architecture to provide specialized interfaces for Admin, HR, Manager, and Employee personnel.

---

## 🏗️ System Architecture

FluidHR operates on a unified cross-linked node structure:

- **Admin Node:** Global system orchestration, user creation, and infrastructure settings.
- **HR Node:** Talent acquisition, organizational attendance tracking, and leave moderation.
- **Manager Node:** Team performance telemetry, review management, and pulse monitoring.
- **Employee Node:** Personal workspace, live time-tracking, and leave justification protocols.

---

## 🎨 Design Ontology (Liquid High-Contrast)

The interface follows the **FluidHR SaaS Aesthetic**:
- **Palette:** High-Contrast Obsidian (`#222126`), Fluid Gold (`#F0B90B`), and Neutral Zinc (`#848E9C`).
- **Typography:** Manrope & Inter (Heavy weights for protocol headers).
- **Interactions:** Hover-reveal sidebars, pulsing sync indicators, and micro-animated data transitions.
- **UI Logic:** 256-bit look & feel using absolute focus on tabular data and real-time synchronization.

---

## 📁 Repository Map

```text
Hrm/
├── frontend/
│   ├── admin/                # Main React Protocol (Vite + Tailored CSS)
│   │   ├── src/pages/        # Role-based segment views
│   │   └── src/App.jsx       # Global Routing & Protection Engine
│   └── shared/               # Shared Architecture
│       ├── layouts/          # Topbar & Dynamic Sidebar (Tab Isolated)
│       └── pages/            # Shared Login, Profile, and Landing logic
├── backend/
│   ├── controllers/          # API Orchestration
│   ├── models/               # Multi-collection data schemas
│   └── index.js              # Central Logic Server
└── README.md                 # System Manual
```

---

## 🚀 Execution Protocol

### 1. Backend Core
```bash
cd backend
npm install
# Update .env with MONGODB_URI & JWT_SECRET
npm run dev
```

### 2. Frontend Nexus
```bash
cd frontend/admin
npm install
npm run dev

## 🛠️ Key Features
- **Tab Isolation:** Independent role management per browser tab.
- **Active Protocol Time:** Real-time topbar clock synchronization.
- **Automatic Sidebar:** Precision hover-based navigation reveal.
- **Leave justification:** Native transmission protocols for employee time-off.

---
© 2026 FluidHR SaaS Protocol | *Securing Personnel Logic*
