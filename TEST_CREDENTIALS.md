# CloudFreedom Test Credentials

## 🔐 Test Users (Created: 2025-10-10)

### Admin User
- **Email:** `admin@testcompany.com`
- **Password:** `+VN+m4KYOKBOMKUunX1dMbRl6w8kPE4o`
- **Role:** Tenant Admin
- **Status:** Active
- **Budget:** €1000.00
- **Used:** €0.00

### Regular User
- **Email:** `user@testcompany.com`
- **Password:** `/c5jeqVJLgN9c2Y6E0ab4LJFIQidwG36`
- **Role:** User
- **Status:** Active
- **Budget:** €100.00
- **Used:** €25.50

## 🔑 PocketBase Admin
- **Email:** `admin@cloudfreedom.de`
- **Password:** `SecureAdminPass2025!`
- **URL:** https://api.cloudfreedom.de/_/

## 📊 Test Data Overview

### Tenant
- **ID:** `test_tenant_001`

### Products
- `test_product_01` - "AI Pro Plan"
- `testprod123456` - "AI Pro Test Plan"

### Usage Logs
- 1 test log entry (gpt-4o, €0.0345)

## 🔒 Security Notes
- ✅ User passwords are hashed with bcrypt ($2a$10$...)
- ✅ Passwords generated with `openssl rand -base64 24`
- ✅ All sensitive data encrypted at rest
- ✅ JWT tokens for API authentication

## 🌐 Access URLs
- **Admin Portal:** https://admin.cloudfreedom.de
- **PocketBase API:** https://api.cloudfreedom.de
- **Billing API:** https://billing.cloudfreedom.de

## 📝 Next Steps
1. Login to Admin Portal with admin credentials
2. Test user management features
3. Test rate/product management
4. Test budget tracking
5. Test AI model access via LiteLLM

