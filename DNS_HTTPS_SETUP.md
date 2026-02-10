# 🌐 DNS & HTTPS Setup Guide - CloudFreedom AI Router

**Datum:** 2025-10-09  
**Status:** ⚠️ **DNS CONFIGURATION REQUIRED**

---

## 📊 **CURRENT STATUS**

### ✅ **Services Running:**
| Service | Status | Internal Port | Domain Configured |
|---------|--------|---------------|-------------------|
| **PocketBase Core** | 🟢 RUNNING | 8090 | `api.cloudfreedom.de` |
| **Billing API** | 🟢 RUNNING | 3000 | `billing.cloudfreedom.de` |
| **Admin Portal** | 🟢 RUNNING | 80 | `admin.cloudfreedom.de` |

### ⚠️ **Missing:**
- DNS A Records müssen konfiguriert werden
- HTTPS/SSL wird automatisch aktiviert nach DNS Setup

---

## 🔧 **COOLIFY SERVER INFO**

**Server:** `ace-bunker` (coolify.enubys.de)  
**Public IPv4:** `46.243.203.26`  
**Location:** Coolify Instance  

---

## 📝 **DNS CONFIGURATION STEPS**

### **Option 1: Bei deinem DNS Provider (z.B. Cloudflare, Hetzner, etc.)**

Füge die folgenden **A Records** hinzu:

```dns
# Core Services
api.cloudfreedom.de         A    46.243.203.26
billing.cloudfreedom.de     A    46.243.203.26
admin.cloudfreedom.de       A    46.243.203.26

# First Tenant (wenn deployed)
app.cloudfreedom.de         A    46.243.203.26

# Demo Tenant (optional, für später)
demo.cloudfreedom.de        A    46.243.203.26

# Wildcard für alle Tenants (optional)
*.cloudfreedom.de           A    46.243.203.26
```

### **Option 2: Test ohne DNS (Local Hosts File)**

Für lokale Tests kannst du temporär deine `/etc/hosts` editieren:

```bash
sudo nano /etc/hosts
```

Füge hinzu:
```
46.243.203.26  api.cloudfreedom.de
46.243.203.26  billing.cloudfreedom.de
46.243.203.26  admin.cloudfreedom.de
46.243.203.26  app.cloudfreedom.de
```

⚠️ **Hinweis:** Dies funktioniert nur lokal auf deinem Computer!

---

## 🔒 **HTTPS/SSL SETUP (Automatisch via Coolify)**

### **Nach DNS Configuration:**

1. **Coolify aktiviert automatisch Let's Encrypt** für alle konfigurierten Domains
2. **Kein manueller Eingriff nötig** - Coolify managed Certificates
3. **Auto-Renewal** ist aktiviert (Certificates werden automatisch erneuert)

### **Manual Check (optional):**

Navigiere in Coolify zu:
```
Project → Environment → Application → General → Domains
```

Für jede Domain solltest du sehen:
- ✅ **"HTTPS Enabled"** Badge
- ✅ **Certificate Status:** Valid

---

## 🧪 **DNS VERIFICATION**

### **Check DNS Propagation:**

```bash
# Check A Record
dig +short api.cloudfreedom.de

# Expected Output: 46.243.203.26

# Check from multiple locations
dig +short api.cloudfreedom.de @8.8.8.8  # Google DNS
dig +short api.cloudfreedom.de @1.1.1.1  # Cloudflare DNS
```

### **Check Service Reachability:**

```bash
# Test HTTP (before HTTPS setup)
curl -I http://api.cloudfreedom.de
curl -I http://billing.cloudfreedom.de
curl -I http://admin.cloudfreedom.de

# Test HTTPS (after Let's Encrypt)
curl -I https://api.cloudfreedom.de
curl -I https://billing.cloudfreedom.de
curl -I https://admin.cloudfreedom.de
```

---

## 🎯 **EXPECTED RESULTS**

### **Before DNS:**
```bash
$ curl -I http://admin.cloudfreedom.de
curl: (6) Could not resolve host: admin.cloudfreedom.de
```

### **After DNS (before SSL):**
```bash
$ curl -I http://admin.cloudfreedom.de
HTTP/1.1 200 OK
Server: nginx
```

### **After DNS + SSL:**
```bash
$ curl -I https://admin.cloudfreedom.de
HTTP/2 200
server: nginx
```

---

## 🔍 **TROUBLESHOOTING**

### **Problem: DNS nicht erreichbar**

**Check 1:** DNS Propagation dauert 5-60 Minuten
```bash
# Wait and check again
watch -n 10 'dig +short api.cloudfreedom.de'
```

**Check 2:** Firewall am Server
```bash
# Coolify Server sollte Port 80/443 offen haben
# Check im Server Settings in Coolify
```

**Check 3:** Coolify Traefik Logs
```bash
# In Coolify: Server → Terminal
docker logs coolify-proxy
```

### **Problem: HTTPS Certificate Error**

**Solution 1:** Force Certificate Renewal in Coolify
- Navigate to Application → General → Domains
- Click "Check HTTPS"

**Solution 2:** Check Let's Encrypt Rate Limits
- Max 50 Certificates per domain per week
- Use DNS Challenge statt HTTP Challenge

### **Problem: 502 Bad Gateway**

**Check 1:** Service Status
```bash
# In Coolify: Check if containers are running
# Navigate to Logs tab
```

**Check 2:** Network Configuration
```bash
# All services should be in same Docker network
docker network ls
docker network inspect cloudfreedom-network
```

---

## 📊 **DNS PROPAGATION CHECKER**

### **Online Tools:**
- https://dnschecker.org (check global DNS propagation)
- https://www.whatsmydns.net (multiple locations)
- https://mxtoolbox.com/DNSLookup.aspx

### **Expected TTL:**
- Initial: 300-600 seconds (5-10 minutes)
- After stable: 3600 seconds (1 hour)

---

## 🚀 **QUICK START CHECKLIST**

- [ ] 1. Add A Records bei DNS Provider
- [ ] 2. Wait 5-15 minutes for propagation
- [ ] 3. Verify with `dig` command
- [ ] 4. Test HTTP access (curl)
- [ ] 5. Wait for Coolify HTTPS (automatic, ~2 minutes)
- [ ] 6. Test HTTPS access (curl)
- [ ] 7. Open in Browser: https://admin.cloudfreedom.de

---

## 📝 **EXAMPLE: Cloudflare DNS Configuration**

1. Login to Cloudflare
2. Select your domain: `cloudfreedom.de`
3. Navigate to: **DNS → Records**
4. Click: **Add record**
5. Enter:
   - **Type:** A
   - **Name:** api
   - **IPv4 address:** 46.243.203.26
   - **TTL:** Auto
   - **Proxy status:** ⚠️ **DNS only** (orange cloud OFF)
6. Repeat for: `billing`, `admin`, `app`

⚠️ **CRITICAL:** Cloudflare Proxy (orange cloud) muss **OFF** sein für Let's Encrypt HTTP Challenge!

---

## 🔐 **SECURITY NOTES**

### **After DNS + HTTPS Setup:**
- ✅ All traffic encrypted (TLS 1.3)
- ✅ Certificates from Let's Encrypt (trusted CA)
- ✅ Auto-renewal every 60 days
- ✅ HSTS Headers (via Coolify Traefik)

### **Additional Security (Optional):**
- Add CAA Records (restrict Certificate Authorities)
- Enable Cloudflare Proxy (after initial setup)
- Add SPF/DMARC Records (for email)

---

## 📊 **DNS RECORDS SUMMARY**

```dns
; CloudFreedom AI Router - Core Services
api.cloudfreedom.de.         300  IN  A  46.243.203.26
billing.cloudfreedom.de.     300  IN  A  46.243.203.26
admin.cloudfreedom.de.       300  IN  A  46.243.203.26
app.cloudfreedom.de.         300  IN  A  46.243.203.26

; Optional: Wildcard for all tenants
*.cloudfreedom.de.           300  IN  A  46.243.203.26

; Optional: IPv6 (wenn verfügbar)
; api.cloudfreedom.de.       300  IN  AAAA  <IPv6>
```

---

## ✅ **VERIFICATION SCRIPT**

```bash
#!/bin/bash
# dns_check.sh - Verify CloudFreedom DNS Setup

DOMAINS=(
  "api.cloudfreedom.de"
  "billing.cloudfreedom.de"
  "admin.cloudfreedom.de"
  "app.cloudfreedom.de"
)

EXPECTED_IP="46.243.203.26"

echo "🔍 Checking DNS Configuration..."
echo ""

for domain in "${DOMAINS[@]}"; do
  IP=$(dig +short "$domain" | head -n1)
  
  if [ "$IP" == "$EXPECTED_IP" ]; then
    echo "✅ $domain → $IP (OK)"
  elif [ -z "$IP" ]; then
    echo "❌ $domain → NO DNS RECORD"
  else
    echo "⚠️  $domain → $IP (WRONG IP)"
  fi
done

echo ""
echo "🌐 Testing HTTP Connectivity..."

for domain in "${DOMAINS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$domain" --max-time 5)
  
  if [ "$STATUS" == "200" ] || [ "$STATUS" == "301" ] || [ "$STATUS" == "302" ]; then
    echo "✅ $domain → HTTP $STATUS (OK)"
  else
    echo "❌ $domain → HTTP $STATUS (FAIL)"
  fi
done

echo ""
echo "🔒 Testing HTTPS Connectivity..."

for domain in "${DOMAINS[@]}"; do
  if curl -s "https://$domain" --max-time 5 > /dev/null 2>&1; then
    echo "✅ $domain → HTTPS (OK)"
  else
    echo "❌ $domain → HTTPS (FAIL or not yet configured)"
  fi
done
```

**Usage:**
```bash
chmod +x dns_check.sh
./dns_check.sh
```

---

## 📞 **SUPPORT**

Bei Problemen:
1. Check Coolify Logs: Application → Logs
2. Check Traefik Logs: Server → Terminal → `docker logs coolify-proxy`
3. Check DNS Propagation: https://dnschecker.org

---

**Last Updated:** 2025-10-09  
**Coolify Version:** v4.0.0-beta.434  
**Server IP:** 46.243.203.26

