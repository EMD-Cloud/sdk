import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Webhook } from 'src/webhook/Webhook'
import { createAppOptions } from '../helpers'

vi.mock('src/utils/fetch', () => ({
  apiRequest: vi.fn(),
}))

import { apiRequest } from 'src/utils/fetch'

const mockApiRequest = vi.mocked(apiRequest)

describe('Webhook', () => {
  let webhook: Webhook

  beforeEach(() => {
    vi.clearAllMocks()
    webhook = new Webhook(createAppOptions())
  })

  describe('call', () => {
    const rawResponse = { success: true, data: { result: 'ok' } }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await webhook.call('my-hook', { method: 'POST' })
      expect(result).toEqual({ result: 'ok' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await webhook.call('my-hook', { method: 'POST' }, { ignoreFormatResponse: true })
      expect(result).toEqual({ success: true, data: { result: 'ok' } })
    })

    it('includes auth header and custom headers', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      await webhook.call(
        'my-hook',
        { method: 'POST', headers: { 'X-Custom': 'value' } },
      )

      expect(mockApiRequest).toHaveBeenCalledWith(
        'https://api.test.local/api/test-app/webhook/my-hook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'X-Custom': 'value' }),
        }),
      )
    })

    it('constructs correct URL with app and webhook id', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      await webhook.call('test-webhook', { method: 'GET' })

      expect(mockApiRequest).toHaveBeenCalledWith(
        'https://api.test.local/api/test-app/webhook/test-webhook',
        expect.any(Object),
      )
    })
  })
})
