
import { inventoryExceptionsSchema, investigationNotesSchema } from './schemas/stockroom-schema'
import { CHANNELS_SCHEMA, MESSAGES_SCHEMA, REACTIONS_SCHEMA, CHANNEL_MEMBERS_SCHEMA, READ_RECEIPTS_SCHEMA } from 'deepspace/schema'


import type { CollectionSchema } from 'deepspace/schema'
import { usersSchema } from './schemas/users-schema'
import { settingsSchema } from './schemas/admin-schema'

export const schemas: CollectionSchema[] = [inventoryExceptionsSchema, investigationNotesSchema, CHANNELS_SCHEMA, MESSAGES_SCHEMA, REACTIONS_SCHEMA, CHANNEL_MEMBERS_SCHEMA, READ_RECEIPTS_SCHEMA, 
  usersSchema,
  settingsSchema,
]
