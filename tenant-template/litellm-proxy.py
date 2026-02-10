"""
CloudFreedom LiteLLM Proxy Custom Configuration
================================================

This module provides custom callbacks for budget checking and usage tracking
integrated with the CloudFreedom Billing API.

Features:
- Pre-request budget validation
- Real-time usage tracking
- Cost estimation before API calls
- Automatic budget deduction after successful calls
"""

import os
import httpx
from typing import Optional, Dict, Any
from litellm.integrations.custom_logger import CustomLogger
import litellm

# Configuration from environment variables
BILLING_API_URL = os.getenv("BILLING_API_URL", "http://billing-api:3000")
BILLING_API_KEY = os.getenv("BILLING_API_KEY", "")
TENANT_ID = os.getenv("TENANT_ID", "")


class CloudFreedomBudgetLogger(CustomLogger):
    """
    Custom logger that checks budget before making AI API calls
    and tracks usage after completion.
    """

    def __init__(self):
        super().__init__()
        self.client = httpx.AsyncClient(timeout=10.0)

    async def async_pre_call_hook(
        self, user_api_key_dict: Dict[str, Any], cache: Any, data: Dict[str, Any], call_type: str
    ):
        """
        Called BEFORE making the AI API call.
        Checks if user has sufficient budget.
        """
        try:
            # Extract user info
            user_id = user_api_key_dict.get("user_id") or data.get("user", "anonymous")
            model = data.get("model", "unknown")
            
            # Estimate cost based on model (simplified, adjust based on actual pricing)
            cost_estimates = {
                "gpt-5": 0.10,
                "gpt-5-mini": 0.02,
                "claude-4-opus": 0.15,
                "claude-4-sonnet": 0.05,
                "gemini-2.5-pro": 0.03,
                "gemini-2.5-flash": 0.01,
                # Fallback for unknown models
                "default": 0.05
            }
            
            # Get cost estimate for this model
            cost_estimate = cost_estimates.get(model, cost_estimates["default"])
            
            # Check budget with Billing API
            response = await self.client.post(
                f"{BILLING_API_URL}/api/check-budget",
                json={
                    "user_id": user_id,
                    "tenant_id": TENANT_ID,
                    "model": model,
                    "cost_estimate": cost_estimate
                },
                headers={
                    "X-API-Key": BILLING_API_KEY,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                result = response.json()
                if not result.get("allowed", False):
                    # Budget exceeded - raise exception to prevent API call
                    raise Exception(
                        f"Budget exceeded for user {user_id}. "
                        f"Remaining: ${result.get('remaining_budget', 0):.2f}"
                    )
                    
        except httpx.HTTPError as e:
            # Log error but don't block request (fail-open for availability)
            print(f"Budget check failed (allowing request): {e}")
        except Exception as e:
            # Budget exceeded or other errors - block the request
            if "Budget exceeded" in str(e):
                raise
            print(f"Unexpected error in budget check: {e}")

    async def async_log_success_event(self, kwargs, response_obj, start_time, end_time):
        """
        Called AFTER successful AI API call.
        Logs usage and deducts cost from budget.
        """
        try:
            # Extract usage information
            user_id = kwargs.get("user", "anonymous")
            model = kwargs.get("model", "unknown")
            
            # Get token usage from response
            usage = response_obj.get("usage", {})
            prompt_tokens = usage.get("prompt_tokens", 0)
            completion_tokens = usage.get("completion_tokens", 0)
            total_tokens = usage.get("total_tokens", 0)
            
            # Calculate actual cost (simplified - adjust based on actual pricing)
            cost = self._calculate_cost(model, prompt_tokens, completion_tokens)
            
            # Log usage to Billing API
            await self.client.post(
                f"{BILLING_API_URL}/api/usage/log",
                json={
                    "user_id": user_id,
                    "tenant_id": TENANT_ID,
                    "model": model,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": total_tokens,
                    "cost": cost,
                    "timestamp": start_time.isoformat() if hasattr(start_time, 'isoformat') else None
                },
                headers={
                    "X-API-Key": BILLING_API_KEY,
                    "Content-Type": "application/json"
                }
            )
            
        except Exception as e:
            print(f"Error logging usage: {e}")

    def _calculate_cost(self, model: str, prompt_tokens: int, completion_tokens: int) -> float:
        """
        Calculate cost based on model and token usage.
        Prices per 1M tokens (adjust based on actual provider pricing).
        """
        pricing = {
            # 2025 Models (estimated pricing)
            "gpt-5": {"prompt": 50.0, "completion": 150.0},
            "gpt-5-mini": {"prompt": 10.0, "completion": 30.0},
            "claude-4-opus": {"prompt": 60.0, "completion": 180.0},
            "claude-4-sonnet": {"prompt": 15.0, "completion": 45.0},
            "gemini-2.5-pro": {"prompt": 7.0, "completion": 21.0},
            "gemini-2.5-flash": {"prompt": 0.5, "completion": 1.5},
            
            # 2024 Models (actual pricing)
            "gpt-4o": {"prompt": 2.5, "completion": 10.0},
            "gpt-4o-mini": {"prompt": 0.15, "completion": 0.6},
            "claude-3.5-sonnet": {"prompt": 3.0, "completion": 15.0},
            "gemini-1.5-pro": {"prompt": 3.5, "completion": 10.5},
            "gemini-1.5-flash": {"prompt": 0.35, "completion": 1.05},
            
            # Default
            "default": {"prompt": 5.0, "completion": 15.0}
        }
        
        model_pricing = pricing.get(model, pricing["default"])
        
        prompt_cost = (prompt_tokens / 1_000_000) * model_pricing["prompt"]
        completion_cost = (completion_tokens / 1_000_000) * model_pricing["completion"]
        
        return prompt_cost + completion_cost

    async def async_log_failure_event(self, kwargs, response_obj, start_time, end_time):
        """
        Called when AI API call fails.
        Log the failure for monitoring.
        """
        try:
            user_id = kwargs.get("user", "anonymous")
            model = kwargs.get("model", "unknown")
            
            print(f"API call failed for user {user_id}, model {model}: {response_obj}")
            
        except Exception as e:
            print(f"Error logging failure: {e}")


# Initialize custom logger
custom_logger = CloudFreedomBudgetLogger()
litellm.callbacks = [custom_logger]

