import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Chat } from 'src/chat/Chat'
import { createAppOptions } from '../helpers'
import { ChatChannelType } from 'src/types/chat'
import { ValidationError } from 'src/errors/ValidationError'

vi.mock('src/utils/fetch', () => ({
  apiRequest: vi.fn(),
}))

import { apiRequest } from 'src/utils/fetch'

const mockApiRequest = vi.mocked(apiRequest)

describe('Chat', () => {
  let chat: Chat

  beforeEach(() => {
    vi.clearAllMocks()
    const appOptions = createAppOptions()
    appOptions.setAuthToken('test-auth-token')
    chat = new Chat(appOptions)
  })

  describe('listChannels', () => {
    const rawResponse = {
      success: true,
      data: [{ _id: 'ch1', id: 'public-1', type: 'public' }],
      count: 1,
      pages: 1,
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.listChannels({ type: ChatChannelType.Public })
      expect(result).toEqual([{ _id: 'ch1', id: 'public-1', type: 'public' }])
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.listChannels(
        { type: ChatChannelType.Public },
        { ignoreFormatResponse: true },
      )
      expect(result).toEqual(rawResponse)
    })
  })

  describe('createChannelByType', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'ch2', id: 'staff-to-user-u1', type: 'staff-to-user' },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.createChannelByType(ChatChannelType.StaffToUser, {
        userId: 'u1',
      })
      expect(result).toEqual({ _id: 'ch2', id: 'staff-to-user-u1', type: 'staff-to-user' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.createChannelByType(
        ChatChannelType.StaffToUser,
        { userId: 'u1' },
        { ignoreFormatResponse: true },
      )
      expect(result).toEqual(rawResponse)
    })

    it('throws ValidationError for invalid channel type', async () => {
      await expect(
        chat.createChannelByType(ChatChannelType.Public, {}),
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('upsertChannel', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'ch3', id: 'my-channel', type: 'public' },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.upsertChannel({ id: 'my-channel', type: ChatChannelType.Public })
      expect(result).toEqual({ _id: 'ch3', id: 'my-channel', type: 'public' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.upsertChannel(
        { id: 'my-channel', type: ChatChannelType.Public },
        { ignoreFormatResponse: true },
      )
      expect(result).toEqual(rawResponse)
    })
  })

  describe('getChannel', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'ch1', id: 'public-1', type: 'public' },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.getChannel('public-1')
      expect(result).toEqual({ _id: 'ch1', id: 'public-1', type: 'public' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.getChannel('public-1', {}, { ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })
  })

  describe('deleteChannel', () => {
    const rawResponse = { success: true, data: { success: true } }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.deleteChannel('ch1')
      expect(result).toEqual({ success: true })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.deleteChannel('ch1', { ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })
  })

  describe('sendMessage', () => {
    const rawResponse = {
      success: true,
      data: { _id: 'msg1', channel: 'ch1', message: 'Hello' },
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.sendMessage('ch1', { message: 'Hello' })
      expect(result).toEqual({ _id: 'msg1', channel: 'ch1', message: 'Hello' })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.sendMessage(
        'ch1',
        { message: 'Hello' },
        { ignoreFormatResponse: true },
      )
      expect(result).toEqual(rawResponse)
    })

    it('throws ValidationError if message and attaches are empty', async () => {
      await expect(chat.sendMessage('ch1', {})).rejects.toThrow(ValidationError)
    })
  })

  describe('listMessages', () => {
    const rawResponse = {
      success: true,
      data: [{ _id: 'msg1', channel: 'ch1', message: 'Hello' }],
      count: 1,
      pages: 1,
    }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.listMessages('ch1', { limit: 50 })
      expect(result).toEqual([{ _id: 'msg1', channel: 'ch1', message: 'Hello' }])
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.listMessages(
        'ch1',
        { limit: 50 },
        { ignoreFormatResponse: true },
      )
      expect(result).toEqual(rawResponse)
    })
  })

  describe('deleteMessage', () => {
    const rawResponse = { success: true, data: { success: true } }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.deleteMessage('ch1', 'msg1')
      expect(result).toEqual({ success: true })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.deleteMessage('ch1', 'msg1', { ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })
  })

  describe('getUnreadCount', () => {
    const rawResponse = { success: true, data: { count: 5 } }

    it('returns unwrapped data by default', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.getUnreadCount('ch1')
      expect(result).toEqual({ count: 5 })
    })

    it('returns full response with ignoreFormatResponse: true', async () => {
      mockApiRequest.mockResolvedValue(rawResponse as any)

      const result = await chat.getUnreadCount('ch1', {}, { ignoreFormatResponse: true })
      expect(result).toEqual(rawResponse)
    })
  })
})
