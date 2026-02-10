#!/bin/bash
set -e

# Create LiteLLM config with LATEST WORKING models
cat > /app/config.yaml << EOF
model_list:
  # ===================================================
  # GOOGLE GEMINI - LATEST (2024/2025)
  # ===================================================
  
  # Gemini 2.0 Flash (NEWEST - December 2024)
  - model_name: gemini-2.0-flash
    litellm_params:
      model: gemini/gemini-2.0-flash-exp
      api_key: ${GOOGLE_API_KEY}
    model_info:
      mode: chat
      supports_function_calling: true
      supports_vision: true
      max_tokens: 1048576
      input_cost_per_token: 0.0
      output_cost_per_token: 0.0
  
  # Gemini 1.5 Pro (Stable)
  - model_name: gemini-1.5-pro
    litellm_params:
      model: gemini/gemini-1.5-pro
      api_key: ${GOOGLE_API_KEY}
    model_info:
      mode: chat
      supports_function_calling: true
      supports_vision: true
      max_tokens: 2097152
      input_cost_per_token: 0.00000125
      output_cost_per_token: 0.000005
  
  # Gemini 1.5 Flash (Fast & Cheap)
  - model_name: gemini-1.5-flash
    litellm_params:
      model: gemini/gemini-1.5-flash
      api_key: ${GOOGLE_API_KEY}
    model_info:
      mode: chat
      supports_function_calling: true
      supports_vision: true
      max_tokens: 1048576
      input_cost_per_token: 0.000000075
      output_cost_per_token: 0.0000003
  
  # Gemini 1.5 Flash-8B (Ultra Fast)
  - model_name: gemini-1.5-flash-8b
    litellm_params:
      model: gemini/gemini-1.5-flash-8b
      api_key: ${GOOGLE_API_KEY}
    model_info:
      mode: chat
      supports_function_calling: true
      max_tokens: 1048576
      input_cost_per_token: 0.0000000375
      output_cost_per_token: 0.00000015

general_settings:
  master_key: ${LITELLM_MASTER_KEY}
  database_url: ${DATABASE_URL}
  redis_host: redis
  redis_port: 6379
  redis_password: ${REDIS_PASSWORD}
  max_budget: 1000
  budget_duration: "30d"
  
  fallbacks:
    - gemini-2.0-flash: ["gemini-1.5-flash", "gemini-1.5-pro"]
    - gemini-1.5-flash: ["gemini-1.5-flash-8b", "gemini-1.5-pro"]
    - gemini-1.5-pro: ["gemini-1.5-flash", "gemini-2.0-flash"]
    - gemini-1.5-flash-8b: ["gemini-1.5-flash"]

litellm_settings:
  drop_params: true
  num_retries: 3
  request_timeout: 600
  stream: true
  rpm: 500
  tpm: 100000
EOF

echo "✅ Config created with LATEST Gemini models"
echo "📝 Models: gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash, gemini-1.5-flash-8b"
echo "📝 DATABASE_URL: ${DATABASE_URL}"

# Start LiteLLM
exec litellm --config /app/config.yaml "$@"
