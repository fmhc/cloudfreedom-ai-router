# 🚀 CloudFreedom - User Onboarding Flow

**Erstellt:** 2025-10-10  
**Status:** MVP Design  
**Version:** 2.0 (Simplified)

---

## 🎯 ZIEL

User soll:
1. Per Email/Sales-Seite einen Zugang bekommen
2. Link klicken → Automatisch eingeloggt
3. Sofort loschatten können

**KEIN komplizierter Signup-Prozess!**

---

## 📊 USER JOURNEY

### Variante A: Manuell (Admin Portal)

```
Admin → Admin Portal → "New User" → Ausfüllen → Create
         ↓
PocketBase erstellt User + Generiert Magic Link
         ↓
System sendet Email mit Magic Link
         ↓
User klickt Link → Auto-Login → Chat
```

### Variante B: PayPal/Sales Page

```
User → Sales Page → PayPal Checkout → Zahlung erfolgreich
         ↓
Webhook → API Call → PocketBase User erstellen
         ↓
Magic Link Email versenden
         ↓
User klickt Link → Auto-Login → Chat
```

### Variante C: Invite Code

```
User → chat.cloudfreedom.de → "Invite Code eingeben"
         ↓
System validiert Code → User Account erstellen
         ↓
Auto-Login → Chat
```

---

## 🔐 MAGIC LINK SYSTEM

### Wie funktioniert's?

**PocketBase hat bereits Magic Link Support!**

```typescript
// 1. Admin erstellt User im Admin Portal
const user = await pb.collection('cf_users').create({
  email: 'user@example.com',
  name: 'Max Mustermann',
  tenant_id: 'tenant_demo',
  product_id: 'pro_plan',
  role: 'user',
  status: 'pending', // Wartet auf erste Anmeldung
})

// 2. System generiert Magic Link
const magicLink = await pb.collection('cf_users').requestEmailChange(
  user.email
)

// 3. Email versenden
await sendEmail({
  to: user.email,
  subject: '🎉 Welcome to CloudFreedom AI!',
  body: `
    Hi ${user.name},
    
    Your AI chat access is ready! Click below to start:
    
    👉 ${magicLink}
    
    This link expires in 30 minutes.
    
    Happy chatting!
    - CloudFreedom Team
  `
})
```

**User Experience:**
```
1. User bekommt Email
2. Klickt auf Link
3. → https://chat.cloudfreedom.de?token=abc123...
4. OpenWebUI erkennt Token → Auto-Login
5. User ist drin und kann chatten!
```

---

## 🏗️ TECHNISCHE ARCHITEKTUR

### Simplified Flow

```
┌─────────────────────────────────────────────────────┐
│ Admin Portal (admin.cloudfreedom.de)               │
│ ↓ Admin erstellt User                               │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ PocketBase (api.cloudfreedom.de)                   │
│ • User Account erstellt                             │
│ • Magic Link Token generiert                        │
│ • Status: "pending"                                 │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ Email Service (z.B. Resend/SendGrid/SMTP)         │
│ Sendet Welcome Email mit Magic Link                │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ User klickt Link                                    │
│ → https://chat.cloudfreedom.de?token=XXX           │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ OpenWebUI (chat.cloudfreedom.de)                   │
│ • Validiert Token bei PocketBase                    │
│ • Erstellt Session                                  │
│ • Status → "active"                                 │
│ • User sieht Chat-Interface                         │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 NEUE DOMAIN STRUKTUR

### Keine Port-Unterschiede! Nur Domains!

```yaml
Core Services:
  - api.cloudfreedom.de → PocketBase (Port 8090 intern)
  - admin.cloudfreedom.de → Admin Portal (Port 80 intern)
  
Chat Endpoints (alle Port 8080 intern):
  - chat.cloudfreedom.de → Internal Tenant OpenWebUI
  - demo.cloudfreedom.de → Demo Tenant OpenWebUI
  - public.cloudfreedom.de → Public Tenant OpenWebUI
  - [customer].cloudfreedom.de → Enterprise Tenant

API Endpoints (alle Port 4000 intern):
  - api-internal.cloudfreedom.de → Internal LiteLLM
  - api-demo.cloudfreedom.de → Demo LiteLLM
  - api-public.cloudfreedom.de → Public LiteLLM
```

**Traefik Routing:**
```yaml
# Alle Tenants nutzen die gleichen internen Ports!
# Traefik routet nur via Domain Label

labels:
  - "traefik.enable=true"
  - "traefik.http.routers.chat-internal.rule=Host(`chat.cloudfreedom.de`)"
  - "traefik.http.routers.chat-demo.rule=Host(`demo.cloudfreedom.de`)"
  - "traefik.http.services.openwebui.loadbalancer.server.port=8080"
```

---

## 📧 EMAIL INTEGRATION

### Option 1: Resend (Empfohlen für MVP)

**Warum Resend?**
- ✅ Modern, einfach, günstig ($0/mo für 3000 emails)
- ✅ API ist super simpel
- ✅ EU Server verfügbar
- ✅ Keine komplexe SMTP Config

```typescript
// billing-api/services/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(user, magicLink) {
  await resend.emails.send({
    from: 'CloudFreedom <hello@cloudfreedom.de>',
    to: user.email,
    subject: '🎉 Your AI Chat is Ready!',
    html: `
      <h1>Welcome ${user.name}!</h1>
      <p>Click the button below to access your AI chat:</p>
      <a href="${magicLink}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Start Chatting →
      </a>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        This link expires in 30 minutes.
      </p>
    `
  })
}
```

### Option 2: PocketBase SMTP (Backup)

```javascript
// PocketBase Settings → Mail Settings
{
  "smtp": {
    "host": "smtp.eu.mailgun.org",
    "port": 587,
    "username": "postmaster@mg.cloudfreedom.de",
    "password": "your-mailgun-password",
    "tls": true
  },
  "fromAddress": "hello@cloudfreedom.de",
  "fromName": "CloudFreedom"
}
```

---

## 🔐 INVITE CODE SYSTEM (Bonus Feature)

### Use Case: Sales Landing Page

```html
<!-- Landing Page: sales.cloudfreedom.de -->
<form>
  <input type="email" placeholder="your@email.com" />
  <input type="text" placeholder="Invite Code" />
  <button>Get Access</button>
</form>
```

**Backend Flow:**
```typescript
// POST /api/redeem-invite
async function redeemInviteCode(email, code) {
  // 1. Validate invite code
  const invite = await pb.collection('invite_codes').getFirstListItem(
    `code = "${code}" && status = "unused" && expires > "${new Date().toISOString()}"`
  )
  
  if (!invite) {
    return { error: 'Invalid or expired invite code' }
  }
  
  // 2. Create user
  const user = await pb.collection('cf_users').create({
    email,
    tenant_id: invite.tenant_id,
    product_id: invite.product_id,
    role: 'user',
    status: 'active',
    api_key: `sk-${generateRandomHex(64)}`
  })
  
  // 3. Mark invite as used
  await pb.collection('invite_codes').update(invite.id, {
    status: 'used',
    used_by: user.id,
    used_at: new Date().toISOString()
  })
  
  // 4. Generate Magic Link
  const magicLink = await generateMagicLink(user)
  
  // 5. Send email
  await sendWelcomeEmail(user, magicLink)
  
  return { success: true, message: 'Check your email!' }
}
```

**Invite Codes Collection:**
```typescript
{
  "code": "WELCOME2025", // Human-readable
  "tenant_id": "tenant_demo",
  "product_id": "pro_plan",
  "status": "unused", // unused, used, expired
  "expires": "2025-12-31T23:59:59Z",
  "max_uses": 100,
  "used_count": 0,
  "created_by": "admin_id"
}
```

---

## 💳 PAYPAL INTEGRATION (Future)

### Simplified Flow

```
User → Sales Page → PayPal Button
         ↓
PayPal Checkout (€29/Monat)
         ↓
Payment Success → PayPal Webhook
         ↓
POST /api/webhooks/paypal
         ↓
Create User + Send Magic Link
```

**Webhook Handler:**
```typescript
// POST /api/webhooks/paypal
async function handlePayPalWebhook(req) {
  const { event_type, resource } = req.body
  
  if (event_type === 'PAYMENT.SALE.COMPLETED') {
    const email = resource.payer.email_address
    const name = resource.payer.payer_info.first_name
    
    // Create user
    const user = await pb.collection('cf_users').create({
      email,
      name,
      tenant_id: 'tenant_demo', // or determine from product
      product_id: 'pro_plan',
      role: 'user',
      status: 'active',
      budget_limit: 100, // from product
      api_key: `sk-${generateRandomHex(64)}`,
      payment_provider: 'paypal',
      payment_id: resource.id
    })
    
    // Send welcome email with magic link
    const magicLink = await generateMagicLink(user)
    await sendWelcomeEmail(user, magicLink)
    
    return { success: true }
  }
}
```

---

## 🎯 MVP IMPLEMENTATION PLAN

### Phase 1: Magic Link System (Week 1)

**Day 1-2: Email Service Setup**
- [ ] Resend Account erstellen
- [ ] DNS Records konfigurieren (SPF, DKIM, DMARC)
- [ ] Welcome Email Template erstellen
- [ ] Test Email versenden

**Day 3-4: Magic Link in Admin Portal**
- [ ] "Send Magic Link" Button in UserDialog
- [ ] Magic Link Generation API Endpoint
- [ ] Email Service Integration
- [ ] Test mit realem User

**Day 5-7: OpenWebUI Auto-Login**
- [ ] Token Validation in OpenWebUI
- [ ] Auto-Login Flow implementieren
- [ ] Session Management
- [ ] End-to-End Test

### Phase 2: Invite Code System (Week 2)

- [ ] invite_codes Collection erstellen
- [ ] Code Generation Tool
- [ ] Redemption Endpoint
- [ ] Landing Page mit Formular
- [ ] Test kompletter Flow

### Phase 3: PayPal Integration (Week 3-4)

- [ ] PayPal Developer Account
- [ ] Webhook Setup
- [ ] Payment → User Creation Flow
- [ ] Testing mit Sandbox
- [ ] Production Deployment

---

## 🔧 CODE EXAMPLES

### 1. Admin Portal - Send Magic Link Button

```typescript
// admin-portal/src/components/users/UserDialog.tsx

const [sendingEmail, setSendingEmail] = useState(false)

const handleSendMagicLink = async () => {
  setSendingEmail(true)
  try {
    await fetch('https://billing.cloudfreedom.de/api/users/send-magic-link', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pb.authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.id })
    })
    
    toast({
      title: 'Success!',
      description: `Magic link sent to ${user.email}`
    })
  } catch (error) {
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive'
    })
  } finally {
    setSendingEmail(false)
  }
}

return (
  <DialogFooter>
    <Button 
      onClick={handleSendMagicLink} 
      disabled={sendingEmail}
      variant="outline"
    >
      {sendingEmail ? 'Sending...' : '📧 Send Magic Link'}
    </Button>
    <Button type="submit">Save User</Button>
  </DialogFooter>
)
```

### 2. Billing API - Magic Link Endpoint

```typescript
// billing-api/routes/users.ts

app.post('/api/users/send-magic-link', authMiddleware, async (c) => {
  const { userId } = await c.req.json()
  
  // Get user from PocketBase
  const user = await pb.collection('cf_users').getOne(userId)
  
  // Generate magic link token (JWT with 30min expiry)
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  )
  
  const magicLink = `https://chat.cloudfreedom.de?token=${token}`
  
  // Send email via Resend
  await resend.emails.send({
    from: 'CloudFreedom <hello@cloudfreedom.de>',
    to: user.email,
    subject: '🎉 Your CloudFreedom AI Access',
    html: welcomeEmailTemplate(user.name, magicLink)
  })
  
  // Log activity
  await pb.collection('audit_logs').create({
    type: 'magic_link_sent',
    user_id: userId,
    admin_id: c.get('userId'),
    timestamp: new Date().toISOString()
  })
  
  return c.json({ success: true })
})
```

### 3. OpenWebUI - Auto-Login Handler

```typescript
// tenant-template/openwebui-init.js

// Custom login handler for magic links
async function handleMagicLinkLogin(token) {
  try {
    // Validate token with PocketBase
    const response = await fetch('https://api.cloudfreedom.de/api/validate-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
    
    if (!response.ok) {
      throw new Error('Invalid or expired link')
    }
    
    const { user } = await response.json()
    
    // Create OpenWebUI session
    const session = await createUserSession(user)
    
    // Update user status to active
    await fetch('https://api.cloudfreedom.de/api/collections/cf_users/records/' + user.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active', last_login: new Date().toISOString() })
    })
    
    // Redirect to chat
    window.location.href = '/chat'
    
  } catch (error) {
    console.error('Magic link login failed:', error)
    alert('Your login link is invalid or expired. Please request a new one.')
  }
}

// Check for token on page load
const urlParams = new URLSearchParams(window.location.search)
const token = urlParams.get('token')
if (token) {
  handleMagicLinkLogin(token)
}
```

---

## ✅ SUCCESS CRITERIA

**MVP is complete when:**

1. ✅ Admin kann User im Portal anlegen
2. ✅ User bekommt automatisch Email mit Magic Link
3. ✅ User klickt Link → ist sofort eingeloggt
4. ✅ User kann direkt loschatten
5. ✅ Kein manueller Signup-Prozess nötig
6. ✅ Invite Codes funktionieren (Bonus)

**User Experience:**
```
Email empfangen → Link klicken → Chatten
         ⏱️ < 10 Sekunden
```

---

## 📊 METRICS TO TRACK

```yaml
Onboarding Funnel:
  - Users created (Admin Portal)
  - Magic links sent
  - Magic links clicked
  - First login completed
  - First message sent

Conversion Rate:
  - Email → Click: >80%
  - Click → Login: >95%
  - Login → First Message: >90%

Time to First Message:
  - Target: < 2 minutes
  - Measure: from email sent to first chat message
```

---

**Status:** Ready to Implement  
**Priority:** HIGH - Core User Experience  
**Owner:** Finn  
**Estimated Time:** 1-2 weeks for Phase 1


