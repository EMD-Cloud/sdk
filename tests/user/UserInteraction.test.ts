import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserInteraction } from 'src/user/UserInteraction'
import { createAppOptions } from '../helpers'
import { SocialProvider } from 'src/types'
import { ValidationError } from 'src/errors/ValidationError'

vi.mock('src/utils/fetch', () => ({
  apiRequest: vi.fn(),
}))

import { apiRequest } from 'src/utils/fetch'

const mockApiRequest = vi.mocked(apiRequest)

describe('UserInteraction', () => {
  let user: UserInteraction

  beforeEach(() => {
    vi.clearAllMocks()
    const appOptions = createAppOptions()
    appOptions.setAuthToken('test-auth-token')
    user = new UserInteraction(appOptions)
  })

  describe('attachSocialAccount', () => {
    const rawResponse = { success: true, data: { url: 'https://steam.example.com/auth' } }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await user.attachSocialAccount({
        provider: SocialProvider.STEAM,
        redirectUrl: 'https://myapp.com/profile',
      })
      expect(result).toEqual({ url: 'https://steam.example.com/auth' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await user.attachSocialAccount(
        { provider: SocialProvider.STEAM, redirectUrl: 'https://myapp.com/profile' },
        { ignoreFormatResponse: true },
      )
      expect(result).toEqual(rawResponse)
    })

    it('throws ValidationError for unsupported provider', async () => {
      await expect(
        user.attachSocialAccount({
          provider: 'invalid' as SocialProvider,
          redirectUrl: 'https://myapp.com',
        }),
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('detachSocialAccount', () => {
    const rawResponse = { success: true, data: { success: true } }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await user.detachSocialAccount(SocialProvider.STEAM)
      expect(result).toEqual({ success: true })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await user.detachSocialAccount(SocialProvider.STEAM, {
        ignoreFormatResponse: true,
      })
      expect(result).toEqual(rawResponse)
    })

    it('throws ValidationError for unsupported provider', async () => {
      await expect(
        user.detachSocialAccount('invalid' as SocialProvider),
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('ping', () => {
    const rawResponse = { success: true, data: { success: true } }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await user.ping()
      expect(result).toEqual({ success: true })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await user.ping({ ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })
  })

  describe('getUserList', () => {
    const rawResponse = {
      success: true,
      data: { data: [{ _id: 'u1', login: 'user1' }], total: 1 },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await user.getUserList({ limit: 10, page: 0 })
      expect(result).toEqual({ data: [{ _id: 'u1', login: 'user1' }], total: 1 })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await user.getUserList(
        { limit: 10, page: 0 },
        { ignoreFormatResponse: true },
      )
      expect(result).toEqual(rawResponse)
    })
  })

  describe('getUserDetails', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'u1', login: 'testuser', firstName: 'Test' },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await user.getUserDetails('u1')
      expect(result).toEqual({ _id: 'u1', login: 'testuser', firstName: 'Test' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await user.getUserDetails('u1', { ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })

    it('throws ValidationError if userId is empty', async () => {
      await expect(user.getUserDetails('')).rejects.toThrow(ValidationError)
    })
  })
})
