# 🛡️ Vanguard SOC Dashboard — Antigravity PRD

## 🎯 Objective

Build a **pixel-perfect SOC dashboard frontend** (based on Stitch design) that simulates a real-time fraud intelligence system for banks.

The system must:

* Detect fraud messages
* Display fraud campaigns
* Show extracted entities
* Simulate transaction risk checking
* Enable takedown action

---

## 🧱 Tech Stack

* Next.js (App Router)
* Tailwind CSS
* React Hooks (state management)
* Optional: Framer Motion (for subtle animations)

---

## 🎨 UI Source of Truth

* Use **Stitch MCP design as exact reference**
* DO NOT redesign layout
* Maintain:

  * Colors
  * Spacing
  * Typography
  * Component structure

---

## 📦 Core Components

Create reusable components:

* SidebarNavigation
* TopNavbar
* StatsCards
* CampaignList
* CampaignDetails
* EntityPanel
* ActionPanel
* TransactionRiskChecker
* NotificationToast

---

## 🧭 Navigation (Sidebar Tabs)

* Threat Intel (default screen)
* Fraud Shield
* Action Center
* Policy Control
* System Health

Switching tabs must update main content without page reload.

---

## ⚙️ Core Features

---

### 1. 🧠 Threat Intel (Main Dashboard)

Display:

* Total Scams Detected
* Active Campaigns
* High-Risk Alerts
* System Status (LIVE)

---

### 2. 📂 Campaign List (Left Panel)

* List campaigns with:

  * Name
  * Threat level
  * Report count
* Click → load campaign details

---

### 3. 🧠 Campaign Details (Center Panel)

Display:

* Campaign name
* Threat level
* Sample messages
* Timeline

---

### 4. 🔗 Entity Panel (Right Panel)

Display:

* UPI IDs
* URLs
* Phone numbers

Features:

* Copy button
* Highlight risky entities

---

### 5. 💣 Takedown Action

Button: “Initiate Takedown”

Flow:

1. Click → loading state
2. Show toast:
   “✅ UPI blocked across network”
3. Change button → “Takedown Initiated”

---

### 6. 💳 Transaction Risk Checker

Inputs:

* UPI ID
* Amount

Logic:

* If UPI exists in campaign → HIGH RISK
* Else → SAFE

UI:

* HIGH → red warning card
* SAFE → green success card

---

### 7. ⚡ Real-Time Simulation

* Poll every 3–5 seconds
* Update:

  * Campaign counts
  * Alerts
* Show “Last updated: Xs ago”

---

### 8. 🔔 Notifications

Show toast alerts:

* New scam detected
* Takedown success

---

## 🔌 API Contract (Mock First)

### POST /analyze

Input:

```json
{ "text": "message" }
```

---

### POST /check-upi

Input:

```json
{ "upi_id": "fraud@ybl" }
```

Output:

```json
{
  "risk": "HIGH",
  "campaign": "KYC Scam",
  "reports": 120
}
```

---

### GET /campaigns

Returns campaign list

---

### GET /campaign/{id}

Returns campaign details

---

## 🧪 Demo Mode

* Use mock data
* Simulate:

  * New campaigns
  * Risk detection
  * Alerts

Add toggle:
👉 “Demo Mode ON”

---

## 🎨 UI Behavior Rules

* Dark theme (SOC style)
* Red = danger
* Green = safe
* Smooth transitions only (no heavy animations)
* Hover effects on buttons/cards

---

## ⚡ Performance

* Load < 2 seconds
* No blocking UI
* Handle API failure gracefully

---

## ❌ Out of Scope

* Real payments
* Authentication
* Real NPCI integration
* Mobile UI

---

## 🎬 Expected Demo Flow

1. Open dashboard
2. View campaigns
3. Select campaign
4. See entities
5. Enter UPI in risk checker
6. Show fraud warning
7. Click takedown
8. Show success

---

## 🏆 Final Goal

The system should feel like:

> A real fraud intelligence dashboard used by banks to detect and prevent scams in real-time.

---

## 💣 Success Criteria

* Pixel-perfect UI match with Stitch
* All panels interactive
* Risk checker working
* Takedown flow working
* Smooth demo

---
