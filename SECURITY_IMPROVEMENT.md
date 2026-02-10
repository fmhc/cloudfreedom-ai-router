# 🔒 Security Improvement: PocketBase Auth statt Frontend API Keys

## 🚨 Problem (VORHER)

Die initiale Implementierung hatte **kritische Sicherheitslücken**:

```yaml
# ❌ UNSICHER: Environment Variables im Admin Portal Frontend
VITE_ADMIN_SECRET_KEY=61c4f88dda17725395e42976eaacd5ec11337c336eae16001e7b9e95d954b3d4
VITE_BILLING_API_KEY=8aaa48a3e10237941e25ba2e60dcad2807593d84b2ab0356ff9b37ad8e0d2875
```

### Warum war das gefährlich?

1. ✅ **`VITE_` Variablen werden im Frontend-Bundle embedded** → Jeder kann sie im Browser sehen!
2. ✅ **Secrets sind im JavaScript sichtbar** → `console.log(import.meta.env.VITE_BILLING_API_KEY)` zeigt den Key!
3. ✅ **Mit diesen Keys kann jeder direkt die Billing API aufrufen** → Bypass des Admin Portals!

## ✅ Lösung (JETZT)

### 1. **Billing API: PocketBase Token Validation**

Die Billing API akzeptiert jetzt **NUR noch PocketBase Auth Tokens**, keine hardcoded API Keys mehr:

```javascript
// billing-api/index.js

// Auth middleware: Validate PocketBase token
const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401)
  }

  const token = authHeader.substring(7) // Remove "Bearer " prefix

  try {
    // Validate token with PocketBase
    pb.authStore.save(token)
    
    // Try to get the current user to verify token is valid
    const authData = await pb.collection('users').authRefresh()
    
    if (!authData || !authData.record) {
      return c.json({ error: 'Unauthorized: Invalid token' }, 401)
    }

    // Store user info in context for later use
    c.set('user', authData.record)
    c.set('userId', authData.record.id)
    
    await next()
  } catch (error) {
    console.error('Auth error:', error)
    return c.json({ error: 'Unauthorized: Token validation failed' }, 401)
  }
}

// Apply auth middleware to all /api/* routes
app.use('/api/*', authMiddleware)
```

### 2. **Admin Portal: PocketBase Auth Token statt API Keys**

Das Admin Portal verwendet jetzt **PocketBase Authentication Tokens**:

```typescript
// admin-portal/src/lib/api.ts

// Helper to get auth headers with PocketBase token
function getAuthHeaders() {
  const token = pb.authStore.token
  if (!token) {
    throw new Error('Not authenticated')
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

export const billingAPI = {
  async checkBudget(userId: string) {
    const response = await fetch(`${BILLING_API_URL}/api/budget/check`, {
      method: 'POST',
      headers: getAuthHeaders(), // 🔒 Verwendet PocketBase Token!
      body: JSON.stringify({
        user_id: userId,
      }),
    })
    // ...
  },
  // ...
}
```

### 3. **Docker Compose: Keine Secrets mehr im Frontend**

```yaml
# admin-portal/docker-compose.yml

services:
  admin-portal:
    environment:
      # ✅ Nur noch öffentliche URLs, KEINE Secrets!
      - VITE_POCKETBASE_URL=${VITE_POCKETBASE_URL:-https://api.cloudfreedom.de}
      - VITE_BILLING_API_URL=${VITE_BILLING_API_URL:-https://billing.cloudfreedom.de}
      # ❌ ENTFERNT: VITE_BILLING_API_KEY
      # ❌ ENTFERNT: VITE_ADMIN_SECRET_KEY
```

## 🎯 **VORTEILE:**

| Aspekt | Vorher (❌ Unsicher) | Jetzt (✅ Sicher) |
|--------|----------------------|-------------------|
| **API Keys im Frontend** | Ja, exposed in JS Bundle | Nein, nur PocketBase URLs |
| **Authentifizierung** | Statische API Keys | PocketBase User Auth Tokens |
| **Token Rotation** | Unmöglich (hardcoded) | Automatisch via PocketBase |
| **User-basiert** | Nein, ein Key für alle | Ja, jeder User hat eigenen Token |
| **Logging** | Keine User-Zuordnung | Vollständige User-Audit-Trails |
| **Revocation** | Schwierig (alle ändern) | Einfach (Token invalidieren) |

## 📊 **FLOW:**

### Vorher (Unsicher):
```
User → Admin Portal (mit hardcoded VITE_BILLING_API_KEY)
     → Billing API (validiert statischen Key)
     → PocketBase
```

### Jetzt (Sicher):
```
User → Admin Portal Login (email/password)
     → PocketBase Auth (returns JWT token)
     → Admin Portal (speichert Token in authStore)
     → Billing API (mit "Authorization: Bearer <token>")
     → Billing API validiert Token mit PocketBase
     → PocketBase
```

## ✅ **DEPLOYED:**

- ✅ Billing API: PocketBase Token Auth implementiert & deployed
- ✅ Admin Portal: Verwendet jetzt PocketBase Auth Tokens
- ✅ Environment Variables gesäubert (keine VITE Keys mehr)
- ✅ docker-compose.yml updated & gepusht

## 🚀 **NÄCHSTE SCHRITTE:**

1. ✅ Admin Portal deployment läuft
2. ⏳ Build Error fixen (npm run build failure)
3. ⏳ Admin Portal erfolgreich deployen
4. ⏳ Ersten Tenant deployen

---

**Datum:** 2025-10-09  
**Commits:**
- `billing-api`: `e6144b3` - Add PocketBase token authentication middleware
- `admin-portal`: `a3e3c22` - Security Fix: Remove exposed API keys, use PocketBase Auth tokens

