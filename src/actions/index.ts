import { resolveAppRole } from 'deepspace/worker'
import type { ActionHandler } from 'deepspace/worker'
import type { Env } from '../../worker'

type CaseStatus = 'open' | 'investigating' | 'resolved'

type Investigation = {
  status: CaseStatus
  resolution?: string
}

const validStatuses = new Set<CaseStatus>([
  'open',
  'investigating',
  'resolved',
])

export const actions: Record<string, ActionHandler<Env>> = {
  updateInvestigation: async ({ userId, env, params, tools }) => {
    const role = userId === env.OWNER_USER_ID
      ? 'admin'
      : await resolveAppRole(env, userId)

    if (role !== 'admin' && role !== 'member') {
      return { success: false, error: 'Insufficient permissions' }
    }

    const recordId = params.recordId

    if (typeof recordId !== 'string' || !recordId.trim()) {
      return { success: false, error: 'Invalid investigation ID' }
    }

    const existing = await tools.get<Investigation>(
      'inventory-exceptions',
      recordId,
    )

    if (!existing.success) {
      return { success: false, error: 'Investigation not found' }
    }

    const current = existing.data.record.data
    const patch: Partial<Investigation> = {}

    if (params.status !== undefined) {
      if (
        typeof params.status !== 'string' ||
        !validStatuses.has(params.status as CaseStatus)
      ) {
        return { success: false, error: 'Invalid investigation status' }
      }

      patch.status = params.status as CaseStatus
    }

    if (params.resolution !== undefined) {
      if (typeof params.resolution !== 'string') {
        return { success: false, error: 'Invalid resolution summary' }
      }

      const resolution = params.resolution.trim()

      if (resolution.length > 1500) {
        return { success: false, error: 'Resolution exceeds 1500 characters' }
      }

      patch.resolution = resolution
    }

    if (Object.keys(patch).length === 0) {
      return { success: false, error: 'No changes submitted' }
    }

    const nextStatus = patch.status ?? current.status
    const nextResolution = patch.resolution ?? current.resolution ?? ''

    if (nextStatus === 'resolved' && !nextResolution.trim()) {
      return {
        success: false,
        error: 'A resolution summary is required before closing an investigation',
      }
    }

    const result = await tools.update(
      'inventory-exceptions',
      recordId,
      patch,
    )

    if (!result.success) {
      return result
    }

    return {
      success: true,
      data: {
        recordId,
        status: nextStatus,
        resolution: nextResolution,
      },
    }
  },
}
