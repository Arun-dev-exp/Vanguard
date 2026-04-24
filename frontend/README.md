# 🛡️ Vanguard — SOC Dashboard (Frontend)

Next.js application powering the Security Operations Center dashboard.

## Tech Stack

- **Framework:** Next.js 16
- **Styling:** Tailwind CSS 4
- **Language:** JavaScript (JSX)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── page.js     # Main SOC Dashboard
│   │   ├── landing/    # Landing page
│   │   ├── action-center/
│   │   ├── fraud-shield/
│   │   ├── policy-control/
│   │   └── system-health/
│   ├── components/     # Reusable UI components
│   │   ├── layout/     # Dashboard layout, sidebar
│   │   └── shared/     # Shared components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Mock data & API utilities
└── public/             # Static assets
```
