# Mobile Architecture — Jasaku Tenant App

## Overview
Expo SDK ~50 + expo-router v3 (file-based routing) mobile application for SatuJasa Service Management SaaS. Tenant operational app used by bureau owners/admins.

## Stack
| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK ~50 (managed workflow) |
| Routing | expo-router v3 (file-based) |
| Language | TypeScript (strict mode) |
| Server State | TanStack Query v5 |
| Client State | Zustand v4 |
| HTTP | Axios v1 + custom interceptor |
| Forms | React Hook Form + @hookform/resolvers + Zod |
| Storage | @react-native-async-storage/async-storage |
| UI | StyleSheet + react-native-paper (icons via @expo/vector-icons) |

## Folder Structure

```
mobile/src/
├── app/                        # expo-router pages (file-based routing)
│   ├── _layout.tsx             # Root layout with AuthGuard
│   ├── queryClient.ts          # TanStack QueryClient singleton
│   ├── AppProvider.tsx         # QueryClientProvider + hydration
│   ├── subscription-expired.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx           # Phone + password login
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab navigator (5 tabs)
│   │   ├── dashboard.tsx       # KPI cards + branch selector
│   │   ├── transactions.tsx    # Transaction list + status filter
│   │   ├── tracking.tsx        # Public tracking search
│   │   ├── revenue.tsx         # Revenue analytics
│   │   └── settings.tsx        # Settings hub
│   ├── customers/
│   │   ├── index.tsx           # Customer list
│   │   ├── create.tsx          # Create customer form
│   │   ├── [id].tsx            # Customer detail
│   │   └── [id]/edit.tsx       # Edit customer form
│   ├── vehicles/
│   │   ├── index.tsx           # Vehicle list
│   │   ├── create.tsx          # Create vehicle form
│   │   ├── [id].tsx            # Vehicle detail
│   │   └── [id]/edit.tsx       # Edit vehicle form
│   ├── transactions/
│   │   ├── create.tsx          # Multi-step create transaction
│   │   ├── [id].tsx            # Transaction detail + actions
│   │   ├── [id]/status.tsx     # Update transaction status
│   │   ├── [id]/finalize.tsx   # Finalize prices per item
│   │   └── [id]/close.tsx      # Close transaction + final payment
│   ├── branches/
│   │   └── index.tsx           # Branch list + create
│   └── settings/
│       ├── profile.tsx         # User profile
│       ├── branding.tsx        # Tenant branding + logo upload
│       ├── whatsapp.tsx        # WhatsApp template
│       ├── pricing.tsx         # Pricing rules management
│       └── subscription.tsx    # Subscription status
├── modules/                    # Feature modules (service + hooks)
│   ├── auth/
│   ├── dashboard/
│   ├── customers/
│   ├── vehicles/
│   ├── transactions/
│   ├── branches/
│   └── settings/
├── shared/
│   ├── constants/index.ts      # STATUS_LABELS, STATUS_COLORS, STATUS_TRANSITION, etc.
│   ├── services/
│   │   ├── api-client.ts       # Axios instance with refresh token interceptor
│   │   ├── api-error.ts        # ApiError class + getErrorMessage()
│   │   └── storage.ts          # AsyncStorage wrapper
│   └── types/index.ts          # All shared TypeScript interfaces
├── store/
│   └── authStore.ts            # Zustand: user, tokens, selectedBranch, hydrate()
└── theme/
    └── index.ts                # Colors, Spacing, Typography, BorderRadius, Shadow
```

## Auth Flow
1. App starts → `AppProvider` calls `authStore.hydrate()` to load tokens from AsyncStorage
2. `AuthGuard` in `_layout.tsx` watches `isHydrated`, `user`, `isSubscriptionExpired`, `segments`
3. Unauthenticated → redirect to `/(auth)/login`
4. Subscription expired (402 response) → redirect to `/subscription-expired`
5. Authenticated → proceed to `/(tabs)/dashboard`

## Token Refresh
`api-client.ts` handles 401 responses automatically:
- Uses `isRefreshing` flag + `pendingQueue` to batch concurrent requests
- On 401: calls `POST /auth/refresh` with stored refresh token
- On success: retries all queued requests with new access token
- On failure: calls `logoutCallback` (registered from `AppProvider`)

## Multi-Branch Support
- `useAuthStore.selectedBranch` — currently selected branch
- Dashboard KPIs automatically filter by selected branch when set
- Branch selector accessible from dashboard header
