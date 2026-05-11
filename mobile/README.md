# Mobile App

React Native + Expo + TypeScript mobile app for STNK Bureau agents.

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Then choose:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web browser

## Project Structure

```
src/
├── app/        # Expo Router app structure
├── screens/    # Full screen components
├── components/ # Reusable UI components
├── hooks/      # Custom React hooks
├── api/        # API client functions
├── store/      # Zustand state management
├── utils/      # Helper functions
├── types/      # TypeScript types & interfaces
└── assets/     # Images, fonts, etc.
```

## Environment Variables

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_TRACKING_BASE_URL=http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start dev server (interactive menu)
- `npm run android` - Open Android emulator
- `npm run ios` - Open iOS simulator
- `npm run web` - Open web browser
- `npm run build` - Build for deployment
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Screens to Build

### Authentication
- Login screen
- Register (info only - admin creates users)

### Home/Dashboard
- Today's revenue
- Pending transactions count
- Quick action buttons
- Transaction history (recent)

### New Transaction
- Customer info form
- Vehicle number input
- Service selection dropdown
- Service pricing display
- Margin/profit display
- Payment method (cash recording)
- Submit button
- Success confirmation with WhatsApp status

### Transaction History
- List of all transactions
- Filter by date, status, service
- Click to view details
- Search by customer name/phone

### Transaction Details
- Full transaction info
- Customer details
- Service details
- Current tracking status
- View tracking link for customer
- Update document stage (dropdown)
- Stage history

### Service Management
- List of available services
- Edit service name
- Edit base price
- Edit margin percentage
- Add new service
- Deactivate service

### Settings
- Profile information
- Bureau information
- Subscription status
- Subscription expiry date
- Staff management
- Logout

### Tracking (View only)
- Customer can see tracking status
- Stage history
- Current status badge

## Components to Build

- LoginForm
- TransactionForm
- CustomerInput
- VehicleInput
- ServiceSelector
- PriceDisplay
- StageSelector
- TransactionList
- TransactionCard
- DashboardCard
- Header
- BottomNavigation
- Modal
- SuccessDialog

## State Management

Using Zustand for:
- Auth state (user, token, bureau info)
- Transaction form data
- UI state (active tab, modals)
- Transaction list cache

## API Integration

Axios instance with:
- Base URL from env
- JWT token injection
- Error handling
- Upload handling for receipts

## Navigation

Expo Router with tabs:
- Home
- New Transaction
- History
- Services
- Settings

## WhatsApp Integration

After transaction creation:
1. Generate e-receipt
2. Create tracking link: `${TRACKING_BASE_URL}/tracking/{token}`
3. Send via API to backend
4. Backend sends via Twilio WhatsApp

## To Implement Next

- [ ] Auth screens (login)
- [ ] Home/Dashboard screen
- [ ] New Transaction screen
- [ ] Transaction History screen
- [ ] Transaction Details screen
- [ ] Service Management screen
- [ ] Settings screen
- [ ] Bottom tab navigation
- [ ] WhatsApp receipt preview
- [ ] Document stage updates
- [ ] Tracking link generation
