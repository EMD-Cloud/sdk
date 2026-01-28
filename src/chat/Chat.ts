import AppOptions from 'src/core/AppOptions'
import { ValidationError } from 'src/errors/ValidationError'
import { ServerError } from 'src/errors/ServerError'
import { NotAllowedError } from 'src/errors/NotAllowedError'
import { apiRequest } from 'src/utils/fetch'
import { responseFormatter } from 'src/utils/formatters'
import { ChatChannelType } from 'src/types/chat'
import type { CallOptions } from 'src/types/common'
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
  ChatChannelResponse,
  ChatMessageResponse,
  ChatDeleteResponse,
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
   * @param callOptions - Additional options for the API call including authentication type
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
    options: ChatListOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatListResponse | ServerError>
  async listChannels(
    options?: ChatListOptions,
    callOptions?: CallOptions,
  ): Promise<ChatListResponse['data'] | ServerError>
  async listChannels(
    options: ChatListOptions = {},
    callOptions: CallOptions = {},
  ): Promise<ChatListResponse | ChatListResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    let authHeaders: Record<string, string> = {}

    try {
      authHeaders = this.applicationOptions.getAuthorizationHeader(
        callOptions.authType,
      )
    } catch (error) {
      if (
        !(error instanceof ValidationError) &&
        !(error instanceof NotAllowedError)
      ) {
        throw error
      }
    }

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

    const res = await apiRequest(
      `${apiUrl}/api/${app}/chat/?${params.toString()}`,
      {
        method: 'GET',
        headers: { ...authHeaders },
        body: null,
      },
    )

    if (callOptions.ignoreFormatResponse) {
      return res as ChatListResponse
    }

    return responseFormatter(res) as ChatListResponse['data']
  }

  /**
   * Create or get existing chat channel by type
   *
   * @param type - Channel type (staff-to-user, peer-to-peer, staff)
   * @param options - Options including userId or accesses list
   * @param callOptions - Additional options for the API call including authentication type
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
    options: CreateChannelByTypeOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatChannelResponse | ServerError>
  async createChannelByType(
    type: ChatChannelType,
    options?: CreateChannelByTypeOptions,
    callOptions?: CallOptions,
  ): Promise<ChatChannelResponse['data'] | ServerError>
  async createChannelByType(
    type: ChatChannelType,
    options: CreateChannelByTypeOptions = {},
    callOptions: CallOptions = {},
  ): Promise<ChatChannelResponse | ChatChannelResponse['data'] | ServerError> {
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

    let authHeaders: Record<string, string> = {}

    try {
      authHeaders = this.applicationOptions.getAuthorizationHeader(
        callOptions.authType,
      )
    } catch (error) {
      if (
        !(error instanceof ValidationError) &&
        !(error instanceof NotAllowedError)
      ) {
        throw error
      }
    }

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

    if (callOptions.ignoreFormatResponse) {
      return res as ChatChannelResponse
    }

    return responseFormatter(res) as ChatChannel
  }

  /**
   * Create or update a chat channel
   *
   * @param data - Channel data (include _id to update)
   * @param callOptions - Additional options for the API call including authentication type
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
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatChannelResponse | ServerError>
  async upsertChannel(
    data: UpsertChannelOptions,
    callOptions?: CallOptions,
  ): Promise<ChatChannelResponse['data'] | ServerError>
  async upsertChannel(
    data: UpsertChannelOptions,
    callOptions: CallOptions = {},
  ): Promise<ChatChannelResponse | ChatChannelResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    let authHeaders: Record<string, string> = {}

    try {
      authHeaders = this.applicationOptions.getAuthorizationHeader(
        callOptions.authType,
      )
    } catch (error) {
      if (
        !(error instanceof ValidationError) &&
        !(error instanceof NotAllowedError)
      ) {
        throw error
      }
    }

    const res = await apiRequest(`${apiUrl}/api/${app}/chat/`, {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (callOptions.ignoreFormatResponse) {
      return res as ChatChannelResponse
    }

    return responseFormatter(res) as ChatChannel
  }

  /**
   * Get chat channel details
   *
   * @param id - Channel ID
   * @param options - Options including cleanupUnreaded flag
   * @param callOptions - Additional options for the API call including authentication type
   * @returns Promise resolving to the channel details
   *
   * @example
   * const channel = await chat.getChannel('staff-to-user-user-uuid');
   */
  async getChannel(
    id: string,
    options: GetChannelOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatChannelResponse | ServerError>
  async getChannel(
    id: string,
    options?: GetChannelOptions,
    callOptions?: CallOptions,
  ): Promise<ChatChannelResponse['data'] | ServerError>
  async getChannel(
    id: string,
    options: GetChannelOptions = {},
    callOptions: CallOptions = {},
  ): Promise<ChatChannelResponse | ChatChannelResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    let authHeaders: Record<string, string> = {}

    try {
      authHeaders = this.applicationOptions.getAuthorizationHeader(
        callOptions.authType,
      )
    } catch (error) {
      if (
        !(error instanceof ValidationError) &&
        !(error instanceof NotAllowedError)
      ) {
        throw error
      }
    }

    const { cleanupUnreaded = true } = options

    const params = new URLSearchParams({
      cleanupUnreaded: cleanupUnreaded.toString(),
    })

    const res = await apiRequest(
      `${apiUrl}/api/${app}/chat/${id}/?${params.toString()}`,
      {
        method: 'GET',
        headers: { ...authHeaders },
        body: null,
      },
    )

    if (callOptions.ignoreFormatResponse) {
      return res as ChatChannelResponse
    }

    return responseFormatter(res) as ChatChannel
  }

  /**
   * Delete a chat channel
   *
   * @param channelId - Channel _id to delete
   * @param callOptions - Additional options for the API call including authentication type
   * @returns Promise resolving to success status
   *
   * @example
   * await chat.deleteChannel('channel-mongo-id');
   */
  async deleteChannel(
    channelId: string,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatDeleteResponse | ServerError>
  async deleteChannel(
    channelId: string,
    callOptions?: CallOptions,
  ): Promise<ChatDeleteResponse['data'] | ServerError>
  async deleteChannel(
    channelId: string,
    callOptions: CallOptions = {},
  ): Promise<ChatDeleteResponse | ChatDeleteResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    let authHeaders: Record<string, string> = {}

    try {
      authHeaders = this.applicationOptions.getAuthorizationHeader(
        callOptions.authType,
      )
    } catch (error) {
      if (
        !(error instanceof ValidationError) &&
        !(error instanceof NotAllowedError)
      ) {
        throw error
      }
    }

    const res = await apiRequest(`${apiUrl}/api/${app}/chat/`, {
      method: 'DELETE',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ _id: channelId }),
    })

    if (callOptions.ignoreFormatResponse) {
      return res as ChatDeleteResponse
    }

    return responseFormatter(res) as { success: boolean }
  }

  /**
   * Send a message to a chat channel
   *
   * @param channelId - Channel ID to send message to
   * @param options - Message options including text and attachments
   * @param callOptions - Additional options for the API call including authentication type
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
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatMessageResponse | ServerError>
  async sendMessage(
    channelId: string,
    options: SendMessageOptions,
    callOptions?: CallOptions,
  ): Promise<ChatMessageResponse['data'] | ServerError>
  async sendMessage(
    channelId: string,
    options: SendMessageOptions,
    callOptions: CallOptions = {},
  ): Promise<ChatMessageResponse | ChatMessageResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    if (!options.message && !options.attaches?.length) {
      throw new ValidationError('Message text or attachments are required')
    }

    if (options.attaches && options.attaches.length > 10) {
      throw new ValidationError('Maximum 10 attachments allowed')
    }

    let authHeaders: Record<string, string> = {}

    try {
      authHeaders = this.applicationOptions.getAuthorizationHeader(
        callOptions.authType,
      )
    } catch (error) {
      if (
        !(error instanceof ValidationError) &&
        !(error instanceof NotAllowedError)
      ) {
        throw error
      }
    }

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

    if (callOptions.ignoreFormatResponse) {
      return res as ChatMessageResponse
    }

    return responseFormatter(res) as ChatMessage
  }

  /**
   * List messages in a chat channel
   *
   * @param channelId - Channel ID
   * @param options - List options including search and pagination
   * @param callOptions - Additional options for the API call including authentication type
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
    options: ChatMessageListOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatMessageListResponse | ServerError>
  async listMessages(
    channelId: string,
    options?: ChatMessageListOptions,
    callOptions?: CallOptions,
  ): Promise<ChatMessageListResponse['data'] | ServerError>
  async listMessages(
    channelId: string,
    options: ChatMessageListOptions = {},
    callOptions: CallOptions = {},
  ): Promise<ChatMessageListResponse | ChatMessageListResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    let authHeaders: Record<string, string> = {}

    try {
      authHeaders = this.applicationOptions.getAuthorizationHeader(
        callOptions.authType,
      )
    } catch (error) {
      if (
        !(error instanceof ValidationError) &&
        !(error instanceof NotAllowedError)
      ) {
        throw error
      }
    }

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

    const res = await apiRequest(
      `${apiUrl}/api/${app}/chat/${channelId}/message/?${params.toString()}`,
      {
        method: 'GET',
        headers: { ...authHeaders },
        body: null,
      },
    )

    if (callOptions.ignoreFormatResponse) {
      return res as ChatMessageListResponse
    }

    return responseFormatter(res) as ChatMessageListResponse['data']
  }

  /**
   * Delete a message
   *
   * @param channelId - Channel ID
   * @param messageId - Message _id to delete
   * @param callOptions - Additional options for the API call including authentication type
   * @returns Promise resolving to success status
   *
   * @example
   * await chat.deleteMessage('channel-id', 'message-mongo-id');
   */
  async deleteMessage(
    channelId: string,
    messageId: string,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ChatDeleteResponse | ServerError>
  async deleteMessage(
    channelId: string,
    messageId: string,
    callOptions?: CallOptions,
  ): Promise<ChatDeleteResponse['data'] | ServerError>
  async deleteMessage(
    channelId: string,
    messageId: string,
    callOptions: CallOptions = {},
  ): Promise<ChatDeleteResponse | ChatDeleteResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    let authHeaders: Record<string, string> = {}

    try {
      authHeaders = this.applicationOptions.getAuthorizationHeader(
        callOptions.authType,
      )
    } catch (error) {
      if (
        !(error instanceof ValidationError) &&
        !(error instanceof NotAllowedError)
      ) {
        throw error
      }
    }

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

    if (callOptions.ignoreFormatResponse) {
      return res as ChatDeleteResponse
    }

    return responseFormatter(res) as { success: boolean }
  }

  /**
   * Get unread message count for a channel
   *
   * For staff-to-user chats, returns the count relevant to the requesting user:
   * - Staff sees unread messages from user (unreadCountCreator)
   * - User sees unread messages from staff (unreadCountRecipient)
   *
   * For other channel types, returns count of messages since last read.
   *
   * @param channelId - Channel ID
   * @param options - Options including cleanupUnreaded flag
   * @param callOptions - Additional options for the API call including authentication type
   * @returns Promise resolving to unread count for the requesting user
   *
   * @example
   * const { count } = await chat.getUnreadCount('channel-id');
   * console.log(`Unread messages: ${count}`);
   */
  async getUnreadCount(
    channelId: string,
    options: GetUnreadCountOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<UnreadCountResponse | ServerError>
  async getUnreadCount(
    channelId: string,
    options?: GetUnreadCountOptions,
    callOptions?: CallOptions,
  ): Promise<UnreadCountResponse['data'] | ServerError>
  async getUnreadCount(
    channelId: string,
    options: GetUnreadCountOptions = {},
    callOptions: CallOptions = {},
  ): Promise<UnreadCountResponse | UnreadCountResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    let authHeaders: Record<string, string> = {}

    try {
      authHeaders = this.applicationOptions.getAuthorizationHeader(
        callOptions.authType,
      )
    } catch (error) {
      if (
        !(error instanceof ValidationError) &&
        !(error instanceof NotAllowedError)
      ) {
        throw error
      }
    }

    const { cleanupUnreaded = false } = options

    const params = new URLSearchParams({
      cleanupUnreaded: cleanupUnreaded.toString(),
    })

    const res = await apiRequest(
      `${apiUrl}/api/${app}/chat/${channelId}/message/unread-count/?${params.toString()}`,
      {
        method: 'GET',
        headers: { ...authHeaders },
        body: null,
      },
    )

    if (callOptions.ignoreFormatResponse) {
      return res as UnreadCountResponse
    }

    return responseFormatter(res) as UnreadCountResponse['data']
  }
}

export { Chat }
