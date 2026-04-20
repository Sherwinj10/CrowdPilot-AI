---
title: CrowdPilot AI
emoji: 🏟️
colorFrom: indigo
colorTo: purple
sdk: docker
pinned: false
---

<div align="center">
    <h1>🏟️ CrowdPilot AI</h1>
    <p><b>Predictive Infrastructure Intelligence & Automated Crowd Logistics</b></p>
</div>

<br/>

## 📖 The Problem
Managing 50,000+ uncoordinated fans in a modern sports venue or festival is an infrastructure nightmare. Severe entrance bottlenecks lead to horrific wait times, frustrated guests passing empty secondary gates, and delayed emergency response deployments. 

## 🚀 The Solution
**CrowdPilot AI** is a production-level routing intelligence engine. Unlike standard static maps, CrowdPilot evaluates live zone congestion, specific ticket seat placement, and user privileges to dynamically generate the most mathematically efficient indoor routing. 

It proactively manages "The Swarm" using localized gamification—technologically incentivizing groups to self-balance the venue’s infrastructure, while giving security teams a real-time Command Center with integrated SOS emergency capabilities.

---

## ⚡ Core Features

### 1. 🎁 Gamified Load Alleviation (Auto-Rerouting)
If the AI detects that a primary entrance exceeds a 15-minute wait time, it actively intervenes. CrowdPilot generates a targeted, pop-up incentive (e.g., *a 20% discount at a specific food stall*) dynamically offered to fans if they accept a secondary, less-congested route. **This solves crowd pile-ups through economics rather than force.**

### 2. 👑 Multi-Tiered VIP Priority Matrix
Premium ticket holders are stripped from the general algorithm and patched into specialized infrastructural nodes. They receive automated instructions to dedicated elevators and private concourses, cutting their wait times down to under 2 minutes regardless of broader venue capacity.

### 3. 🚨 Rapid-Response SOS Protocol
Instead of calling a broad phone line, fans can deploy an invisible 'SOS' via their localized Fan App. This instantly bypasses all systems to drop an uncompromising Red Alert overlay onto the live Admin Dashboard, instantly relaying their exact Sector, Block, Row, and Seat for immediate security team dispatch.

### 4. 🎛️ Command Center Simulator
The Admin Dashboard features a Live Crowd-Multiplier. Administrators can dynamically slide capacity from 50% to 160% and instantly watch how the algorithm predicts threshold breakdowns, updates gate waiting periods, and re-factors cross-zone congestion.

---

## 🛠 Tech Stack

### Frontend (User App & Admin Dashboard)
*   **Framework:** Next.js 14 (App Router Architecture)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (featuring a "Cinematic / Glassmorphism" Design System)
*   **Integration:** Real-time state management via optimized localized polling logic

### Backend (The AI Engine)
*   **Framework:** FastAPI (Python)
*   **Data Persistence:** Headless JSON DB Engine dynamically managing venues `stadiums.json`
*   **Infrastructure:** Monolithic multi-stage Container deployment

### DevOps & Deployment
*   **Containerization:** Docker (`node:20-alpine` -> `python:3.10-slim`)
*   **Hosting:** Fully cloud-hosted on Hugging Face Spaces (Port 7860 binding)
*   **CI/CD:** Automated static compiling logic

---

## 🏗 System Architecture Flow
1. Admin deploys a targeted venue (e.g., M. Chinnaswamy Stadium) alongside all granular infrastructural node data to the Backend DB.
2. The Fan inputs their Ticket data. The React Application issues a request cross-referencing their seat coordinate against the venue matrix.
3. FastAPI evaluates the live crowd multiplier, compares VIP permissions, and pushes an optimal array of transit instructions.
4. If capacity > threshold limits: FastAPI intercepts the standard payload and appends a Gamification Route Override sequence. 

---

## 💻 Run it Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sherwinj10/CrowdPilot-AI.git
   cd CrowdPilot-AI
   ```

2. **Start the Python AI Brain:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Start the React UI:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

***Designed for real-world application. Built for the Hackathon.***
