# 📊 CloudFreedom AI Router - Configuration Comparison

**Current vs Updated (2025)**

---

## 🔴 **CURRENT CONFIGURATION** (OLD - 2024 Models)

**File:** `litellm-config.yaml` ❌ **OUTDATED**

### Available Models (8 total):

| Model Name | Provider | Version | Context | Status |
|------------|----------|---------|---------|--------|
| `gemini-1.5-flash` | Google Vertex AI | 2024 | 8K | ❌ Old |
| `gemini-1.5-pro` | Google Vertex AI | 2024 | 8K | ❌ Old |
| `gpt-4o` | Azure OpenAI | May 2024 | 16K | ❌ Old |
| `gpt-4o-mini` | Azure OpenAI | May 2024 | 16K | ❌ Old |
| `claude-3.5-sonnet` | AWS Bedrock | June 2024 | 8K | ❌ Old |
| `claude-3-opus` | AWS Bedrock | Feb 2024 | 4K | ❌ Old |
| `claude-3-haiku` | AWS Bedrock | Mar 2024 | 4K | ❌ Old |

**Routing Aliases:**
- `fast`: gemini-1.5-flash, claude-3-haiku, gpt-4o-mini
- `balanced`: gemini-1.5-pro, claude-3-haiku
- `premium`: gpt-4o, claude-3.5-sonnet, claude-3-opus

---

## 🟢 **UPDATED CONFIGURATION** (NEW - 2025 Models)

**File:** `litellm-config-2025-updated.yaml` ✅ **LATEST**

### Available Models (13 total):

#### **Google Gemini 2.5** (NEW! 🆕)
| Model Name | Version | Context | Features |
|------------|---------|---------|----------|
| `gemini-2.5-pro` | June 2025 | **1M tokens!** | Chat, Vision, Audio, Video |
| `gemini-2.5-flash` | June 2025 | **1M tokens!** | Chat, Vision, Audio, Video |
| `gemini-1.5-pro` | 2024 (fallback) | 1M tokens | Chat, Vision |

#### **OpenAI GPT-5** (NEW! 🆕)
| Model Name | Version | Context | Features |
|------------|---------|---------|----------|
| `gpt-5` | August 2025 | 32K | Chat, Vision, **Reasoning** |
| `gpt-5-mini` | August 2025 | 32K | Chat, Vision |
| `gpt-4o` | May 2024 (fallback) | 16K | Chat, Vision |

#### **Anthropic Claude 4** (NEW! 🆕)
| Model Name | Version | Context | Features |
|------------|---------|---------|----------|
| `claude-4-opus` | August 2025 | 16K | Chat, Vision, Advanced Reasoning |
| `claude-4-sonnet` | August 2025 | 16K | Chat, Vision |
| `claude-3.5-sonnet` | June 2024 (fallback) | 8K | Chat, Vision |
| `claude-3-haiku` | Mar 2024 (cheap) | 4K | Chat |

**Routing Aliases (Updated):**
- `fast`: gemini-2.5-flash, gpt-5-mini, claude-3-haiku
- `balanced`: gemini-2.5-pro, claude-4-sonnet, gpt-5
- `premium`: claude-4-opus, gpt-5, gemini-2.5-pro
- `long-context`: gemini-2.5-pro, gemini-2.5-flash (1M tokens!)
- `reasoning`: gpt-5, claude-4-opus

---

## 🌐 **API ENDPOINTS** (When Deployed)

### **LiteLLM Proxy Endpoint:**
```
https://ai.cloudfreedom.de/v1/chat/completions
```

### **Example API Calls:**

#### **Using NEW Models:**

**GPT-5:**
```bash
curl -X POST https://ai.cloudfreedom.de/v1/chat/completions \
  -H "Authorization: Bearer YOUR_LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "messages": [{"role": "user", "content": "Hello from GPT-5!"}]
  }'
```

**Gemini 2.5 Pro (1M context!):**
```bash
curl -X POST https://ai.cloudfreedom.de/v1/chat/completions \
  -H "Authorization: Bearer YOUR_LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [{"role": "user", "content": "Hello from Gemini 2.5!"}]
  }'
```

**Claude 4 Opus:**
```bash
curl -X POST https://ai.cloudfreedom.de/v1/chat/completions \
  -H "Authorization: Bearer YOUR_LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-4-opus",
    "messages": [{"role": "user", "content": "Hello from Claude 4!"}]
  }'
```

#### **Using Routing Aliases:**

**Fast & Cheap:**
```bash
curl -X POST https://ai.cloudfreedom.de/v1/chat/completions \
  -H "Authorization: Bearer YOUR_LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "fast",
    "messages": [{"role": "user", "content": "Quick response needed"}]
  }'
# Routes to: gemini-2.5-flash or gpt-5-mini
```

**Long Context (1M tokens!):**
```bash
curl -X POST https://ai.cloudfreedom.de/v1/chat/completions \
  -H "Authorization: Bearer YOUR_LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "long-context",
    "messages": [{"role": "user", "content": "Analyze this entire codebase..."}]
  }'
# Routes to: gemini-2.5-pro or gemini-2.5-flash
```

**Advanced Reasoning:**
```bash
curl -X POST https://ai.cloudfreedom.de/v1/chat/completions \
  -H "Authorization: Bearer YOUR_LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "reasoning",
    "messages": [{"role": "user", "content": "Solve this complex math problem..."}]
  }'
# Routes to: gpt-5 or claude-4-opus
```

---

## 📈 **COST COMPARISON**

### Input Costs (per 1M tokens):

| Model | OLD Config | NEW Config | Difference |
|-------|-----------|-----------|------------|
| **Fastest** | $0.075 (gemini-1.5-flash) | $0.075 (gemini-2.5-flash) | ✅ Same |
| **Balanced** | $1.25 (gemini-1.5-pro) | $1.25 (gemini-2.5-pro) | ✅ Same |
| **Premium** | $2.50 (gpt-4o) | $10.00 (gpt-5) | ⚠️ 4x higher |
| **Top Tier** | $15.00 (claude-3-opus) | $15.00 (claude-4-opus) | ✅ Similar |

### Key Insights:
- ✅ **Gemini 2.5**: Same cost, 100x more context (1M vs 8K tokens)!
- ⚠️ **GPT-5**: 4x more expensive, but unified reasoning + coding
- ✅ **Claude 4**: Similar cost to Claude 3
- 💡 **Recommendation**: Start with Gemini 2.5 (best value)

---

## 🔄 **FALLBACK STRATEGY**

### OLD Config (2024):
```
gemini-1.5-flash → gemini-1.5-pro → claude-3-haiku
gpt-4o → claude-3.5-sonnet → gemini-1.5-pro
```

### NEW Config (2025):
```
gemini-2.5-flash → gemini-2.5-pro → gemini-1.5-flash → (OLD MODELS)
gpt-5 → claude-4-sonnet → gemini-2.5-pro → gpt-4o → (OLD MODELS)
claude-4-opus → gpt-5 → gemini-2.5-pro → (OLD MODELS)
```

**Advantage:** Tries 2025 models first, falls back to 2024 models if unavailable.

---

## 🎯 **WHAT'S NEW IN 2025 CONFIG**

### **Major Improvements:**

1. **1 Million Token Context** 🚀
   - Gemini 2.5 Pro/Flash: Process entire codebases, books, videos!
   - OLD: Max 16K tokens (GPT-4o)
   - NEW: Max 1M tokens (Gemini 2.5) = **62x increase!**

2. **Advanced Reasoning** 🧠
   - GPT-5: Unified reasoning + coding model
   - Claude 4 Opus: Enhanced logical capabilities
   - OLD: Standard chat models
   - NEW: Specialized reasoning engines

3. **Multimodal Audio/Video** 🎥
   - Gemini 2.5: Native audio and video understanding
   - OLD: Text + images only
   - NEW: Text + images + audio + video

4. **Better Fallbacks** 🔄
   - Smart cascading from 2025 → 2024 models
   - Keeps old models as safety net
   - Higher reliability

5. **Optimized Routing** 🎯
   - NEW: `long-context` alias (1M tokens)
   - NEW: `reasoning` alias (advanced problem-solving)
   - Better cost-based routing

---

## 📋 **DEPLOYMENT CHECKLIST**

### **Before Switching to New Config:**

- [ ] **Verify Access:**
  - [ ] Azure Portal: Check if GPT-5 deployments available
  - [ ] GCP Console: Verify Gemini 2.5 enabled in Vertex AI
  - [ ] AWS Console: Confirm Claude 4 model access in Bedrock

- [ ] **Backup Current Config:**
  ```bash
  cp litellm-config.yaml litellm-config-OLD-2024.yaml
  ```

- [ ] **Update Environment Variables:**
  ```bash
  # Add if using GPT-5:
  AZURE_GPT5_DEPLOYMENT_NAME=gpt-5
  AZURE_GPT5_MINI_DEPLOYMENT_NAME=gpt-5-mini
  ```

- [ ] **Test Models:**
  - [ ] Test at least one 2025 model from each provider
  - [ ] Verify fallbacks work
  - [ ] Check cost tracking

- [ ] **Gradual Rollout:**
  - [ ] Week 1: Add Gemini 2.5 (safest, same cost)
  - [ ] Week 2: Add Claude 4 (moderate risk)
  - [ ] Week 3: Add GPT-5 (expensive, monitor closely)

---

## 🎊 **SUMMARY**

### **Current Status:**
- ✅ Created NEW configuration file with 2025 models
- ✅ Added 5 new models (GPT-5, Gemini 2.5, Claude 4)
- ✅ Kept 2024 models as fallbacks
- ✅ Updated routing and fallback strategies
- ⏳ **NOT YET DEPLOYED** (needs your approval)

### **Files Location:**
```
/home/fmh/ai/cloudfreedom-ai-router/tenant-template/
├── litellm-config.yaml                    ❌ OLD (2024 models)
└── litellm-config-2025-updated.yaml       ✅ NEW (2025 models)
```

### **To Deploy:**
```bash
cd /home/fmh/ai/cloudfreedom-ai-router/tenant-template

# Option 1: Replace directly
cp litellm-config-2025-updated.yaml litellm-config.yaml

# Option 2: Keep both and choose at runtime
# Set env var: LITELLM_CONFIG_FILE=litellm-config-2025-updated.yaml
```

---

## 🔥 **RECOMMENDATION**

### **Deploy in 3 Phases:**

**Phase 1 (This Week):** Add Gemini 2.5
- Lowest risk (same cost as 1.5)
- Highest benefit (1M context!)
- Just uncomment Gemini 2.5 models

**Phase 2 (Next Week):** Add Claude 4
- Moderate cost increase
- Better reasoning
- Good middle ground

**Phase 3 (Week 3):** Add GPT-5 (Optional)
- Highest cost (4x GPT-4o)
- Best for specialized tasks
- Monitor usage closely

---

**Ready to deploy?** Let me know and I'll help you switch the configuration! 🚀

