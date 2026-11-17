import type { CollectionSchema } from "deepspace/schema";

export const inventoryExceptionsSchema: CollectionSchema = {
  name: "inventory-exceptions",
  columns: [
    {
      name: "fingerprint",
      storage: "text",
      interpretation: "plain",
      required: true,
      immutable: true,
    },
    { name: "sku", storage: "text", interpretation: "plain" },
    {
      name: "product",
      storage: "text",
      interpretation: "plain",
      required: true,
    },
    {
      name: "warehouse",
      storage: "text",
      interpretation: "plain",
      required: true,
    },
    { name: "expected", storage: "number", interpretation: "plain" },
    { name: "counted", storage: "number", interpretation: "plain" },
    { name: "variance", storage: "number", interpretation: "plain" },
    {
      name: "type",
      storage: "text",
      interpretation: {
        kind: "select",
        options: ["MISSING_SKU", "NEGATIVE_STOCK", "QUANTITY_MISMATCH"],
      },
    },
    {
      name: "severity",
      storage: "text",
      interpretation: {
        kind: "select",
        options: ["critical", "high", "medium"],
      },
    },
    {
      name: "status",
      storage: "text",
      interpretation: {
        kind: "select",
        options: ["open", "investigating", "resolved"],
      },
    },
    { name: "assignee", storage: "text", interpretation: "plain" },
    { name: "resolution", storage: "text", interpretation: "plain" },
  ],
  uniqueOn: ["fingerprint"],
  permissions: {
    "*": { read: false, create: false, update: false, delete: false },
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: true, create: true, update: false, delete: false },
    admin: { read: true, create: true, update: false, delete: true },
  },
};

export const investigationNotesSchema: CollectionSchema = {
  name: "investigation-notes",
  columns: [
    {
      name: "exceptionId",
      storage: "text",
      interpretation: "plain",
      required: true,
      immutable: true,
    },
    {
      name: "body",
      storage: "text",
      interpretation: "plain",
      required: true,
      immutable: true,
    },
  ],
  permissions: {
    "*": { read: false, create: false, update: false, delete: false },
    viewer: { read: false, create: false, update: false, delete: false },
    member: { read: true, create: true, update: false, delete: false },
    admin: { read: true, create: true, update: false, delete: false },
  },
};
