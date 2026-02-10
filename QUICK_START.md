# ⚡ CloudFreedom AI Router - Quick Start Guide

**Get your admin portal running in 5 minutes!**

---

## 🚀 Quick Deployment

### 1. Build Frontend (30 seconds)
```bash
cd /home/fmh/ai/cloudfreedom-ai-router/admin-portal
npm run build
```
✅ **Expected:** Build successful, `dist/` folder created

### 2. Deploy to Coolify (2 minutes)
```bash
# Commit and push
git add .
git commit -m "Complete MVP admin portal"
git push origin main

# Coolify will auto-rebuild, or manually trigger via UI
# https://coolify.enubys.de
```
✅ **Expected:** Service deployed at https://admin.cloudfreedom.de

### 3. Create Admin User (1 minute)
```bash
cd /home/fmh/ai/cloudfreedom-ai-router/pocketbase-core
./create_admin_user.sh
```
✅ **Expected:** Admin credentials generated

**⚠️ SAVE THE PASSWORD IMMEDIATELY!**

### 4. Login & Setup (2 minutes)
```
1. Open https://admin.cloudfreedom.de
2. Login with credentials from step 3
3. Click "Change Password" and set new password
4. Done!
```

---

## 🎯 Initial Configuration

### Create Your First Tenant
```
1. Click "Tenants" tab
2. Click "Add Tenant"
3. Name: "My Company"
4. Type: "Internal"
5. Click "Create"
```

### Configure a Product
```
1. Click "Products" tab
2. Edit "Starter" product
3. Set pricing: €9.99/month
4. Set budget: €25
5. Click "Update"
```

### Add Provider Keys
```
1. Click "Provider Keys" tab
2. Click "Add Provider Key"
3. Select provider (Google/Azure/AWS)
4. Enter API key
5. Set monthly budget
6. Click "Create"
```

### Create Your First User
```
1. Click "Users" tab
2. Click "Add User"
3. Enter email
4. Select tenant and product
5. Copy auto-generated password
6. Click "Create"
```

**✅ You're done! Start using the platform!**

---

## 📖 Full Documentation

- **Complete Features:** `FRONTEND_COMPLETE.md`
- **Testing Guide:** `DEPLOYMENT_AND_TESTING.md`
- **Tenant Admin:** `TENANT_ADMIN_IMPLEMENTATION.md`
- **MVP Summary:** `MVP_COMPLETION_SUMMARY.md`

---

## 🆘 Need Help?

### Common Issues

**Can't login?**
- Check PocketBase is running: `curl https://api.cloudfreedom.de/api/health`
- Verify credentials are correct (case-sensitive)
- Try hard refresh: Ctrl+Shift+R

**Frontend not updating?**
- Hard refresh browser
- Check Coolify deployment logs
- Verify git commit pushed

**No tenants/products?**
- Create tenant first in Tenants tab
- Check PocketBase admin UI: https://api.cloudfreedom.de/_/

---

## ✅ Quick Validation

After setup, verify:
- [ ] Can login to admin portal
- [ ] Can create tenant
- [ ] Can create product
- [ ] Can create user
- [ ] Can add provider key
- [ ] Analytics show data
- [ ] Can change password

**All checked?** 🎉 **You're production ready!**

---

## 🎊 What's Next?

1. **Onboard customers** - Create tenants and users
2. **Monitor usage** - Check analytics dashboard
3. **Add providers** - Configure AI provider keys
4. **Iterate** - Improve based on feedback

---

**Need detailed instructions?** See `DEPLOYMENT_AND_TESTING.md`

**Ready to deploy?** Run the 4 steps above! 🚀

