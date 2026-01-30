import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BaseModule } from 'src/core/BaseModule'
import { createAppOptions } from '../helpers'
import { ServerError } from 'src/errors/ServerError'

vi.mock('src/utils/fetch', () => ({
  apiRequest: vi.fn(),
}))

import { apiRequest } from 'src/utils/fetch'

const mockApiRequest = vi.mocked(apiRequest)

class TestModule extends BaseModule {
  async callRequest<T extends { success: true; data: any }>(
    url: string,
    fetchOptions: RequestInit,
    callOptions: any = {},
  ) {
    return this.request<T>(url, fetchOptions, callOptions)
  }
}

describe('BaseModule', () => {
  let mod: TestModule

  beforeEach(() => {
    vi.clearAllMocks()
    mod = new TestModule(createAppOptions())
  })

  it('returns unwrapped data by default', async () => {
    const rawResponse = { success: true, data: { foo: 'bar' } }
    mockApiRequest.mockResolvedValue(rawResponse as any)

    const result = await mod.callRequest('https://api.test.local/test', { method: 'GET' })
    expect(result).toEqual({ foo: 'bar' })
  })

  it('returns full response with ignoreFormatResponse: true', async () => {
    const rawResponse = { success: true, data: { foo: 'bar' } }
    mockApiRequest.mockResolvedValue(rawResponse as any)

    const result = await mod.callRequest(
      'https://api.test.local/test',
      { method: 'GET' },
      { ignoreFormatResponse: true },
    )
    expect(result).toEqual({ success: true, data: { foo: 'bar' } })
  })

  it('propagates errors from apiRequest', async () => {
    mockApiRequest.mockRejectedValue(new ServerError('Network error'))

    await expect(
      mod.callRequest('https://api.test.local/test', { method: 'GET' }),
    ).rejects.toThrow(ServerError)
  })
})
