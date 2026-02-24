# Security Audit — Agent Platform Templates

**Audit Date:** 2026-02-16  
**Scope:** templates/openclaw-agent, templates/telegram-bot, templates/base-llm

## 🔍 Security Issues Identified

### 1. Missing Security Capabilities

**Issue:** Alle Templates fehlen `cap_drop: ALL` für minimale Privilegien  
**Risk:** Container können unnötige System Capabilities nutzen  
**Fix:** Hinzufügen von `security_opt` und `cap_drop`

### 2. Root User Execution

**Issue:** Container laufen als root (Standard Docker Verhalten)  
**Risk:** Privilege Escalation bei Container Breakout  
**Fix:** Non-root user explizit setzen oder Images mit USER directive nutzen

### 3. Writable Filesystem

**Issue:** Filesystem ist vollständig beschreibbar  
**Risk:** Malware/Code-Injection in Container  
**Fix:** `read_only: true` wo möglich + tmpfs für temporäre Dateien

### 4. Network Security

**Issue:** Alle Container im default Docker Bridge Network  
**Risk:** Cross-tenant container communication möglich  
**Fix:** Isolierte Networks pro Stack mit expliziter Service-zu-Service Communication

### 5. Resource Limits

**Issue:** Memory/CPU Limits vorhanden, aber nicht optimal  
**Risk:** Resource exhaustion attacks  
**Status:** ✅ Größtenteils OK, kleine Optimierungen möglich

### 6. Secrets Handling

**Issue:** API Keys als plain text Environment Variables  
**Risk:** Secrets in Process Lists/Logs sichtbar  
**Fix:** Docker Secrets oder File-based Secrets

### 7. Health Checks

**Issue:** Basic Health Checks, aber teilweise ineffektiv  
**Risk:** Unhealthy containers laufen weiter  
**Status:** ⚠️ Funktional aber verbesserungswürdig

## 🛡️ Hardened Template Improvements

### Security Context (alle Templates):
```yaml
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
```

### Non-Root User:
```yaml
user: "1000:1000"  # oder image-spezifisch
```

### Read-Only Filesystem:
```yaml
read_only: true
tmpfs:
  - /tmp:noexec,nosuid,size=100m
```

### Network Isolation:
```yaml
networks:
  - stack-internal
# Keine external networks falls nicht nötig
```

### Improved Logging:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 📋 Template-Spezifische Fixes

### OpenClaw Agent
- ✅ Resource limits OK
- ❌ Add cap_drop, security_opt
- ❌ Add non-root user
- ⚠️ Workspace volume needs write access (kann nicht read-only sein)
- ✅ Labels sind gut

### Telegram Bot  
- ✅ Kein public ingress (traefik disabled)
- ❌ Add cap_drop, security_opt  
- ❌ Add non-root user
- ✅ Can use read_only filesystem
- ⚠️ Healthcheck könnte besser sein

### Base LLM (LiteLLM + OpenWebUI)
- ⚠️ Höhere Resource-Usage (OpenWebUI needs 6GB RAM limit)
- ❌ Add cap_drop, security_opt für beide Services
- ❌ Add non-root user
- ❌ Config file als bind mount (Security Risk)
- ✅ Service-zu-Service networking OK

## 🚨 Critical Security Gaps

1. **Cross-Tenant Isolation**: Derzeit nur durch Network Names getrennt
2. **Secrets in Plain Text**: API Keys sichtbar in env vars
3. **Privileged Container Execution**: Alle Templates laufen als root
4. **Config File Exposure**: LiteLLM bindet host file system

## ✅ Recommended Actions

1. **SOFORT**: cap_drop: ALL zu allen Templates hinzufügen
2. **SOFORT**: security_opt: no-new-privileges zu allen Templates
3. **Kurz-term**: Non-root user für alle Images konfigurieren  
4. **Mittel-term**: Secrets Management über Docker Secrets
5. **Lang-term**: Runtime Security Monitoring (Falco)

## 📊 Security Score

| Template | Security Score | Critical Issues |
|----------|---------------|-----------------|
| openclaw-agent | 6/10 | Root user, missing cap_drop |
| telegram-bot | 7/10 | Root user, missing cap_drop |
| base-llm | 5/10 | Root user, missing cap_drop, config exposure |

**Overall Platform Security:** ⚠️ **Needs Immediate Hardening**