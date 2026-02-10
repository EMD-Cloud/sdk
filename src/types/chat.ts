import type { CallOptions } from './common'
import type { UserData } from './user'

/**
 * Chat channel types
 */
export enum ChatChannelType {
  /** Public chat accessible to all authenticated users */
  Public = 'public',
  /** Support channel between staff and user */
  StaffToUser = 'staff-to-user',
  /** Direct message between specific users */
  PeerToPeer = 'peer-to-peer',
  /** Internal staff conversation */
  Staff = 'staff',
}

/**
 * Read permission levels for chat channels
 */
export enum ChatReadPermission {
  /** All users with channel access can read */
  AllUsers = 'all-users',
  /** Only listed participants can read */
  OnlyAuthorized = 'only-authorized',
}

/**
 * Write permission levels for chat channels
 */
export enum ChatWritePermission {
  /** All users with channel access can write */
  AllUsers = 'all-users',
  /** Only listed participants can write */
  OnlyAuthorized = 'only-authorized',
}

/**
 * WebSocket event types for real-time chat updates
 */
export enum WebSocketEvent {
  // Pusher protocol events
  /** Connection established with server */
  ConnectionEstablished = 'pusher:connection_established',
  /** Pong response to ping */
  Pong = 'pusher:pong',
  /** Pusher error event */
  Error = 'pusher:error',
  /** Authorization (client → server)  */
  SignIn = 'pusher:signin',
  /** Subscription error */
  SubscriptionError = 'pusher:subscription_error',
  /** Subscribe to channel (client → server) */
  Subscribe = 'pusher:subscribe',
  /** Unsubscribe from channel (client → server) */
  Unsubscribe = 'pusher:unsubscribe',
  /** Ping to keep connection alive (client → server) */
  Ping = 'pusher:ping',
  /** Subscription successful */
  SubscriptionSucceeded = 'pusher_internal:subscription_succeeded',

  // Custom application events
  /** New message created or updated */
  UpsertMessage = 'pusher_internal:upsert_message',
  /** Message deleted */
  RemoveMessage = 'pusher_internal:remove_message',
  /** Support channel unread count updated */
  UpdateSupportCount = 'pusher_internal:update_support_count',
  /** Support channel updated */
  UpdateSupportChannel = 'pusher_internal:update_support_channel',
}

/**
 * WebSocket connection states
 */
export enum ConnectionState {
  /** Attempting to connect */
  Connecting = 'connecting',
  /** Successfully connected */
  Connected = 'connected',
  /** Disconnected */
  Disconnected = 'disconnected',
  /** Connection error */
  Error = 'error',
}

/**
 * User access to a chat channel
 */
export interface ChatChannelAccess {
  _id: string
  /** User UUID or user object */
  user: string | UserData
  /** When user last read messages */
  messageLastReadAt?: Date | string
}

/**
 * Channel read/write permissions
 */
export interface ChatChannelSetting {
  /** Read permission level */
  read: ChatReadPermission
  /** Write permission level */
  write: ChatWritePermission
}

/**
 * Message attachment (image, file, etc.)
 */
export interface ChatAttachment {
  _id?: string
  /** Attachment type (e.g., 'image', 'file') */
  type: string
  /** Attachment identifier/path */
  attach: string
  /** Display name */
  name?: string
}

/**
 * Chat message
 */
export interface ChatMessage {
  _id: string
  /** Channel reference (can be channel ID or full channel object) */
  channel: string | ChatChannel
  /** Message text */
  message?: string
  /** User UUID or user object who posted the message */
  user?: string | UserData
  /** Message attachments */
  attaches?: ChatAttachment[]
  /** Creation timestamp */
  createdAt?: Date | string
  /** Update timestamp */
  updatedAt?: Date | string
}

/**
 * Chat channel
 */
export interface ChatChannel {
  _id: string
  /** Workspace identifier */
  space: string
  /** Unique channel identifier */
  id: string
  /** Channel type */
  type: ChatChannelType
  /** Unread count for creator (staff-to-user chats) */
  unreadCountCreator?: number
  /** Unread count for recipient (staff-to-user chats) */
  unreadCountRecipient?: number
  /** Timestamp of last message */
  lastMessageAt?: Date | string
  /** UUID of user who posted last message */
  lastMessageUser?: string
  /** Whether support chat is resolved */
  resolved?: boolean
  /** List of channel participants */
  accesses?: ChatChannelAccess[]
  /** Read/write permissions */
  setting?: ChatChannelSetting
  /** Last message (included in list responses) */
  lastMessage?: ChatMessage | null
}

/**
 * Options for listing chat channels
 */
export interface ChatListOptions extends CallOptions {
  /** Filter by channel type */
  type?: ChatChannelType
  /** Search in user names or chat content */
  search?: string
  /** Number of channels per page */
  limit?: number
  /** Page number (0-indexed) */
  page?: number
  /** Field to sort by */
  orderBy?: string
  /** Sort direction */
  sort?: 'ASC' | 'DESC'
  /** Show only unread chats */
  unreadedChats?: boolean
  /** Show chats with long time since answer */
  longTimeAnswer?: boolean
}

/**
 * Response for channel list
 */
export interface ChatListResponse {
  success: true
  data: ChatChannel[]
  count: number
  pages: number
}

/**
 * Options for creating a channel by type
 */
export interface CreateChannelByTypeOptions extends CallOptions {
  /** User ID (for staff-to-user chats) */
  userId?: string
  /** Custom channel ID */
  id?: string
  /** User UUIDs for peer-to-peer chats */
  accesses?: string[]
}

/**
 * Options for creating/updating a channel
 */
export interface UpsertChannelOptions extends CallOptions {
  /** Channel ID (if updating) */
  _id?: string
  /** Custom channel ID */
  id?: string
  /** Channel type */
  type?: ChatChannelType
  /** Whether support chat is resolved */
  resolved?: boolean
}

/**
 * Options for getting channel details
 */
export interface GetChannelOptions extends CallOptions {
  /** Clear unread counts on fetch */
  cleanupUnreaded?: boolean
}

/**
 * Options for listing messages
 */
export interface ChatMessageListOptions extends CallOptions {
  /** Search text in messages */
  search?: string
  /** Number of messages per page */
  limit?: number
  /** Page number (0-indexed) */
  page?: number
  /** Field to sort by */
  orderBy?: string
  /** Sort direction */
  sort?: 'ASC' | 'DESC'
}

/**
 * Response for message list
 */
export interface ChatMessageListResponse {
  success: true
  data: ChatMessage[]
  count: number
  pages: number
}

/**
 * Options for sending a message
 */
export interface SendMessageOptions extends CallOptions {
  /** Message text */
  message?: string
  /** Message attachments (max 10) */
  attaches?: Omit<ChatAttachment, '_id'>[]
}

/**
 * Options for getting unread count
 */
export interface GetUnreadCountOptions extends CallOptions {
  /** Clear unread counts on fetch */
  cleanupUnreaded?: boolean
}

/**
 * Unread count data
 *
 * Returns a single count based on the requesting user's role:
 * - For staff-to-user chats: staff sees unread from user, user sees unread from staff
 * - For other channel types: count of messages since last read
 */
export interface UnreadCountData {
  count: number
}

/**
 * Unread count response wrapper
 */
export interface UnreadCountResponse {
  success: true
  data: UnreadCountData
}

/**
 * Response wrapper for single channel operations
 */
export interface ChatChannelResponse {
  success: true
  data: ChatChannel
}

/**
 * Response wrapper for single message operations
 */
export interface ChatMessageResponse {
  success: true
  data: ChatMessage
}

/**
 * Response wrapper for delete operations
 */
export interface ChatDeleteResponse {
  success: true
  data: { success: boolean }
}

/**
 * Pusher protocol message structure
 */
export interface PusherMessage {
  /** Event name */
  event: string
  /** Channel name */
  channel?: string
  /** Message data */
  data?: any
}

/**
 * WebSocket callback for message events
 */
export type MessageCallback = (message: ChatMessage) => void

/**
 * WebSocket callback for message deletion
 */
export type MessageDeletedCallback = (data: {
  _id: string
  channel: string
}) => void

/**
 * WebSocket callback for support count updates
 */
export type SupportCountCallback = (data: { count: number }) => void

/**
 * WebSocket callback for support channel updates
 */
export type SupportChannelCallback = (channel: ChatChannel) => void

/**
 * WebSocket callback for connection state changes
 */
export type ConnectionStateCallback = (state: ConnectionState) => void

/**
 * WebSocket callbacks for real-time events
 */
export interface ChatWebSocketCallbacks {
  /** Called when a new message is received */
  onMessageReceived?: MessageCallback
  /** Called when a message is deleted */
  onMessageDeleted?: MessageDeletedCallback
  /** Called when support unread count is updated */
  onSupportCountUpdated?: SupportCountCallback
  /** Called when support channel is updated */
  onSupportChannelUpdated?: SupportChannelCallback
  /** Called when connection state changes */
  onConnectionStateChange?: ConnectionStateCallback
  /** Called on any error */
  onError?: (error: Error) => void
}

/**
 * Options for WebSocket connection
 */
export interface ChatWebSocketOptions {
  /** Authentication token (JWT) */
  authToken?: string
  /** User data */
  userData?: UserData
  /** Auto-reconnect on disconnect */
  autoReconnect?: boolean
  /** Maximum reconnection attempts (-1 for infinite) */
  maxReconnectAttempts?: number
  /** Initial reconnection delay in ms */
  reconnectDelay?: number
  /** Maximum reconnection delay in ms */
  maxReconnectDelay?: number
  /** Ping interval in ms */
  pingInterval?: number
  /** Event callbacks (can also be set later with setCallbacks) */
  callbacks?: ChatWebSocketCallbacks
}
