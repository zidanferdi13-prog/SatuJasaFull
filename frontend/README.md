# Frontend - Web Admin Dashboard

React/Next.js + TypeScript admin dashboard for STNK Bureau Service Management System.

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Dashboard: `http://localhost:3001`

## Project Structure

```
src/
├── app/        # Next.js app router & layout
├── pages/      # Page components (if using pages router)
├── components/ # Reusable UI components
├── hooks/      # Custom React hooks
├── api/        # API client functions
├── store/      # Zustand state management
├── utils/      # Helper functions
└── types/      # TypeScript types & interfaces
```

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME=STNK Bureau Admin
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Pages to Build

### Dashboard
- System-wide statistics
- Recent transactions
- Bureau overview
- Revenue summary

### Bureau Management
- Bureau list with status
- Create new bureau
- Edit bureau details
- Manage subscription (set plan, expiry, status)
- View bureau staff

### Transactions
- View all transactions (all bureaus)
- Filter by date, bureau, status
- Export data
- Transaction details

### Analytics
- Revenue by bureau
- Service popularity
- Customer statistics
- Churn analysis

### Promotions
- Create promotional pricing
- Set discount type (percentage, fixed amount)
- Set expiry date
- View active promotions

## Components to Build

- Navbar/Header
- Sidebar navigation
- Dashboard cards
- Transaction table
- Bureau list/cards
- Modal for forms
- Data tables with filtering
- Charts (Recharts)

## State Management

Using Zustand for:
- Auth state (user, token)
- UI state (open modals, sidebar)
- Transaction filters
- Data caching

## API Integration

Axios instance with:
- Base URL from env
- JWT token injection
- Error handling
- Request/response interceptors

## To Implement Next

- [ ] Auth pages (login, logout)
- [ ] Dashboard layout
- [ ] Bureau management pages
- [ ] Transaction listing & details
- [ ] Analytics dashboards
- [ ] Admin controls
- [ ] Subscription management UI
- [ ] Promotional pricing UI
