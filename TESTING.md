# STNK Bureau System - Testing Guide

## End-to-End Testing Checklist

### Prerequisites
- PostgreSQL running with migrations and seed data
- Backend server started on port 3000
- Test user credentials created via seed

### Test Credentials

From seed data:

**Admin Account:**
- Email: `admin@stnkbureau.local`
- Password: `admin123456`
- Role: ADMIN

**Test Bureau Owner:**
- Email: `owner-biro-jasa-stnk-jakarta-pusat@stnkbureau.local`
- Password: `password123456`
- Role: OWNER
- Bureau: Biro Jasa STNK Jakarta Pusat

### Testing Flow

#### Phase 1: Backend API Testing

**1. Database Connection**
```bash
cd backend
npm run migrate:seed
```
Expected: All migrations and seed completed successfully

**2. Auth Endpoint - Login**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner-biro-jasa-stnk-jakarta-pusat@stnkbureau.local",
    "password": "password123456"
  }'
```
Expected: Response with user data and JWT tokens

**3. Store Token**
```bash
export TOKEN="<access_token_from_login_response>"
```

**4. Get Services**
```bash
curl -X GET http://localhost:3000/api/v1/transactions \
  -H "Authorization: Bearer $TOKEN"
```
Expected: List of transactions (empty initially)

**5. Create Transaction**
```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customer_data": {
      "name": "John Doe",
      "phone": "08123456789",
      "email": "john@example.com",
      "vehicle_number": "BL 1234 AB"
    },
    "service_id": "<service_id_from_services>",
    "payment_method": "CASH"
  }'
```
Expected: Transaction created with tracking token

**6. Get Tracking Info (Public - No Auth)**
```bash
curl -X GET http://localhost:3000/api/v1/tracking/<tracking_token>
```
Expected: Tracking status with customer name, service, stage

**7. List Transactions**
```bash
curl -X GET http://localhost:3000/api/v1/transactions \
  -H "Authorization: Bearer $TOKEN"
```
Expected: Transaction appears in list

**8. Update Transaction Status**
```bash
curl -X PUT http://localhost:3000/api/v1/transactions/<transaction_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "COMPLETED"}'
```
Expected: Status updated

**9. Get Tracking History**
```bash
curl -X GET http://localhost:3000/api/v1/tracking/<tracking_token>/history
```
Expected: History includes stage 1 (initial) and updates

#### Phase 2: Mobile App Testing

**Setup:**
```bash
cd mobile
npm install
npm run dev
```

**Test Cases:**

1. **Login Screen**
   - [ ] Input valid credentials
   - [ ] See error on invalid password
   - [ ] Navigate to home after successful login
   - [ ] Test user data from credentials file

2. **Dashboard Screen**
   - [ ] See "Halo, [Bureau Name]"
   - [ ] See pending transaction count
   - [ ] See today's revenue amount
   - [ ] Tap "Segarkan Data" to reload

3. **New Transaction Screen**
   - [ ] Fill in customer name
   - [ ] Fill in phone number
   - [ ] Select service from dropdown
   - [ ] Tap "Buat Transaksi"
   - [ ] See success message
   - [ ] Verify transaction appears in history

4. **Transaction History Screen**
   - [ ] See list of transactions
   - [ ] See customer name, service, and amount
   - [ ] See transaction status with color coding
   - [ ] Pull down to refresh
   - [ ] See "COMPLETED", "PENDING" statuses

5. **Settings Screen**
   - [ ] See user profile info
   - [ ] See bureau info
   - [ ] Tap "Logout"
   - [ ] Confirm logout dialog
   - [ ] Return to login screen

#### Phase 3: Frontend Admin Dashboard Testing

**Setup:**
```bash
cd frontend
npm install
npm run dev
```

**Test Cases:**

1. **Dashboard Page**
   - [ ] See "Dashboard" header
   - [ ] See stat cards with bureau count
   - [ ] See bureau list table
   - [ ] Click "View All" to see all bureaus

2. **Bureau List**
   - [ ] Filter by status
   - [ ] See bureau name, status, subscription plan
   - [ ] See action buttons (edit, manage)

3. **Transactions Page**
   - [ ] See list of all transactions from all bureaus
   - [ ] Filter by date range
   - [ ] Filter by status
   - [ ] See revenue calculation

#### Phase 4: WhatsApp Integration Testing

**Setup** (if Twilio configured):

1. Add Twilio credentials to `.env`:
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+1234567890
```

2. Test WhatsApp sending:
   - [ ] Create transaction
   - [ ] Check Twilio console for message
   - [ ] Verify receipt message format
   - [ ] Update transaction status
   - [ ] Verify stage update message sent

**Without Twilio** (development mode):
- Messages queue in memory but don't send
- Check server logs for message queue status

### Automated Testing

#### Backend Tests (Optional)

```bash
cd backend
npm test
```

Test coverage:
- [ ] Auth login/logout/refresh
- [ ] Transaction CRUD
- [ ] Tracking status
- [ ] Price calculations
- [ ] Multi-tenancy isolation

### Performance Testing

#### Load Testing
```bash
# Using Apache Bench or similar
ab -n 100 -c 10 http://localhost:3000/api/v1/transactions
```

Expected: <200ms response time per request

#### Database Performance
```bash
# Check slow queries
SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

### Security Testing

- [ ] SQL Injection: Test with `' OR '1'='1` in inputs
- [ ] XSS: Test with `<script>alert('xss')</script>` in inputs
- [ ] CSRF: Verify token is required
- [ ] Auth: Verify endpoints require valid JWT
- [ ] Tenant Isolation: Verify users can't access other bureau data

### Data Validation Testing

- [ ] Required fields: Name, phone, service must be present
- [ ] Email format validation
- [ ] Phone number format validation
- [ ] Negative amounts should fail
- [ ] Invalid statuses should fail

### Error Handling Testing

- [ ] Database connection failure
- [ ] Twilio API failure (graceful degradation)
- [ ] Invalid token (401 response)
- [ ] Not found (404 response)
- [ ] Validation errors (400 response)

### Integration Testing

**Complete Flow:**

1. **Setup:**
   - [ ] Start PostgreSQL
   - [ ] Run migrations and seed
   - [ ] Start backend server
   - [ ] Start mobile app emulator

2. **Create Transaction:**
   - [ ] Login on mobile
   - [ ] Create new transaction with customer data
   - [ ] Backend saves to database
   - [ ] Tracking token generated
   - [ ] WhatsApp message queued (or sent if Twilio configured)

3. **Check in Admin:**
   - [ ] Login to web admin
   - [ ] See transaction in dashboard
   - [ ] See revenue calculation
   - [ ] Click on transaction for details

4. **Customer Tracking:**
   - [ ] Get tracking link from receipt
   - [ ] Access public tracking endpoint
   - [ ] See current stage and history
   - [ ] Verify no customer PII exposed

5. **Status Update:**
   - [ ] Update transaction status to "COMPLETED"
   - [ ] Check document stage updated
   - [ ] Verify stage history recorded
   - [ ] Check WhatsApp stage update sent

## Known Limitations (MVP)

- WhatsApp integration requires Twilio configuration
- No email notifications (WhatsApp only)
- No payment gateway integration (cash only)
- Dashboard analytics are basic
- Mobile app is iOS/Android only (web not tested)
- No offline support
- Session management basic (no refresh on token expiry)

## Troubleshooting

### Backend Issues

**"database connection failed"**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env

**"Invalid token"**
- Ensure JWT_SECRET in .env matches across services
- Check token hasn't expired (15 min expiry)

**"User not found"**
- Run seed: `npm run seed`
- Check email address spelling

### Mobile App Issues

**"Cannot connect to server"**
- Verify backend is running on port 3000
- Check EXPO_PUBLIC_API_URL in .env

**"Services not loading"**
- Verify transaction list endpoint returns data
- Check bureau has services created

### Frontend Issues

**"No bureaus showing"**
- Verify admin user is logged in
- Check database has bureaus created
- Verify API endpoint returns data

## Success Criteria

✅ All endpoints return expected responses
✅ Auth flow works (login → token → protected endpoints)
✅ Transaction creation with tracking
✅ WhatsApp messages queue successfully
✅ Public tracking works without auth
✅ Mobile app shows data and allows transaction creation
✅ Admin dashboard shows bureaus and transactions
✅ Multi-tenancy isolation verified
✅ No errors in server/client logs
✅ Response times <200ms on normal load

## Next Steps

1. **Metrics & Monitoring**: Add logging and error tracking (Sentry, LogRocket)
2. **Payment Integration**: Add Midtrans/Stripe for subscription billing
3. **Email Notifications**: Add email receipts alongside WhatsApp
4. **Analytics**: Build detailed analytics dashboard
5. **Mobile: iOS/Android Build**: Create signed APK/IPA
6. **Frontend: More Pages**: Bureau creation, subscription management
7. **Testing**: Add automated tests (Jest, Cypress)
8. **Performance**: Optimize database queries, add caching
9. **Security**: Add rate limiting, CORS configuration, helmet
10. **Documentation**: API documentation (Swagger/OpenAPI)
