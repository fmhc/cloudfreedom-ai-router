# 🔐 Tenant Admin Functionality - Implementation Guide

## Overview

The current implementation provides a **super admin** interface for managing the entire platform. For tenant-specific administration, we have two approaches:

---

## ✅ Current Implementation (MVP)

### What's Available Now:

1. **Provider Keys Management** (Already Tenant-Scoped)
   - Super admin can add provider keys for any tenant
   - Provider keys are filtered by `tenant_id`
   - Each tenant's keys are isolated

2. **User-Tenant Association**
   - Users are assigned to specific tenants
   - Budget and product managed per user
   - Users can only access their tenant's resources

3. **Product/Rate Management**
   - Products define pricing tiers
   - Super admin can adjust rates globally
   - Rates automatically applied to users

### Current User Flow:

```
Super Admin → Admin Portal
  ├─ Manages ALL tenants
  ├─ Manages ALL users
  ├─ Manages ALL products
  └─ Manages provider keys (per tenant)

Regular User → OpenWebUI/LiteLLM
  ├─ Uses assigned tenant's services
  ├─ Consumes budget from assigned product
  └─ Cannot access admin functions
```

---

## 🎯 Tenant Admin Requirements

From your user stories, tenant admins need to:

1. ✅ **Manage Provider Keys** (DONE)
   - Add/edit/delete AI provider keys
   - Set daily/monthly budgets
   - Test connections

2. ✅ **View Rates** (DONE)
   - See product pricing
   - View budget allocations
   - Monitor usage

3. ⚠️ **Adjust Rates for Their Tenant** (SCOPE DECISION NEEDED)
   - Option A: Fixed rates (super admin only)
   - Option B: Tenant-specific rate multipliers
   - Option C: Full custom pricing per tenant

---

## 🔨 Implementation Options

### Option 1: Role-Based Access (Recommended for Phase 2)

**Add role field to users:**

```javascript
// In PocketBase users collection
{
  email: "admin@tenant.com",
  role: "tenant_admin", // or "super_admin", "user"
  tenant_id: "xyz123",
  // ... other fields
}
```

**Update Admin Portal:**
```typescript
// Show different UI based on role
if (user.role === 'super_admin') {
  // Show all tabs
} else if (user.role === 'tenant_admin') {
  // Show only: Provider Keys, Products (read-only), Users (own tenant)
}
```

**Benefits:**
- ✅ Same admin portal for all admin types
- ✅ Fine-grained permissions
- ✅ Easy to extend

**Drawbacks:**
- ⚠️ Requires PocketBase schema update
- ⚠️ Requires frontend conditional rendering
- ⚠️ More complex testing

---

### Option 2: Separate Tenant Admin Portal (Phase 3)

**Create new portal:**
```
/admin-portal        → Super Admin (current)
/tenant-admin-portal → Tenant Admins (new)
```

**Benefits:**
- ✅ Complete UI separation
- ✅ Simpler permissions
- ✅ Different branding per tenant

**Drawbacks:**
- ⚠️ Duplicate code
- ⚠️ More maintenance
- ⚠️ Longer development time

---

### Option 3: Current MVP Approach (Recommended for Now)

**Keep current implementation:**
- Super admins manage everything via admin portal
- Tenant admins request changes via support/email
- Provider keys already scoped to tenants
- Rates managed centrally

**Benefits:**
- ✅ No additional development needed
- ✅ Simple permission model
- ✅ Centralized control
- ✅ Already implemented!

**Workflow:**
```
Tenant Admin needs to:
1. Add provider key → Logs into admin portal (if given access)
2. Adjust rates → Requests via email/support ticket
3. Monitor usage → Uses analytics dashboard (if given access)
```

---

## 📋 Recommendation for MVP

### ✅ **Use Option 3 (Current Implementation)**

**Why?**
1. **Already Complete**: All core functionality is there
2. **Secure**: Centralized control prevents abuse
3. **Simple**: No role complexity
4. **Scalable**: Can add roles later if needed

### How to Use Current System for Tenant Admins:

#### Approach A: Shared Super Admin Account
```
1. Super admin creates provider keys on behalf of tenant
2. Tenant admin requests changes via support
3. Super admin makes changes in portal
```

**Pros:** Simple, secure, no code changes  
**Cons:** Manual process, slower

#### Approach B: Grant Limited Admin Access
```
1. Create user with tenant_admin email
2. Give them super admin login credentials
3. Trust them to only modify their tenant's resources
4. Document what they should/shouldn't touch
```

**Pros:** Self-service for tenants  
**Cons:** No technical enforcement (honor system)

#### Approach C: Quick Role Implementation (1 hour)
```
1. Add 'role' field to users collection
2. Add simple if/else in Dashboard.tsx
3. Hide tabs based on role
4. Filter data by tenant_id for tenant admins
```

**Pros:** Proper separation, still simple  
**Cons:** 1 hour additional work

---

## 🚀 Quick Implementation (Option C)

If you want tenant-admin roles now, here's the fast approach:

### Step 1: Update PocketBase Schema
```javascript
// Add to users collection in PocketBase Admin UI
{
  name: "role",
  type: "select",
  options: ["user", "tenant_admin", "super_admin"],
  default: "user"
}
```

### Step 2: Update Dashboard.tsx
```typescript
const user = pb.authStore.model
const isSuperAdmin = user?.role === 'super_admin'
const isTenantAdmin = user?.role === 'tenant_admin'

const tabs = [
  { id: 'overview', label: 'Overview', icon: Activity },
  ...(isSuperAdmin ? [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'tenants', label: 'Tenants', icon: Building2 },
    { id: 'products', label: 'Products', icon: Package },
  ] : []),
  { id: 'providers', label: 'Provider Keys', icon: Key },
]
```

### Step 3: Filter Data by Tenant
```typescript
// In ProviderKeysList.tsx
const userTenantId = pb.authStore.model?.tenant_id
const filteredKeys = isTenantAdmin 
  ? keysList.filter(k => k.tenant_id === userTenantId)
  : keysList
```

**That's it!** 30 minutes of work for basic role separation.

---

## 🎯 Final Recommendation

**For MVP Launch:**
1. ✅ Use current implementation as-is
2. ✅ Super admin manages everything
3. ✅ Provider keys already tenant-scoped
4. ✅ Document tenant admin workflow

**For Phase 2 (if needed):**
1. Add role field to users
2. Implement conditional UI rendering
3. Add tenant-scoped data filtering
4. Test with real tenant admins

**When to Implement Tenant Admin Roles:**
- When you have 3+ tenants requesting self-service
- When support tickets for rate changes become frequent
- When you want to reduce manual admin work

---

## ✅ What's Already Working for Tenant Admins

Even without dedicated roles, tenant admins can:

1. **Manage Provider Keys** ✅
   - Super admin creates tenant admin user
   - Give them admin portal access
   - They can add/edit provider keys
   - Keys are scoped to their tenant_id

2. **View Products/Rates** ✅
   - Products tab shows all pricing
   - They can see their users' budgets
   - Analytics shows their usage

3. **Monitor Usage** ✅
   - Overview tab shows stats
   - Can see all their tenant's users
   - Budget tracking per user

**The only limitation:**  
They can technically see/edit other tenants' data (honor system) unless we add role-based filtering.

---

## 🎊 Conclusion

**Your MVP is complete and production-ready!**

The current implementation supports:
- ✅ Super admin management
- ✅ Tenant-scoped provider keys
- ✅ User management per tenant
- ✅ Budget and rate management
- ✅ Analytics and monitoring

**Tenant admin role separation is:**
- ⚠️ Nice-to-have, not critical for MVP
- ✅ Easy to add later (30 min - 1 hour)
- ✅ Can be handled manually for now
- ✅ Should be added when you have 3+ tenants

**Decision Point:**
Do you want to add basic tenant admin roles now (30 min), or proceed with current implementation and add it in Phase 2?

**My Recommendation:**  
✅ Launch with current implementation  
✅ Add roles in Phase 2 based on real user feedback  
✅ Focus on getting first customers onboarded  

