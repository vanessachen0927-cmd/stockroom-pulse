
import { inventoryExceptionsSchema, investigationNotesSchema } from './schemas/stockroom-schema'
import { CHANNELS_SCHEMA, MESSAGES_SCHEMA, REACTIONS_SCHEMA, CHANNEL_MEMBERS_SCHEMA, READ_RECEIPTS_SCHEMA } from 'deepspace/schema'
/**
 * Collection Schemas
 *
 * All collections with columns and RBAC permissions.
 * Single source of truth — imported by both worker and frontend.
 *
 * Add schemas by creating a file in src/schemas/ and importing it here.
 */

import type { CollectionSchema } from 'deepspace/schema'
import { usersSchema } from './schemas/users-schema'
import { settingsSchema } from './schemas/admin-schema'

export const schemas: CollectionSchema[] = [inventoryExceptionsSchema, investigationNotesSchema, CHANNELS_SCHEMA, MESSAGES_SCHEMA, REACTIONS_SCHEMA, CHANNEL_MEMBERS_SCHEMA, READ_RECEIPTS_SCHEMA, 
  usersSchema,
  settingsSchema,
]
