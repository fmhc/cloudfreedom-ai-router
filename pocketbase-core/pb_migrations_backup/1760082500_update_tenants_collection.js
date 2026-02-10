/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new DaoUtil(db)
  const collection = dao.findCollectionByNameOrId("tenants")

  // Add fields to tenants collection
  collection.schema.addField(new SchemaField({
    system: false,
    id: "tenant_name",
    name: "name",
    type: "text",
    required: true,
    presentable: false,
    unique: false,
    options: {
      min: null,
      max: null,
      pattern: ""
    }
  }))

  collection.schema.addField(new SchemaField({
    system: false,
    id: "tenant_slug",
    name: "slug",
    type: "text",
    required: true,
    presentable: false,
    unique: true,
    options: {
      min: null,
      max: null,
      pattern: "^[a-z0-9-]+$"
    }
  }))

  collection.schema.addField(new SchemaField({
    system: false,
    id: "tenant_domain",
    name: "domain",
    type: "text",
    required: false,
    presentable: false,
    unique: false,
    options: {
      min: null,
      max: null,
      pattern: ""
    }
  }))

  collection.schema.addField(new SchemaField({
    system: false,
    id: "tenant_type",
    name: "type",
    type: "select",
    required: true,
    presentable: false,
    unique: false,
    options: {
      maxSelect: 1,
      values: [
        "internal",
        "demo",
        "public",
        "enterprise"
      ]
    }
  }))

  collection.schema.addField(new SchemaField({
    system: false,
    id: "tenant_status",
    name: "status",
    type: "select",
    required: true,
    presentable: false,
    unique: false,
    options: {
      maxSelect: 1,
      values: [
        "active",
        "inactive",
        "pending"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new DaoUtil(db)
  const collection = dao.findCollectionByNameOrId("tenants")

  // Remove the fields
  collection.schema.removeField("tenant_name")
  collection.schema.removeField("tenant_slug")
  collection.schema.removeField("tenant_domain")
  collection.schema.removeField("tenant_type")
  collection.schema.removeField("tenant_status")

  return dao.saveCollection(collection)
})

