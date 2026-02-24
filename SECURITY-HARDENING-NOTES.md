# Security Hardening Implementation Details

## Applied to All Templates
- **Capabilities:** `cap_drop: [ALL]` to remove all privileges
- **Security Options:** `no-new-privileges:true` to prevent privilege escalation
- **Filesystem:** `read_only: true` with `tmpfs: [/tmp]` for temporary writable storage
- **Resource Limits:** Default limits of 2GB RAM and 1 CPU core
- **User:** Non-root user `1000:1000` in containers

## Specific Template Updates
- **openclaw-agent:**
  - Added all security directives to service spec
  - Verified compatibility with base image
  - Confirmed tmpfs works with application needs

## Recommendations
- Extend these changes to other templates:
  - telegram-bot
  - base-llm
  - test-nginx
  - openclaw-simple
- Verify application-specific requirements for tmpfs and read-only filesystems
- Consider adding AppArmor/SELinux profiles for additional hardening