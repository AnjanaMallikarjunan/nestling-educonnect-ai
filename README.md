# Nestling - Greenwood Academy EduConnect Portal

Welcome to **Nestling**, a modern school-parent communication and management portal tailored for **Greenwood Academy**. The project is split into clean, modular frontend and backend folders.

---

## 📁 Directory Structure

```text
nestling-educonnect-ai/
 ├── frontend/             # React (Vite) User Interfaces for Parents & Teachers
 ├── backend/              # Node.js Express server connected to SQLite database
 └── package.json          # Root configuration for workspace orchestration
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 2. Installation
To install dependencies for both the frontend and backend in a single command, run from the root directory:
```bash
npm run install:all
```

### 3. Running Locally
To launch both the Vite frontend server and Express backend server concurrently, run:
```bash
npm run dev:all
```
- **Frontend Dashboard**: `http://localhost:5173`
- **Backend APIs**: `http://localhost:3001`

---

## 🛠️ Tech Stack & Architecture

### Frontend (`/frontend`)
- **Framework**: React.js with Vite builder
- **Styling**: Vanilla CSS with custom theme variables (Greenwood Academy layout)
- **State & Actions**: Context API (`AuthContext`) managing real-time data sync with backend endpoints

### Backend (`/backend`)
- **Framework**: Express.js
- **Database**: SQLite (`database.sqlite` file created dynamically on launch)
- **Data Migration**: Startup scripts automatically detect and migrate raw datasets from `database.json` to SQL tables.

---

## ✨ Features & Functionality

1. **Dual Portals**: Dedicated authentication flows and dashboards for **Parents** and **Teachers**.
2. **AI-Powered Insights**: Performance-driven, student-specific **AI Weekly Summaries** and dynamically calculated **Report Cards** generated directly from live SQLite progress logs.
3. **Classroom Messaging**: Lock-constrained direct communication system (active 7:00 PM - 8:00 PM) fully backed by the database.
4. **Academics & Operations**: Track daily ratings, submit leave applications, review assignments, and manage school calendars.
