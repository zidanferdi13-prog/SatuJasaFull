# STNK Bureau Frontend Architecture

## Enterprise-Grade Multi-Tenant SaaS Frontend System

---

# 1. SYSTEM OVERVIEW

```
┌──────────────────────────────────────────────────────┐
│                  FRONTEND ECOSYSTEM                   │
│                                                      │
│  ┌─────────────────────┐  ┌─────────────────────────┐│
│  │   MOBILE APP         │  │  SUPER ADMIN DASHBOARD  ││
│  │   (React Native)     │  │  (React + Vite)         ││
│  │                      │  │                         ││
│  │  Tenant Operations   │  │  Platform Management    ││
│  │  - Transactions      │  │  - Tenant CRUD          ││
│  │  - Tracking          │  │  - Subscriptions        ││
│  │  - Revenue           │  │  - Monitoring           ││
│  │  - Customers         │  │  - Analytics            ││
│  └──────────┬───────────┘  └───────────┬─────────────┘│
│             │                          │              │
│             └──────────┬───────────────┘              │
│                        ▼                              │
│              ┌─────────────────┐                      │
│              │   API LAYER     │                      │
│              │   (Axios)       │                      │
│              │   /api/v1/*     │                      │
│              └────────┬────────┘                      │
│                       ▼                               │
│              ┌─────────────────┐                      │
│              │  BACKEND API    │                      │
│              │  (Express)      │                      │
│              └─────────────────┘                      │
└──────────────────────────────────────────────────────┘
```

---

# 2. SHARED ARCHITECTURE PRINCIPLES

## 2.1 Technology Stack (Both Apps)

| Concern | Mobile | Web Admin |
|:--------|:-------|:----------|
| **Framework** | React Native | React 18 |
| **Language** | TypeScript 5.x | TypeScript 5.x |
| **Build** | Expo / Metro | Vite 5 |
| **Navigation** | React Navigation 6 | React Router 6 |
| **Server State** | TanStack Query 5 | TanStack Query 5 |
| **Client State** | Zustand 4 | Zustand 4 |
| **Forms** | React Hook Form + Zod | React Hook Form + Zod |
| **HTTP** | Axios | Axios |
| **Styling** | NativeWind (Tailwind RN) | Tailwind CSS 3 |
| **UI Kit** | Custom components | ShadCN UI |
| **Storage** | MMKV | localStorage |

## 2.2 Architecture Pattern

```
Feature-Based Modular Architecture

Each feature module contains:
├── screens/          # Screen-level components
├── components/       # Feature-specific components
├── hooks/            # Custom hooks (queries, mutations, logic)
├── services/         # API service functions
├── types/            # TypeScript interfaces
└── validators/       # Zod schemas
```

## 2.3 Data Flow

```
UI Component
    │
    ▼
Custom Hook (useQuery / useMutation)
    │
    ▼
API Service Layer (api/transactions.ts)
    │
    ▼
Axios Instance (interceptors, auth, error handling)
    │
    ▼
Backend REST API (/api/v1/*)
```

## 2.4 Component Hierarchy

```
App
├── ErrorBoundary
├── AuthProvider (Zustand)
├── QueryClientProvider (TanStack Query)
├── NavigationContainer / BrowserRouter
│   ├── AuthScreen / LoginPage
│   └── MainNavigator / DashboardLayout
│       ├── BottomTabs / SidebarNav
│       ├── Screen Modules
│       └── Shared Components
└── ToastProvider (notifications)
```

---

# 3. STATE MANAGEMENT STRATEGY

## 3.1 Zustand Stores (Client State)

```typescript
// authStore.ts
interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  setUser: (user: User) => void;
}

// branchStore.ts (Mobile)
interface BranchStore {
  branches: Branch[];
  selectedBranch: Branch | null;
  selectBranch: (branch: Branch) => void;
}

// uiStore.ts
interface UIStore {
  isLoading: boolean;
  toastMessage: string | null;
  showToast: (message: string) => void;
  clearToast: () => void;
}
```

## 3.2 TanStack Query (Server State)

```typescript
// Pattern for all data fetching
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionService.list(filters),
    staleTime: 30_000,        // 30 seconds fresh
    gcTime: 5 * 60_000,       // 5 min garbage collection
    refetchOnWindowFocus: true,
  });
}

// Pattern for all mutations
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
}
```

## 3.3 State Separation Rule

| State Type | Tool | Examples |
|:-----------|:-----|:---------|
| Server data | TanStack Query | Transactions, Customers, KPIs |
| Auth session | Zustand | User, Token, Role |
| UI preferences | Zustand | Selected branch, Theme |
| Form state | React Hook Form | Input values, validation |
| URL params | Router | Filters, Pagination, Search |

---

# 4. API INTEGRATION ARCHITECTURE

## 4.1 Centralized Axios Instance

```typescript
// shared/services/api.ts
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor - Attach JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired → attempt refresh
      const refreshed = await useAuthStore.getState().refreshSession();
      if (!refreshed) {
        useAuthStore.getState().logout();
        navigation.navigate('Login');
      }
      return api.request(error.config); // Retry
    }
    if (error.response?.status === 402) {
      // Subscription expired
      showToast('Subscription expired. Contact admin.');
    }
    return Promise.reject(normalizeError(error));
  }
);
```

## 4.2 API Service Layer Pattern

```typescript
// modules/transactions/services/transaction.service.ts
export const transactionService = {
  list: (filters?: TransactionFilters): Promise<Transaction[]> =>
    api.get('/transactions', { params: filters }).then(r => r.data),

  getById: (id: string): Promise<Transaction> =>
    api.get(`/transactions/${id}`).then(r => r.data),

  create: (data: CreateTransactionDTO): Promise<Transaction> =>
    api.post('/transactions', data).then(r => r.data),

  updateStatus: (id: string, status: string): Promise<Transaction> =>
    api.patch(`/transactions/${id}/status`, { status }).then(r => r.data),

  search: (q: string): Promise<Transaction[]> =>
    api.get('/transactions/search', { params: { q } }).then(r => r.data),
};
```

---

# 5. AUTHENTICATION FLOW

## 5.1 Mobile App Auth Flow

```
App Launch
    │
    ▼
Check stored token (MMKV)
    │
    ├── Token exists ──► Validate with /auth/refresh
    │                        │
    │                        ├── Valid ──► Main App
    │                        └── Expired ──► Login Screen
    │
    └── No token ──► Login Screen
                        │
                        ▼
                   Email + Password
                        │
                        ▼
                   POST /auth/login
                        │
                        ▼
              Store token + user in Zustand
              Store token in MMKV (persistent)
                        │
                        ▼
                    Main App
```

## 5.2 Web Admin Auth Flow

Same flow, but `localStorage` replaces MMKV.

## 5.3 Token Lifecycle

| Token | Duration | Storage | Purpose |
|:------|:---------|:--------|:--------|
| Access Token | 24 hours | MMKV/localStorage | API authorization |
| User Object | Session | Zustand (memory) | UI context |

## 5.4 Subscription Expired Handling

```typescript
// 402 response → Show full-screen modal
function SubscriptionExpiredModal() {
  return (
    <Modal visible={true}>
      <Text>Subscription Expired</Text>
      <Text>Contact platform admin to renew</Text>
      <Button onPress={logout}>OK</Button>
    </Modal>
  );
}
```

---

# 6. FORM ARCHITECTURE

## 6.1 Pattern (React Hook Form + Zod)

```typescript
// modules/transactions/validators/transaction.schema.ts
import { z } from 'zod';

export const createTransactionSchema = z.object({
  customerId: z.string().uuid('Select a customer'),
  items: z.array(z.object({
    vehicleId: z.string().uuid('Select a vehicle'),
    serviceId: z.string().uuid('Select a service'),
    price: z.number().min(1, 'Price required'),
  })).min(1, 'At least one service required'),
  dpAmount: z.number().min(0, 'DP cannot be negative'),
  estimatedFinishDate: z.string().optional(),
});

export type CreateTransactionForm = z.infer<typeof createTransactionSchema>;
```

## 6.2 Usage in Component

```typescript
function TransactionForm() {
  const form = useForm<CreateTransactionForm>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: { dpAmount: 0, items: [] },
  });

  const createMutation = useCreateTransaction();

  const onSubmit = form.handleSubmit((data) => {
    createMutation.mutate(data, {
      onSuccess: (result) => {
        showToast(`Transaction ${result.invoiceNumber} created`);
        navigation.goBack();
      },
    });
  });

  return (
    <FormProvider {...form}>
      <CustomerSelect />
      <VehicleList />
      <ServiceSelect />
      <PriceInput />
      <DPInput />
      <SubmitButton loading={createMutation.isPending} />
    </FormProvider>
  );
}
```

---

# 7. ERROR HANDLING ARCHITECTURE

## 7.1 Layers

```
┌─────────────────────────────┐
│   ErrorBoundary (React)     │  ← Catches render errors
├─────────────────────────────┤
│   Toast Notifications       │  ← User-facing messages
├─────────────────────────────┤
│   API Interceptor           │  ← Normalizes API errors
├─────────────────────────────┤
│   TanStack Query onError    │  ← Per-query error handling
└─────────────────────────────┘
```

## 7.2 Implementation

```typescript
// 1. Global Error Boundary
class AppErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    logError(error);
    // Show fallback UI
  }
}

// 2. API Error Normalizer
function normalizeError(error: AxiosError): AppError {
  return {
    message: error.response?.data?.error || 'Something went wrong',
    code: error.response?.status || 500,
    field: error.response?.data?.field,
  };
}

// 3. Offline detection
function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const handler = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    return () => { /* cleanup */ };
  }, []);
  return isOnline;
}
```

---

# 8. PERFORMANCE OPTIMIZATION

## 8.1 Strategy Matrix

| Technique | Where | Why |
|:----------|:------|:----|
| `React.memo` | KPI cards, list items | Prevent re-renders when parent updates |
| `useMemo` | Computed values (totals, filters) | Avoid recalculations |
| `useCallback` | Event handlers passed to children | Stable references |
| Lazy loading | Screens (React.lazy + Suspense) | Reduce initial bundle |
| Query caching | TanStack Query `staleTime` | Reduce network calls |
| Optimistic updates | Status changes, simple edits | Instant UI feedback |
| Pagination | All lists | Limit render count |
| Virtualization | FlatList (RN), virtual list (Web) | Large lists |
| Image optimization | Thumbnails, lazy load | Bandwidth |

## 8.2 Mobile-Specific Optimizations

```typescript
// Use FlashList instead of FlatList for large lists
import { FlashList } from '@shopify/flash-list';

// MMKV for fast key-value storage (faster than AsyncStorage)
import { MMKV } from 'react-native-mmkv';
const storage = new MMKV();

// InteractionManager for heavy post-navigation work
import { InteractionManager } from 'react-native';
useEffect(() => {
  InteractionManager.runAfterInteractions(() => {
    loadHeavyData();
  });
}, []);
```

---

# 9. MOBILE APP DETAILED DESIGN

## 9.1 Folder Structure

```
mobile/
├── src/
│   ├── app/                    # Expo Router entry
│   │   ├── _layout.tsx         # Root layout (tabs)
│   │   ├── index.tsx           # Login screen
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx     # Tab navigator
│   │   │   ├── dashboard.tsx
│   │   │   ├── transactions.tsx
│   │   │   ├── tracking.tsx
│   │   │   ├── revenue.tsx
│   │   │   └── settings.tsx
│   │   └── (modals)/
│   │       ├── transaction-create.tsx
│   │       ├── customer-form.tsx
│   │       └── tracking-detail.tsx
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── services/auth.service.ts
│   │   │   ├── hooks/useAuth.ts
│   │   │   └── validators/login.schema.ts
│   │   ├── dashboard/
│   │   │   ├── components/KpiCard.tsx
│   │   │   ├── hooks/useDashboardKpis.ts
│   │   │   └── services/dashboard.service.ts
│   │   ├── transactions/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   │   ├── TransactionCard.tsx
│   │   │   │   ├── TransactionForm.tsx
│   │   │   │   ├── CustomerSelect.tsx
│   │   │   │   ├── VehiclePicker.tsx
│   │   │   │   └── StatusBadge.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── validators/
│   │   ├── customers/
│   │   │   ├── components/CustomerCard.tsx
│   │   │   ├── hooks/useCustomers.ts
│   │   │   └── services/customer.service.ts
│   │   ├── tracking/
│   │   │   ├── components/TrackingTimeline.tsx
│   │   │   └── hooks/useTracking.ts
│   │   ├── revenue/
│   │   │   ├── components/RevenueCard.tsx
│   │   │   └── hooks/useRevenue.ts
│   │   ├── settings/
│   │   │   ├── components/
│   │   │   │   ├── LogoUpload.tsx
│   │   │   │   ├── BranchManager.tsx
│   │   │   │   └── PricingEditor.tsx
│   │   │   └── hooks/
│   │   ├── branches/
│   │   │   └── hooks/useBranches.ts
│   │   └── subscription/
│   │       └── components/SubscriptionInfo.tsx
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── Toast.tsx
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   ├── useNetworkStatus.ts
│   │   │   └── usePagination.ts
│   │   ├── services/
│   │   │   └── api.ts          # Axios instance
│   │   ├── utils/
│   │   │   ├── format.ts       # Currency, date formatters
│   │   │   ├── share.ts        # WhatsApp share helper
│   │   │   └── storage.ts      # MMKV wrapper
│   │   ├── constants/
│   │   │   ├── api.ts          # API endpoints
│   │   │   └── theme.ts        # Colors, spacing
│   │   ├── types/
│   │   │   └── index.ts        # Shared TypeScript types
│   │   └── validators/
│   │       └── common.ts       # Phone, plate number schemas
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── branchStore.ts
│   │   └── uiStore.ts
│   │
│   └── theme/
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
```

## 9.2 Bottom Navigation (5 Tabs)

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│Dashboard │Transaksi │ Tracking │ Revenue  │Settings  │
│   📊     │   📝     │   📍     │   💰     │   ⚙️     │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

## 9.3 Screen Specifications

### Dashboard Screen
```
┌─────────────────────────────┐
│  Halo, [Bureau Name]        │  ← Header (blue bg)
│  Selamat datang             │
├─────────────────────────────┤
│ ┌─────────┐  ┌───────────┐  │
│ │ Rp xxx   │  │  12 Trx   │  │  ← KPI Cards (2x2 grid)
│ │ Revenue  │  │  Active   │  │
│ └─────────┘  └───────────┘  │
│ ┌─────────┐  ┌───────────┐  │
│ │  5 Ready │  │  3 Overdue│  │
│ │  Pickup  │  │           │  │
│ └─────────┘  └───────────┘  │
├─────────────────────────────┤
│  Monthly Revenue            │
│  ┌─────────────────────┐    │
│  │ Rp 15.000.000       │    │  ← Large KPI card
│  └─────────────────────┘    │
├─────────────────────────────┤
│  [Refresh]                  │  ← Pull-to-refresh
└─────────────────────────────┘
```

### Transaction List Screen
```
┌─────────────────────────────┐
│  [🔍 Search...]     [+ New] │  ← Search bar + FAB
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ INV/ARJ/2026/05/0001    │ │  ← Transaction card
│ │ Budi Santoso · BL 1234  │ │
│ │ ON_PROCESS    Rp 500K   │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ INV/ARJ/2026/05/0002    │ │
│ │ Ani Wijaya · BL 5678    │ │
│ │ READY_PICKUP  Rp 750K   │ │
│ └─────────────────────────┘ │  ← Infinite scroll list
│          ...                 │
└─────────────────────────────┘
```

### Create Transaction Flow (Under 1 Minute)
```
Step 1: Select Customer          Step 2: Add Vehicle
┌─────────────────────────┐     ┌─────────────────────────┐
│ [🔍 Search customer...] │     │ Plate Number: [____]    │
│ ┌─────────────────────┐ │     │ Model: [____]           │
│ │ ○ Existing Customer │ │     │ Year: [____]            │
│ │ ○ Create New        │ │     │                         │
│ └─────────────────────┘ │     │ [+ Add Another Vehicle] │
│                         │     │                         │
│       [Next →]          │     │       [Next →]          │
└─────────────────────────┘     └─────────────────────────┘

Step 3: Select Service            Step 4: Price & Submit
┌─────────────────────────┐     ┌─────────────────────────┐
│ ○ STNK Perpanjangan     │     │ Estimated Price:        │
│ ○ Balik Nama            │     │ [Rp 500.000_______]     │
│ ○ Mutasi                │     │                         │
│ ○ Custom                │     │ DP Amount:              │
│                         │     │ [Rp 100.000_______]     │
│                         │     │                         │
│       [Next →]          │     │ Est. Finish: [date]     │
│                         │     │                         │
│                         │     │ [Create Transaction]    │
└─────────────────────────┘     └─────────────────────────┘
```

## 9.4 Reusable Mobile Components

```typescript
// KPI Card
<KpiCard
  icon="cash"
  iconColor="#4CAF50"
  label="Revenue Today"
  value={`Rp ${formatCurrency(amount)}`}
/>

// Transaction Card
<TransactionCard
  invoiceNumber="INV/ARJ/2026/05/0001"
  customerName="Budi Santoso"
  plateNumber="BL 1234 AB"
  status="ON_PROCESS"
  amount={500000}
  onPress={() => navigateToDetail(id)}
/>

// Search Bar
<SearchBar
  placeholder="Search plate number, invoice, name..."
  onSearch={handleSearch}
  debounceMs={300}
/>

// Status Badge
<StatusBadge status="READY_TO_PICKUP" />
// Renders colored pill: ● READY_TO_PICKUP (blue)

// Empty State
<EmptyState
  icon="inbox-outline"
  message="No transactions yet"
/>

// Loading State
<LoadingState message="Loading transactions..." />
```

---

# 10. SUPER ADMIN WEB DASHBOARD

## 10.1 Folder Structure

```
frontend/
├── src/
│   ├── app/                     # App entry
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── routes/
│   │   └── index.tsx            # Route definitions
│   │
│   ├── layouts/
│   │   ├── DashboardLayout.tsx  # Sidebar + TopBar + Content
│   │   └── AuthLayout.tsx       # Centered card layout
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── pages/LoginPage.tsx
│   │   │   ├── hooks/useLogin.ts
│   │   │   └── services/auth.service.ts
│   │   ├── dashboard/
│   │   │   ├── pages/DashboardPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── KpiGrid.tsx
│   │   │   │   ├── TenantTable.tsx
│   │   │   │   └── StatusOverview.tsx
│   │   │   └── hooks/useAdminKpis.ts
│   │   ├── tenants/
│   │   │   ├── pages/
│   │   │   │   ├── TenantListPage.tsx
│   │   │   │   ├── TenantCreatePage.tsx
│   │   │   │   └── TenantDetailPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── TenantForm.tsx
│   │   │   │   ├── TenantStatusBadge.tsx
│   │   │   │   └── SubscriptionEditor.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useTenants.ts
│   │   │   │   └── useTenantMutations.ts
│   │   │   └── validators/tenant.schema.ts
│   │   ├── subscriptions/
│   │   │   ├── components/SubscriptionTimeline.tsx
│   │   │   └── hooks/useSubscriptions.ts
│   │   ├── transactions/
│   │   │   ├── pages/TransactionMonitorPage.tsx
│   │   │   ├── components/TransactionTable.tsx
│   │   │   └── hooks/useAllTransactions.ts
│   │   ├── services/
│   │   │   ├── pages/ServiceTypesPage.tsx
│   │   │   └── hooks/useServiceTypes.ts
│   │   ├── monitoring/
│   │   │   ├── pages/SystemMonitorPage.tsx
│   │   │   └── hooks/useSystemHealth.ts
│   │   └── settings/
│   │       └── pages/SettingsPage.tsx
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── DataTable.tsx         # Generic sortable/filterable table
│   │   │   ├── Modal.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── ui/                       # ShadCN UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── toast.tsx
│   │   │   └── tabs.tsx
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   └── usePagination.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   └── cn.ts                # Tailwind class merge
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   └── uiStore.ts
│   │   ├── constants/
│   │   │   └── routes.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   └── theme/
│       ├── colors.ts
│       └── globals.css
```

## 10.2 Route Structure

```typescript
// routes/index.tsx
<Routes>
  {/* Public */}
  <Route path="/login" element={<LoginPage />} />
  
  {/* Super Admin (Protected) */}
  <Route element={<ProtectedRoute roles={['SUPER_ADMIN']} />}>
    <Route element={<DashboardLayout />}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/tenants" element={<TenantListPage />} />
      <Route path="/tenants/create" element={<TenantCreatePage />} />
      <Route path="/tenants/:id" element={<TenantDetailPage />} />
      <Route path="/transactions" element={<TransactionMonitorPage />} />
      <Route path="/services" element={<ServiceTypesPage />} />
      <Route path="/monitoring" element={<SystemMonitorPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
  </Route>
</Routes>
```

## 10.3 Dashboard Layout

```
┌──────────────────────────────────────────────────────┐
│  STNK Bureau Admin    [🔔] [👤 Admin] [Logout]       │ ← TopBar
├──────────┬───────────────────────────────────────────┤
│          │                                           │
│ Dashboard│  ┌──────┬──────┬──────┬──────┐            │
│ Tenants  │  │ 12   │ 10   │ 342  │ 2    │            │
│ Transaksi│  │Active│Active│Total │Expir.│  ← KPI Grid│
│ Services │  │Tenant│User  │Trx   │Subs  │            │
│ Monitor  │  └──────┴──────┴──────┴──────┘            │
│ Settings │                                           │
│          │  ┌──────────────────────────┐             │
│          │  │ Recent Tenants           │             │
│          │  │ Name  │Sub End │Status   │             │
│          │  │ ARJ   │Jun 26  │ACTIVE   │             │
│          │  │ BJA   │May 15  │EXPIRED  │             │
│          │  │ MTR   │Dec 26  │ACTIVE   │             │
│          │  └──────────────────────────┘             │
│          │                                           │
├──────────┴───────────────────────────────────────────┤
│  v1.0.0  ·  STNK Bureau Platform                     │ ← Footer
└──────────────────────────────────────────────────────┘
```

## 10.4 Tenant Management Page

```
┌──────────────────────────────────────────────────────┐
│  Tenants                          [+ Create Tenant]  │
├──────────────────────────────────────────────────────┤
│  [🔍 Search...]  [Status ▼]  [Sort ▼]                │
├──────────────────────────────────────────────────────┤
│  Name        │Code │Sub End  │Trx  │Status  │Actions │
│──────────────┼─────┼─────────┼─────┼────────┼────────│
│  Biro ARJ    │ARJ  │Jun 2026 │45   │ACTIVE  │Edit ⚙  │
│  Biro BJA    │BJA  │May 2026 │12   │EXPIRED │Edit ⚙  │
│  Biro MTR    │MTR  │Dec 2026 │89   │ACTIVE  │Edit ⚙  │
├──────────────────────────────────────────────────────┤
│  ← 1  2  3  →  (10 per page)                         │
└──────────────────────────────────────────────────────┘
```

## 10.5 Create Tenant Form

```typescript
const createTenantSchema = z.object({
  code: z.string().min(3).max(5).toUpperCase(),
  name: z.string().min(3, 'Tenant name required'),
  ownerEmail: z.string().email('Valid email required'),
  ownerPassword: z.string().min(8, 'Min 8 characters'),
  subscriptionMonths: z.number().min(1).max(24),
});
```

---

# 11. PUBLIC TRACKING PAGE

## 11.1 Architecture

```
URL: https://tracking.domain.com/TRX-ARJ-001

┌─────────────────────────────────────────────┐
│         [Tenant Logo]                       │
│       Biro Jasa ARJ Jakarta                 │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  ● Dokumen Diterima   12 May 2026     │  │
│  │  ● Verifikasi         12 May 2026     │  │
│  │  ● Processing         13 May 2026     │  │  ← Timeline
│  │  ○ Ready to Pickup    (pending)       │  │
│  │  ○ Completed          (pending)       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Status: ON_PROCESS                         │
│  Est. Finish: 20 May 2026                   │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Invoice: INV/ARJ/2026/05/0001         │  │
│  │ Customer: Budi Santoso                │  │
│  │ Vehicle: BL 1234 AB                   │  │
│  │ Service: STNK Perpanjangan            │  │
│  │ Total: Rp 500.000                     │  │
│  │ DP: Rp 100.000                        │  │
│  │ Remaining: Rp 400.000                 │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 11.2 Technology

- **Pure React** (integrated into Next.js `/tracking/[token]` route)
- **No auth required** — public endpoint
- **Server-side rendered** for SEO and fast initial paint
- **Fully responsive** — works on mobile browsers

---

# 12. DESIGN SYSTEM

## 12.1 Color Palette

```
Primary:     #007AFF   (Blue - actions, tabs, headers)
Success:     #4CAF50   (Green - completed, paid)
Warning:     #FF9800   (Orange - pending, in process)
Danger:      #F44336   (Red - expired, error, overdue)
Info:        #2196F3   (Light blue - ready pickup)

Background:  #F5F5F5   (Light gray - page bg)
Surface:     #FFFFFF   (White - cards, inputs)
Text:        #333333   (Dark - primary text)
TextLight:   #999999   (Gray - secondary text)
Border:      #E5E5E5   (Light gray - dividers)
```

## 12.2 Typography (Mobile)

```
Heading:   28px / Bold     → Screen titles
Subheading:20px / SemiBold → Card titles
Body:      16px / Regular  → Main content
Caption:   14px / Regular  → Secondary info
Small:     12px / Regular  → Timestamps, labels
```

## 12.3 Spacing Scale (4px grid)

```
xs:  4px
sm:  8px
md:  12px
lg:  16px
xl:  20px
2xl: 24px
3xl: 32px
```

## 12.4 Touch Target Size (Mobile)

- Minimum touch target: **44x44px**
- Button minimum height: **48px**
- Input minimum height: **44px**
- Card padding: **16px** minimum

---

# 13. SHARED COMPONENT LIBRARY

## 13.1 Mobile Shared Components

```typescript
// Button variants
<Button variant="primary" size="lg" loading={false} onPress={fn}>
  Create Transaction
</Button>
// variants: primary | secondary | danger | ghost
// sizes: sm | md | lg

// Input with validation
<FormInput
  name="phone"
  label="Phone Number"
  placeholder="08xxxxxxxxxx"
  keyboardType="phone-pad"
/>

// Card
<Card>
  <Card.Title>Revenue Today</Card.Title>
  <Card.Value>Rp 5.000.000</Card.Value>
</Card>

// Modal (bottom sheet on mobile)
<BottomSheet visible={true} onClose={fn}>
  <Text>Select Customer</Text>
  ...
</BottomSheet>
```

## 13.2 Web Shared Components

```typescript
// DataTable (generic)
<DataTable
  columns={columns}
  data={data}
  pagination={{ page, pageSize, total }}
  onSort={handleSort}
  onFilter={handleFilter}
/>

// PageHeader
<PageHeader
  title="Tenants"
  description="Manage your SaaS tenants"
  action={<Button>+ New Tenant</Button>}
/>

// Modal
<Modal open={open} onClose={fn} title="Edit Subscription">
  <SubscriptionEditor tenant={tenant} />
</Modal>
```

---

# 14. SEARCH SYSTEM

## 14.1 Architecture

```typescript
// Debounced search hook
function useSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const searchResults = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchService.globalSearch(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  return { query, setQuery, results: searchResults.data };
}
```

## 14.2 Search Endpoint

```
GET /api/v1/search?q={query}&type=all
Response:
{
  transactions: [...],
  customers: [...],
  vehicles: [...]
}
```

---

# 15. SECURITY BEST PRACTICES

| Area | Practice |
|:-----|:---------|
| Token Storage | MMKV (encrypted) on mobile, httpOnly cookie on web |
| XSS Prevention | React's built-in escaping, never use dangerouslySetInnerHTML |
| HTTPS Only | All API calls over TLS |
| Token Refresh | Silent refresh before expiry, force logout on failure |
| Session Timeout | Auto-logout after 24h of inactivity |
| Input Sanitization | Zod on every form, server-side validation as backup |
| Error Messages | Generic to users, detailed to console only |
| Content Security | CSP headers via Nginx |

---

# 16. LOADING & EMPTY STATES

Every data-fetching component MUST handle:

1. **Loading**: Skeleton or spinner
2. **Empty**: Icon + message + optional CTA
3. **Error**: Message + Retry button
4. **Data**: The actual content

```typescript
function TransactionList() {
  const { data, isLoading, isError, refetch } = useTransactions();

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data?.length) return <EmptyState message="No transactions" />;
  
  return <TransactionListView data={data} />;
}
```

---

# 17. IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1-2)
- [ ] Initialize mobile + web projects
- [ ] Set up shared Axios instance with interceptors
- [ ] Implement auth flow (login, token storage, refresh)
- [ ] Set up Zustand stores (auth, UI)
- [ ] Create shared component library base

### Phase 2: Core Mobile (Week 3-4)
- [ ] Dashboard KPI screen
- [ ] Transaction list + search
- [ ] Transaction create flow (4-step wizard)
- [ ] Transaction detail view
- [ ] Status update flow

### Phase 3: Core Web Admin (Week 5-6)
- [ ] Dashboard layout + sidebar
- [ ] Tenant list + create form
- [ ] Subscription editor
- [ ] Transaction monitor
- [ ] Service type management

### Phase 4: Enhance (Week 7-8)
- [ ] Tracking page (mobile + public web)
- [ ] Revenue module (mobile)
- [ ] Settings (logo upload, branches, pricing)
- [ ] System monitoring page
- [ ] Public tracking web page

### Phase 5: Polish (Week 9-10)
- [ ] Performance optimization pass
- [ ] Error handling audit
- [ ] Loading/empty states audit
- [ ] UI consistency review
- [ ] Production build optimization

---

# 18. SUMMARY

| Requirement | Implementation |
|:------------|:---------------|
| State Management | Zustand (client) + TanStack Query (server) |
| API Integration | Centralized Axios with auto-refresh |
| Forms | React Hook Form + Zod schema validation |
| Auth | JWT + silent refresh + secure storage |
| Mobile Navigation | 5-tab bottom navigation |
| Web Navigation | Sidebar + breadcrumbs |
| Performance | Query caching, lazy loading, memoization |
| Error Handling | Boundary + toast + retry |
| Design System | Shared colors, typography, spacing, components |
| Search | Debounced global search across entities |
| Public Tracking | Server-rendered, no-auth, mobile-responsive |

---

**Frontend architecture ready for implementation.**
