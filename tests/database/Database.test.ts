import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Database } from 'src/database/Database'
import { DatabaseSaveMode } from 'src/types/database'
import { createAppOptions } from '../helpers'

vi.mock('src/utils/fetch', () => ({
  apiRequest: vi.fn(),
}))

import { apiRequest } from 'src/utils/fetch'

const mockApiRequest = vi.mocked(apiRequest)

describe('Database', () => {
  let db: Database

  beforeEach(() => {
    vi.clearAllMocks()
    db = new Database(createAppOptions(), 'test-collection')
  })

  describe('getRows', () => {
    const rawResponse = {
      success: true,
      data: [{ _id: 'row1', data: { title: 'Test' } }],
      count: 1,
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.getRows({ limit: 10 })
      expect(result).toEqual([{ _id: 'row1', data: { title: 'Test' } }])
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.getRows({ limit: 10 }, { ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })

    it('includes collectionId in URL', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      await db.getRows()

      expect(mockApiRequest).toHaveBeenCalledWith(
        'https://api.test.local/api/test-app/database/test-collection/row',
        expect.any(Object),
      )
    })

    it('forwards createdAt to request payload when provided', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      await db.getRows({ createdAt: '2024-01-01' })

      const [, requestInit] = mockApiRequest.mock.calls[0]
      const payload = JSON.parse(String(requestInit.body))
      expect(payload.createdAt).toBe('2024-01-01')
    })

    it('omits createdAt from request payload when not provided', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      await db.getRows({ limit: 10 })

      const [, requestInit] = mockApiRequest.mock.calls[0]
      const payload = JSON.parse(String(requestInit.body))
      expect(payload).not.toHaveProperty('createdAt')
    })

    it('supports optimised response mode and keeps unwrapped data', async () => {
      const rawOptimisedResponse = {
        success: true,
        data: [{ _id: 'row1', data: { title: 'Test' } }],
        count: 1,
      }
      mockApiRequest.mockResolvedValue(rawOptimisedResponse as any)

      const result = await db.getRows({
        hasOptimiseResponse: true,
        limit: 10,
      })

      expect(result).toEqual([{ _id: 'row1', data: { title: 'Test' } }])
    })
  })

  describe('countRows', () => {
    const rawResponse = { success: true, code: 200, count: 42, data: 42 }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.countRows()
      expect(result).toBe(42)
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.countRows({}, { ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })
  })

  describe('getRow', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'row1', data: { title: 'Test' } },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.getRow('row1')
      expect(result).toEqual({ _id: 'row1', data: { title: 'Test' } })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.getRow('row1', {}, { ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })
  })

  describe('createRow', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'row2', data: { title: 'New' } },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.createRow({ title: 'New' })
      expect(result).toEqual({ _id: 'row2', data: { title: 'New' } })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.createRow({ title: 'New' }, {}, { ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })
  })

  describe('updateRow', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'row1', data: { title: 'Updated' } },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.updateRow('row1', { title: 'Updated' })
      expect(result).toEqual({ _id: 'row1', data: { title: 'Updated' } })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.updateRow('row1', { title: 'Updated' }, {}, { ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })

    it('sends lowercase saveMode and returns minimal async data when saveMode=ASYNC', async () => {
      const rawAsyncResponse = {
        success: true,
        data: { _id: 'row1', data: { title: 'Updated' } },
      }
      mockApiRequest.mockResolvedValue(rawAsyncResponse as any)

      const result = await db.updateRow(
        'row1',
        { title: 'Updated' },
        { saveMode: DatabaseSaveMode.ASYNC },
      )

      expect(result).toEqual(rawAsyncResponse.data)

      const [, requestInit] = mockApiRequest.mock.calls[0]
      const payload = JSON.parse(String(requestInit.body))
      expect(payload.saveMode).toBe('async')
    })

    it('returns full async response with ignoreFormatResponse: true', async () => {
      const rawAsyncResponse = {
        success: true,
        data: { _id: 'row1', data: { title: 'Updated' } },
      }
      mockApiRequest.mockResolvedValue(rawAsyncResponse as any)

      const result = await db.updateRow(
        'row1',
        { title: 'Updated' },
        { saveMode: DatabaseSaveMode.ASYNC },
        { ignoreFormatResponse: true },
      )

      expect(result).toEqual(rawAsyncResponse)
    })
  })

  describe('bulkUpdate', () => {
    const rawResponse = {
      success: true,
      data: { modifiedCount: 5, matchedCount: 5 },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.bulkUpdate({
        query: { $and: [{ 'data.status': { $eq: 'pending' } }] },
        data: { status: 'active' },
        notice: 'bulk update',
      })
      expect(result).toEqual({ modifiedCount: 5, matchedCount: 5 })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.bulkUpdate(
        {
          query: { $and: [{ 'data.status': { $eq: 'pending' } }] },
          data: { status: 'active' },
          notice: 'bulk update',
        },
        { ignoreFormatResponse: true },
      )
      expect(result).toEqual(rawResponse)
    })
  })

  describe('deleteRow', () => {
    const rawResponse = { success: true, data: { deletedCount: 1 } }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.deleteRow('row1')
      expect(result).toEqual({ deletedCount: 1 })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.deleteRow('row1', { ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })
  })

  describe('deleteRows', () => {
    const rawResponse = { success: true, data: { deletedCount: 3 } }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.deleteRows(['r1', 'r2', 'r3'])
      expect(result).toEqual({ deletedCount: 3 })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.deleteRows(['r1', 'r2', 'r3'], { ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })
  })

  describe('triggerButton', () => {
    const rawResponse = { success: true, data: { triggered: true } }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.triggerButton('row1', 'col1')
      expect(result).toEqual({ triggered: true })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await db.triggerButton('row1', 'col1', { ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })
  })
})
