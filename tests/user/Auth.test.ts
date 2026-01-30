import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Auth } from 'src/user/Auth'
import { createAppOptions } from '../helpers'
import { ValidationError } from 'src/errors/ValidationError'
import { AuthType } from 'src/types/common'

vi.mock('src/utils/fetch', () => ({
  apiRequest: vi.fn(),
}))

import { apiRequest } from 'src/utils/fetch'

const mockApiRequest = vi.mocked(apiRequest)

describe('Auth', () => {
  let auth: Auth
  let appOptions: ReturnType<typeof createAppOptions>

  beforeEach(() => {
    vi.clearAllMocks()
    appOptions = createAppOptions()
    appOptions.setAuthToken('test-auth-token')
    auth = new Auth(appOptions)
  })

  describe('authorization', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'u1', login: 'test', token: 'tok' },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.authorization()
      expect(result).toEqual({ _id: 'u1', login: 'test', token: 'tok' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.authorization({ ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })
  })

  describe('login', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'u1', login: 'test', token: 'new-token' },
    }

    it('returns unwrapped data by default and sets auth token', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.login({ login: 'test', password: 'pass' })
      expect(result).toEqual({ _id: 'u1', login: 'test', token: 'new-token' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.login(
        { login: 'test', password: 'pass' },
        { ignoreFormatResponse: true },
      )
      expect(result).toEqual(rawResponse)
    })

    it('sets auth token on successful login', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      await auth.login({ login: 'test', password: 'pass' })

      expect(appOptions.getAuthToken(AuthType.AuthToken)).toBe('new-token')
    })
  })

  describe('registration', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'u2', login: 'newuser', token: 'reg-token' },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.registration({ login: 'newuser', password: 'pass' })
      expect(result).toEqual({ _id: 'u2', login: 'newuser', token: 'reg-token' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.registration(
        { login: 'newuser', password: 'pass' },
        { ignoreFormatResponse: true },
      )
      expect(result).toEqual(rawResponse)
    })
  })

  describe('forgotPassword', () => {
    const rawResponse = {
      success: true,
      data: { requestId: 'req-123' },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.forgotPassword('test@example.com')
      expect(result).toEqual({ requestId: 'req-123' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.forgotPassword('test@example.com', {
        ignoreFormatResponse: true,
      })
      expect(result).toEqual(rawResponse)
    })
  })

  describe('forgotPasswordCheckCode', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'req-123', requestStatus: 'open' },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.forgotPasswordCheckCode({
        requestId: 'req-123',
        code: '1234',
      })
      expect(result).toEqual({ _id: 'req-123', requestStatus: 'open' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.forgotPasswordCheckCode(
        { requestId: 'req-123', code: '1234' },
        { ignoreFormatResponse: true },
      )
      expect(result).toEqual(rawResponse)
    })
  })

  describe('forgotPasswordChange', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'u1', login: 'test', token: 'new-tok' },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.forgotPasswordChange({
        requestId: 'req-123',
        newPassword: 'abc',
        newPasswordRepeat: 'abc',
      })
      expect(result).toEqual({ _id: 'u1', login: 'test', token: 'new-tok' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.forgotPasswordChange(
        { requestId: 'req-123', newPassword: 'abc', newPasswordRepeat: 'abc' },
        { ignoreFormatResponse: true },
      )
      expect(result).toEqual(rawResponse)
    })

    it('throws ValidationError if passwords do not match', async () => {
      await expect(
        auth.forgotPasswordChange({
          requestId: 'req-123',
          newPassword: 'abc',
          newPasswordRepeat: 'xyz',
        }),
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('exchangeOAuthToken', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'u1', login: 'test', token: 'oauth-token' },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.exchangeOAuthToken('secret-123')
      expect(result).toEqual({ _id: 'u1', login: 'test', token: 'oauth-token' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.exchangeOAuthToken('secret-123', {
        ignoreFormatResponse: true,
      })
      expect(result).toEqual(rawResponse)
    })

    it('throws ValidationError if secret is empty', async () => {
      await expect(auth.exchangeOAuthToken('')).rejects.toThrow(ValidationError)
    })
  })

  describe('updateUser', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'u1', login: 'test', firstName: 'Updated' },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.updateUser({ firstName: 'Updated' })
      expect(result).toEqual({ _id: 'u1', login: 'test', firstName: 'Updated' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await auth.updateUser(
        { firstName: 'Updated' },
        { ignoreFormatResponse: true },
      )
      expect(result).toEqual(rawResponse)
    })
  })
})
