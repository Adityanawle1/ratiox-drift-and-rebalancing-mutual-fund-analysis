# RatioX 

> **Live Platform:** [ratiox.in](https://ratiox.in)

An asset allocation monitor and portfolio rebalancing engine designed for self-directed investors in India. RatioX continuously tracks **portfolio drift**—the silent asset class deviation caused by market moves—and calculates tax-optimized rebalancing protocols to defend your capital against hidden fees and unnecessary risk.

---

## 📐 The Problem of Portfolio Drift

When you design a target allocation (e.g., **60% Equity, 30% Debt, 10% Gold**), market movements will immediately begin to pull your portfolio out of alignment. If equities rally, your exposure could quietly drift to **75% Equity** without you buying a single share. 

This shifts your risk profile dramatically right before a correction. Conventional broker dashboards only show current value and absolute returns; they do not calculate target deviations, drift thresholds, or the tax impact of restoring balance.

RatioX resolves this by providing **mathematical monitoring** and **one-click rebalancing intelligence** directly on top of your existing holdings.

---

## ✨ Features

### 1. Drift Analysis Engine
Monitors the exact value gap between your actual and target asset classes. Drift is updated dynamically, checking against configured variance thresholds (e.g., alert if drift exceeds 5%).

### 2. Tax-Optimized Rebalancing
Generates buy and sell checklists to bring your portfolio back to target weights. 
* **Inflow Intelligence**: Allows allocating fresh capital (SIPs or lump sums) directly into underweight assets, reducing the need to sell and triggering fewer tax events.
* **Tax Safeguards**: Dynamically tags recommended transactions with Indian tax rules, classifying assets by holding periods into **LTCG** (Long Term Capital Gains: 12.5% tax) and **STCG** (Short Term Capital Gains: 20% tax) to avoid premature selling.

### 3. Mutual Fund Fee Audits
A tracking utility that exposes the compounding wealth decay of regular mutual funds vs. direct funds. It models 30-year projections of your holdings to show how much is lost to silent distributor commission kickbacks.

### 4. Broker Adaptability
Provides support for uploading Consolidated Account Statements (CAS) from **CAMS** and **KFintech**, with integration capabilities for major Indian brokerages such as **Zerodha**, **Upstox**, and **Groww**.

---

## 🛠️ Code Architecture & Math

The platform's core logic is managed in [drift-engine.ts](file:///c:/Users/nawal/OneDrive/Documents/rebalancerrrrrrrrr98990/driftwatch-rebalance-main/src/lib/drift-engine.ts). It enforces strict mathematical logic for portfolio health and drift thresholds:

### Portfolio Drift Formula
$$\text{Drift} = \text{Current \%} - \text{Target \%}$$
$$\text{Value Gap} = \left(\frac{\text{Target \%}}{100} \times \text{Total Portfolio Value}\right) - \text{Current Value}$$

### Health Score Model
The platform assigns a composite score from $0$ to $100$ based on target deviations:
$$\text{Health Score} = 100 - (\text{Average Absolute Deviation} \times 2)$$

```typescript
// Core implementation from src/lib/drift-engine.ts
export function calculateHealthScore(driftResults: DriftResult[]): number {
  if (driftResults.length === 0) return 0;

  const deviations = driftResults.map(d => Math.abs(d.drift));
  const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
  
  // Perfectly balanced portfolio (0% deviation) → 100 health
  const healthScore = Math.max(0, 100 - (avgDeviation * 2));
  return parseFloat(healthScore.toFixed(1));
}
```

---

## ⚙️ Tech Stack

* **Client**: React 18, Vite 5, TypeScript 5, Tailwind CSS
* **Design System**: Glassmorphic DriftWatch HUD using Radix UI primitives & Lucide icons
* **Data Flow**: TanStack Query (React Query) v5
* **Data Layer**: Supabase (PostgreSQL tables, database triggers, Row Level Security)
* **3D Visuals**: Three.js & React Three Fiber (interactive canvas globe)
* **Market Adapter**: Yahoo Finance API integration (via secure server rewrite rules) + AMFI live NAV integration

---

## 📁 Repository Structure

```
├── .kiro/                  # Product specifications and wizard specs
├── migrations/             # PostgreSQL database schemas and table definitions
├── src/
│   ├── api/                # Supabase database CRUD operations
│   ├── components/         # HUD layout panels, 3D Globe, magnetic buttons
│   ├── context/            # Authentication context and session tracking
│   ├── lib/
│   │   ├── drift-engine.ts # Core formulas (CAGR, tax, rebalance orders)
│   │   └── market-data.ts  # Ticker normalization for NSE/BSE & AMFI APIs
│   ├── pages/              # Main router entrypages (Dashboard, AboutUs, LearnDrift)
│   └── main.tsx            # App entrypoint
├── vercel.json             # Reverse proxy routing rules for market API requests
└── tailwind.config.ts      # Tokens for the dark-theme HUD interface
```

---

## 🚀 Environment Setup

Copy the environment variables template file:
```bash
cp .env.example .env
```

Define the connection variables in your `.env`:
```ini
# Supabase Project Credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Live Market API Keys (Optional, fallback mock data is used if empty)
VITE_ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
VITE_NEWSDATA_API_KEY=your-newsdata-key
```

### Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

2. **Run build verification:**
   ```bash
   npm run build
   ```

3. **Deploy to your production domain:**
   The codebase is configured for seamless deployment on Vercel. Pushing to your production branch will trigger auto-builds serving the application at [ratiox.in](https://ratiox.in).

---

## 👥 Authors & Contributions

* **Aditya Nawle** — Core Architecture, Mathematical Engine & Audit Log Logic
* **Anantha Vishwa Priya** — Frontend Architecture, Broker Integrations & System Infrastructure

---

## 📄 License

Copyright (c) 2025-2026 Aditya Nawle and Anantha Vishwa Priya. All rights reserved.

This repository is public for collaborative review and code auditing. Direct commercial repackaging, redistribution, or production mirroring of this codebase without the authors' prior consent is prohibited.
