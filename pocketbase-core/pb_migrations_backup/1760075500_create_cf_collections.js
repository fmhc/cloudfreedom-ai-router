/// <reference path="../pb_data/types.d.ts" />

/**
 * Create CloudFreedom collections
 */
migrate((app) => {
  console.log("📦 Creating cf_users collection...");
  
  // Create cf_users collection
  const cfUsers = new Collection({
    type: "base",
    name: "cf_users",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "email",
        type: "email",
        required: true,
        presentable: true,
      },
      {
        name: "name",
        type: "text",
        required: true,
        min: 1,
        max: 255,
        presentable: true,
      },
      {
        name: "tenant_id",
        type: "text",
        required: true,
      },
      {
        name: "product_id",
        type: "text",
        required: true,
      },
      {
        name: "role",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["user", "tenant_admin", "super_admin"],
      },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["pending", "active", "suspended"],
      },
      {
        name: "budget_limit",
        type: "number",
        required: false,
        min: 0,
        noDecimal: false,
      },
      {
        name: "budget_used",
        type: "number",
        required: false,
        min: 0,
        noDecimal: false,
      },
      {
        name: "api_key",
        type: "text",
        required: false,
      },
      {
        name: "last_login",
        type: "date",
        required: false,
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_cf_users_email ON cf_users (email) WHERE email != ''",
      "CREATE INDEX idx_cf_users_tenant_id ON cf_users (tenant_id)",
    ],
  });

  app.save(cfUsers);
  console.log("✅ cf_users collection created");

  console.log("📦 Creating usage_logs collection...");
  
  // Create usage_logs collection
  const usageLogs = new Collection({
    type: "base",
    name: "usage_logs",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "tenant_id",
        type: "text",
        required: true,
      },
      {
        name: "user_id",
        type: "text",
        required: true,
      },
      {
        name: "model",
        type: "text",
        required: true,
        min: 0,
        max: 255,
      },
      {
        name: "input_tokens",
        type: "number",
        required: true,
        min: 0,
        noDecimal: false,
      },
      {
        name: "output_tokens",
        type: "number",
        required: true,
        min: 0,
        noDecimal: false,
      },
      {
        name: "total_tokens",
        type: "number",
        required: true,
        min: 0,
        noDecimal: false,
      },
      {
        name: "cost",
        type: "number",
        required: true,
        min: 0,
        noDecimal: false,
      },
      {
        name: "request_id",
        type: "text",
        required: false,
      },
      {
        name: "metadata",
        type: "json",
        required: false,
      },
    ],
    indexes: [
      "CREATE INDEX idx_usage_logs_tenant ON usage_logs (tenant_id)",
      "CREATE INDEX idx_usage_logs_user ON usage_logs (user_id)",
    ],
  });

  app.save(usageLogs);
  console.log("✅ usage_logs collection created");

}, (app) => {
  // Down migration
  app.deleteCollection(app.findCollectionByNameOrId("cf_users"));
  app.deleteCollection(app.findCollectionByNameOrId("usage_logs"));
});

