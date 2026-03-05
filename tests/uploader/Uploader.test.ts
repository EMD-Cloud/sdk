import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Uploader } from 'src/uploader/Uploader'
import { createAppOptions } from '../helpers'
import { ReadPermission, AccessPolicyType, ContentDisposition } from 'src/types/uploader'

vi.mock('src/utils/fetch', () => ({
  apiRequest: vi.fn(),
}))

import { apiRequest } from 'src/utils/fetch'

const mockApiRequest = vi.mocked(apiRequest)

describe('Uploader', () => {
  let uploader: Uploader

  beforeEach(() => {
    vi.clearAllMocks()
    uploader = new Uploader(createAppOptions())
  })

  describe('createFileAccessToken', () => {
    it('sends POST to correct URL and returns token', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: 'test-token-abc',
      } as any)

      const result = await uploader.createFileAccessToken()

      expect(mockApiRequest).toHaveBeenCalledWith(
        'https://api.test.local/api/test-app/uploader/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      )
      expect(result).toBe('test-token-abc')
    })

    it('includes ttlMinutes in body when provided', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: 'token',
      } as any)

      await uploader.createFileAccessToken(30)

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ ttlMinutes: 30 }),
        }),
      )
    })

    it('sends empty body when ttlMinutes not provided', async () => {
      mockApiRequest.mockResolvedValue({
        success: true,
        data: 'token',
      } as any)

      await uploader.createFileAccessToken()

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({}),
        }),
      )
    })
  })

  describe('uploadFile validation', () => {
    it('throws when both accessPolicy and readPermission are provided', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      expect(() =>
        uploader.uploadFile(file, {
          readPermission: ReadPermission.Public,
          accessPolicy: { type: AccessPolicyType.Public },
        }),
      ).toThrow('accessPolicy and readPermission are mutually exclusive')
    })

    it('throws when OnlyPermittedUsers without permittedUsers', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      expect(() =>
        uploader.uploadFile(file, {
          readPermission: ReadPermission.OnlyPermittedUsers,
        }),
      ).toThrow(
        'permittedUsers array is required when permission requires permitted users',
      )
    })

    it('throws when OnlyAppStaffAndPermittedUsers without permittedUsers', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      expect(() =>
        uploader.uploadFile(file, {
          readPermission: ReadPermission.OnlyAppStaffAndPermittedUsers,
        }),
      ).toThrow(
        'permittedUsers array is required when permission requires permitted users',
      )
    })

    it('throws when accessPolicy.allowPermittedUsers without permittedUsers', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      expect(() =>
        uploader.uploadFile(file, {
          accessPolicy: { type: AccessPolicyType.Private, allowPermittedUsers: true },
        }),
      ).toThrow(
        'permittedUsers array is required when permission requires permitted users',
      )
    })

    it('throws when grant flags are used with non-Private type', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      expect(() =>
        uploader.uploadFile(file, {
          accessPolicy: { type: AccessPolicyType.Public, allowStaff: true } as any,
        }),
      ).toThrow(
        'allowStaff, allowPersonal, and allowPermittedUsers are only allowed with AccessPolicyType.Private',
      )

      expect(() =>
        uploader.uploadFile(file, {
          accessPolicy: { type: AccessPolicyType.OnlyAuthUser, allowPersonal: true } as any,
        }),
      ).toThrow(
        'allowStaff, allowPersonal, and allowPermittedUsers are only allowed with AccessPolicyType.Private',
      )
    })

    it('does not throw when grant flags are used with Private type', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })

      expect(() =>
        uploader.uploadFile(file, {
          accessPolicy: { type: AccessPolicyType.Private, allowStaff: true },
        }),
      ).not.toThrow()
    })
  })

  describe('isEMDLink', () => {
    it('returns true for matching EMD Cloud file URLs', () => {
      expect(
        uploader.isEMDLink(
          'https://api.test.local/api/test-app/uploader/chunk/default/file/abc123',
        ),
      ).toBe(true)
    })

    it('returns false for external URLs', () => {
      expect(uploader.isEMDLink('https://example.com/file.png')).toBe(false)
    })

    it('returns false for partial matches', () => {
      expect(
        uploader.isEMDLink('https://api.test.local/api/other-app/uploader/chunk/x'),
      ).toBe(false)
    })
  })

  describe('formatFileLink', () => {
    it('appends contentDisposition param', () => {
      const result = uploader.formatFileLink(
        'https://api.test.local/api/test-app/uploader/chunk/default/file/abc123',
      )
      expect(result).toContain('contentDisposition=inline')
    })

    it('appends token when provided', () => {
      const result = uploader.formatFileLink(
        'https://api.test.local/api/test-app/uploader/chunk/default/file/abc123',
        ContentDisposition.Attachment,
        'my-token',
      )
      expect(result).toContain('token=my-token')
      expect(result).toContain('contentDisposition=attachment')
    })

    it('does not include token param when not provided', () => {
      const result = uploader.formatFileLink(
        'https://api.test.local/api/test-app/uploader/chunk/default/file/abc123',
        ContentDisposition.Inline,
      )
      expect(result).not.toContain('token=')
    })
  })
})
