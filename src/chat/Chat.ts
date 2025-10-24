import AppOptions from 'src/core/AppOptions'
import { ValidationError } from 'src/errors/ValidationError'
import { ServerError } from 'src/errors/ServerError'
import { apiRequest } from 'src/utils/fetch'
import { responseFormatter } from 'src/utils/formatters'
import { ChatChannelType } from 'src/types/chat'
import type {
  ChatChannel,
  ChatMessage,
  ChatListOptions,
  ChatListResponse,
  CreateChannelByTypeOptions,
  UpsertChannelOptions,
  GetChannelOptions,
  ChatMessageListOptions,
  ChatMessageListResponse,
  SendMessageOptions,
  GetUnreadCountOptions,
  UnreadCountResponse,
} from 'src/types/chat'

/**
 * Chat module for managing chat channels and messages via REST API
 */
class Chat {
  private applicationOptions: AppOptions

  constructor(applicationOptions: AppOptions) {
    this.applicationOptions = applicationOptions
  }

  /**
   * List chat channels with filtering and pagination
   *
   * @param options - List options including filters and pagination
   * @returns Promise resolving to channel list with pagination info
   *
   * @example
   * // Get all public channels
   * const channels = await chat.listChannels({ type: ChatChannelType.Public, limit: 20 });
   *
   * // Get unread staff-to-user chats
   * const unread = await chat.listChannels({
   *   type: ChatChannelType.StaffToUser,
   *   unreadedChats: true
   * });
   */
  async listChannels(
    options: ChatListOptions = {},
  ): Promise<ChatListResponse | ServerError | ValidationError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const {
      type = ChatChannelType.Public,
      search = '',
      limit = 50,
      page = 0,
      orderBy = 'createdAt',
      sort = 'DESC',
      unreadedChats,
      longTimeAnswer,
    } = options

    // Build query parameters
    const params = new URLSearchParams({
      type,
      limit: limit.toString(),
      page: page.toString(),
      orderBy,
      sort,
    })

    if (search) params.append('search', search)
    if (unreadedChats !== undefined)
      params.append('unreadedChats', unreadedChats.toString())
    if (longTimeAnswer !== undefined)
      params.append('longTimeAnswer', longTimeAnswer.toString())

    const authHeaders = this.applicationOptions.getAuthorizationHeader()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/chat/?${params.toString()}`,
      {
        method: 'GET',
        headers: { ...authHeaders },
        body: null,
      },
    )

    const data = responseFormatter(res) as ChatListResponse

    return data
  }

  /**
   * Create or get existing chat channel by type
   *
   * @param type - Channel type (staff-to-user, peer-to-peer, staff)
   * @param options - Options including userId or accesses list
   * @returns Promise resolving to the channel
   *
   * @example
   * // Create staff-to-user chat
   * const channel = await chat.createChannelByType(ChatChannelType.StaffToUser, {
   *   userId: 'user-uuid'
   * });
   *
   * // Create peer-to-peer chat
   * const dmChannel = await chat.createChannelByType(ChatChannelType.PeerToPeer, {
   *   accesses: ['user-uuid-1', 'user-uuid-2']
   * });
   */
  async createChannelByType(
    type: ChatChannelType,
    options: CreateChannelByTypeOptions = {},
  ): Promise<ChatChannel | ServerError | ValidationError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    if (
      type !== ChatChannelType.StaffToUser &&
      type !== ChatChannelType.PeerToPeer &&
      type !== ChatChannelType.Staff
    ) {
      throw new ValidationError(
        'Type must be staff-to-user, peer-to-peer, or staff',
      )
    }

    const authHeaders = this.applicationOptions.getAuthorizationHeader()

    const body: any = {}
    if (options.userId) body.userId = options.userId
    if (options.id) body.id = options.id
    if (options.accesses) body.accesses = options.accesses

    const res = await apiRequest(
      `${apiUrl}/api/${app}/chat/${type}`,
      {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    )

    const data = responseFormatter(res) as ChatChannel

    return data
  }

  /**
   * Create or update a chat channel
   *
   * @param data - Channel data (include _id to update)
   * @returns Promise resolving to the channel
   *
   * @example
   * // Create new channel
   * const channel = await chat.upsertChannel({
   *   id: 'my-channel',
   *   type: ChatChannelType.Public
   * });
   *
   * // Update existing channel
   * const updated = await chat.upsertChannel({
   *   _id: 'channel-id',
   *   resolved: true
   * });
   */
  async upsertChannel(
    data: UpsertChannelOptions,
  ): Promise<ChatChannel | ServerError | ValidationError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authHeaders = this.applicationOptions.getAuthorizationHeader()

    const res = await apiRequest(`${apiUrl}/api/${app}/chat/`, {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = responseFormatter(res) as ChatChannel

    return result
  }

  /**
   * Get chat channel details
   *
   * @param id - Channel ID
   * @param options - Options including cleanupUnreaded flag
   * @returns Promise resolving to the channel details
   *
   * @example
   * const channel = await chat.getChannel('staff-to-user-user-uuid');
   */
  async getChannel(
    id: string,
    options: GetChannelOptions = {},
  ): Promise<ChatChannel | ServerError | ValidationError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const { cleanupUnreaded = true } = options

    const params = new URLSearchParams({
      cleanupUnreaded: cleanupUnreaded.toString(),
    })

    const authHeaders = this.applicationOptions.getAuthorizationHeader()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/chat/${id}/?${params.toString()}`,
      {
        method: 'GET',
        headers: { ...authHeaders },
        body: null,
      },
    )

    const data = responseFormatter(res) as ChatChannel

    return data
  }

  /**
   * Delete a chat channel
   *
   * @param channelId - Channel _id to delete
   * @returns Promise resolving to success status
   *
   * @example
   * await chat.deleteChannel('channel-mongo-id');
   */
  async deleteChannel(
    channelId: string,
  ): Promise<{ success: boolean } | ServerError | ValidationError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authHeaders = this.applicationOptions.getAuthorizationHeader()

    const res = await apiRequest(`${apiUrl}/api/${app}/chat/`, {
      method: 'DELETE',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ _id: channelId }),
    })

    const data = responseFormatter(res) as { success: boolean }

    return data
  }

  /**
   * Send a message to a chat channel
   *
   * @param channelId - Channel ID to send message to
   * @param options - Message options including text and attachments
   * @returns Promise resolving to the created message
   *
   * @example
   * // Send text message
   * const msg = await chat.sendMessage('channel-id', {
   *   message: 'Hello world!'
   * });
   *
   * // Send message with attachments
   * const msgWithFiles = await chat.sendMessage('channel-id', {
   *   message: 'Check out these files',
   *   attaches: [
   *     { type: 'image', attach: 'image-id', name: 'photo.jpg' },
   *     { type: 'file', attach: 'file-id', name: 'document.pdf' }
   *   ]
   * });
   */
  async sendMessage(
    channelId: string,
    options: SendMessageOptions,
  ): Promise<ChatMessage | ServerError | ValidationError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    if (!options.message && !options.attaches?.length) {
      throw new ValidationError('Message text or attachments are required')
    }

    if (options.attaches && options.attaches.length > 10) {
      throw new ValidationError('Maximum 10 attachments allowed')
    }

    const authHeaders = this.applicationOptions.getAuthorizationHeader()

    const body: any = {}
    if (options.message) body.message = options.message
    if (options.attaches) body.attaches = options.attaches

    const res = await apiRequest(
      `${apiUrl}/api/${app}/chat/${channelId}/message/`,
      {
        method: 'PUT',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    )

    const data = responseFormatter(res) as ChatMessage

    return data
  }

  /**
   * List messages in a chat channel
   *
   * @param channelId - Channel ID
   * @param options - List options including search and pagination
   * @returns Promise resolving to message list with pagination info
   *
   * @example
   * // Get recent messages
   * const messages = await chat.listMessages('channel-id', {
   *   limit: 50,
   *   page: 0,
   *   orderBy: 'createdAt',
   *   sort: 'DESC'
   * });
   *
   * // Search messages
   * const searchResults = await chat.listMessages('channel-id', {
   *   search: 'hello'
   * });
   */
  async listMessages(
    channelId: string,
    options: ChatMessageListOptions = {},
  ): Promise<ChatMessageListResponse | ServerError | ValidationError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const {
      search = '',
      limit = 50,
      page = 0,
      orderBy = 'createdAt',
      sort = 'DESC',
    } = options

    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      orderBy,
      sort,
    })

    if (search) params.append('search', search)

    const authHeaders = this.applicationOptions.getAuthorizationHeader()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/chat/${channelId}/message/?${params.toString()}`,
      {
        method: 'GET',
        headers: { ...authHeaders },
        body: null,
      },
    )

    const data = responseFormatter(res) as ChatMessageListResponse

    return data
  }

  /**
   * Delete a message
   *
   * @param channelId - Channel ID
   * @param messageId - Message _id to delete
   * @returns Promise resolving to success status
   *
   * @example
   * await chat.deleteMessage('channel-id', 'message-mongo-id');
   */
  async deleteMessage(
    channelId: string,
    messageId: string,
  ): Promise<{ success: boolean } | ServerError | ValidationError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authHeaders = this.applicationOptions.getAuthorizationHeader()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/chat/${channelId}/message/`,
      {
        method: 'DELETE',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: messageId }),
      },
    )

    const data = responseFormatter(res) as { success: boolean }

    return data
  }

  /**
   * Get unread message count for a channel (staff-to-user chats)
   *
   * @param channelId - Channel ID
   * @param options - Options including cleanupUnreaded flag
   * @returns Promise resolving to unread counts for creator and recipient
   *
   * @example
   * const counts = await chat.getUnreadCount('channel-id');
   * console.log(`Creator: ${counts.creator}, Recipient: ${counts.recipient}`);
   */
  async getUnreadCount(
    channelId: string,
    options: GetUnreadCountOptions = {},
  ): Promise<UnreadCountResponse | ServerError | ValidationError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const { cleanupUnreaded = false } = options

    const params = new URLSearchParams({
      cleanupUnreaded: cleanupUnreaded.toString(),
    })

    const authHeaders = this.applicationOptions.getAuthorizationHeader()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/chat/${channelId}/message/unread-count/?${params.toString()}`,
      {
        method: 'GET',
        headers: { ...authHeaders },
        body: null,
      },
    )

    const data = responseFormatter(res) as UnreadCountResponse

    return data
  }
}

export { Chat }
