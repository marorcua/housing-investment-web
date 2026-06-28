# Housing Investment Web

Dashboard UI for tracking real estate investments. Connects to the Housing Investment API.

Built with [Astro](https://astro.build/), [React](https://react.dev/), [TanStack Query](https://tanstack.com/query), and [Tailwind CSS](https://tailwindcss.com/).

## Setup

```bash
npm install
PUBLIC_API_URL=http://localhost:3000 npm run dev
```

## Environment

| Variable | Default | Description |
|---|---|---|
| `PUBLIC_API_URL` | `http://localhost:3000` | URL of the housing-investment-api |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Features

- **Global Overview** — dual-bar SVG chart comparing revenue vs expenses across all properties (annual/monthly toggle)
- **Per-property cards** — purchase price, annual revenue, tax deductions, net yield, net cashflow
- **Tenant management** — create/edit/terminate/delete leases with monthly rent
- **Loan management** — register mortgages/loans with French amortization calculation
- **Recurring expenses** — register insurance, IBI, community fees, etc.
- **Cashflow calendar** — monthly breakdown with synthetic entries for tenant rent, loan payments, and recurring expenses; inline edit/delete for manual transactions
- **Auth** — JWT login page, token stored in localStorage

## Tech Stack

- **Framework:** Astro 5 + React 19
- **Data fetching:** TanStack Query
- **Styling:** Tailwind CSS 3
- **Charts:** Pure SVG (no charting library)
- **Icons:** Lucide React
