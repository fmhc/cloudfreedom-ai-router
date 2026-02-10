// Simple PocketBase Collections Setup
const collections = [
  {
    name: "tenants",
    type: "base",
    schema: [
      { name: "name", type: "text", required: true },
      { name: "slug", type: "text", required: true },
      { name: "domain", type: "text" },
      { name: "type", type: "select", required: true, options: { values: ["internal", "demo", "public", "enterprise", "dev"] } },
      { name: "status", type: "select", required: true, options: { values: ["active", "inactive", "pending"] } }
    ]
  },
  {
    name: "products",
    type: "base",
    schema: [
      { name: "name", type: "text", required: true },
      { name: "price", type: "number", required: true },
      { name: "budget", type: "number", required: true },
      { name: "description", type: "text" }
    ]
  },
  {
    name: "provider_keys",
    type: "base",
    schema: [
      { name: "provider", type: "select", required: true, options: { values: ["google", "azure", "aws", "anthropic", "openai"] } },
      { name: "api_key", type: "text", required: true },
      { name: "budget_limit", type: "number" },
      { name: "status", type: "select", options: { values: ["active", "inactive"] } }
    ]
  },
  {
    name: "usage_logs",
    type: "base",
    schema: [
      { name: "user_id", type: "text" },
      { name: "tenant_id", type: "text" },
      { name: "model", type: "text" },
      { name: "total_tokens", type: "number" },
      { name: "cost_total", type: "number" },
      { name: "timestamp", type: "date" }
    ]
  }
];

console.log(JSON.stringify(collections, null, 2));
