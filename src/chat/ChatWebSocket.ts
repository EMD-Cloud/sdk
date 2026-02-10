import { ChatAuth } from './ChatAuth'
import type AppOptions from 'src/core/AppOptions'
import { ConnectionState, WebSocketEvent } from 'src/types/chat'
import type {
  PusherMessage,
  ChatWebSocketCallbacks,
  ChatWebSocketOptions,
  ChatMessage,
  ChatChannel,
} from 'src/types/chat'
import type { UserData } from 'src/types/user'

/**
 * ChatWebSocket manager for real-time chat communication
 * Implements Pusher WebSocket protocol with JWS authentication
 * Uses native WebSocket API (available in browsers and Node.js v22+)
 */
export class ChatWebSocket {
  private ws: WebSocket | null = null
  private socketId: string | null = null
  private connectionState: ConnectionState = ConnectionState.Disconnected
  private reconnectAttempts: number = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private pingTimer: ReturnType<typeof setTimeout> | null = null
  private subscribedChannels: Set<string> = new Set()
  private callbacks: ChatWebSocketCallbacks = {}
  private chatAuth: ChatAuth
  private options: Omit<
    Required<ChatWebSocketOptions>,
    'authToken' | 'userData' | 'callbacks'
  > & {
    authToken?: string
    userData: Partial<UserData>
  }

  constructor(
    private readonly applicationOptions: AppOptions,
    options: Partial<ChatWebSocketOptions> = {},
  ) {
    this.chatAuth = new ChatAuth(applicationOptions)

    // Set default options
    const userData = options.userData || this.chatAuth.getUserData()
    this.options = {
      authToken: options.authToken || undefined,
      userData: userData || {},
      autoReconnect: options.autoReconnect !== false,
      maxReconnectAttempts: options.maxReconnectAttempts ?? -1, // -1 = infinite
      reconnectDelay: options.reconnectDelay ?? 1000,
      maxReconnectDelay: options.maxReconnectDelay ?? 30000,
      pingInterval: options.pingInterval ?? 30000, // 30 seconds
    }

    // Initialize callbacks from options
    this.callbacks = options.callbacks || {}
  }

  /**
   * Connect to the WebSocket server
   * @returns Promise that resolves when connected
   */
  async connect(): Promise<void> {
    if (
      this.ws?.readyState === WebSocket.CONNECTING ||
      this.ws?.readyState === WebSocket.OPEN
    ) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        this.setConnectionState(ConnectionState.Connecting)

        const { websocketUrl, app } = this.applicationOptions.getOptions()
        const url = `${websocketUrl}/app/${app}`
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          // Connection established event will be sent by server
          // We'll resolve when we receive ConnectionEstablished event
        }

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const data =
              typeof event.data === 'string'
                ? event.data
                : event.data.toString()
            const message: PusherMessage = JSON.parse(data)
            this.handleMessage(message)

            // Resolve on successful connection
            if (message.event === WebSocketEvent.ConnectionEstablished) {
              resolve()
            }
          } catch (error) {
            console.error('[ChatWebSocket] Failed to parse message:', error)
          }
        }

        this.ws.onerror = (error: Event) => {
          console.error('[ChatWebSocket] WebSocket error:', error)
          this.handleError(new Error('WebSocket error'))
          reject(error)
        }

        this.ws.onclose = (event: CloseEvent) => {
          this.handleDisconnect(event.code)
        }
      } catch (error) {
        console.error('[ChatWebSocket] Failed to connect:', error)
        this.handleError(
          error instanceof Error ? error : new Error(String(error)),
        )
        reject(error)
      }
    })
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // Clear ping timer
    this.stopPingPong()

    // Close WebSocket connection
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    // Reset state
    this.socketId = null
    this.reconnectAttempts = 0
    this.subscribedChannels.clear()
    this.setConnectionState(ConnectionState.Disconnected)
  }

  /**
   * Subscribe to a chat channel
   * @param channelId - Chat channel ID
   * @param chatId - Optional chat ID for authentication
   * @returns Promise that resolves when subscription succeeds
   */
  async subscribeToChannel(channelId: string, chatId?: string): Promise<void> {
    if (!this.socketId) {
      throw new Error('Not connected. Call connect() first.')
    }

    const channel = `chat-${channelId}`

    if (this.subscribedChannels.has(channel)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        // Generate authentication for the channel
        const auth = this.chatAuth.generateChannelAuth(chatId)

        this.sendMessage({
          event: WebSocketEvent.SignIn,
          data: {
            ...auth,
          },
        })

        // Send subscription request
        this.sendMessage({
          event: WebSocketEvent.Subscribe,
          data: {
            channel,
            ...auth,
          },
        })

        // Store subscription
        this.subscribedChannels.add(channel)

        // Listen for subscription success/error
        const originalOnMessage = this.ws!.onmessage
        this.ws!.onmessage = (event: MessageEvent) => {
          const data =
            typeof event.data === 'string' ? event.data : event.data.toString()
          const message: PusherMessage = JSON.parse(data)

          if (message.channel === channel) {
            if (message.event === WebSocketEvent.SubscriptionSucceeded) {
              this.ws!.onmessage = originalOnMessage
              resolve()
            } else if (message.event === WebSocketEvent.SubscriptionError) {
              console.error(
                `[ChatWebSocket] Subscription error for ${channel}:`,
                message.data,
              )
              this.subscribedChannels.delete(channel)
              this.ws!.onmessage = originalOnMessage
              reject(new Error(message.data?.error || 'Subscription failed'))
            }
          }

          // Still handle other messages
          if (originalOnMessage && this.ws) {
            originalOnMessage.call(this.ws, event)
          }
        }

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.subscribedChannels.has(channel)) {
            reject(new Error('Subscription timeout'))
          }
        }, 10000)
      } catch (error) {
        this.subscribedChannels.delete(channel)
        reject(error)
      }
    })
  }

  /**
   * Unsubscribe from a chat channel
   * @param channelId - Chat channel ID
   */
  unsubscribeFromChannel(channelId: string): void {
    const channel = `chat-${channelId}`

    if (!this.subscribedChannels.has(channel)) {
      return
    }

    this.sendMessage({
      event: WebSocketEvent.Unsubscribe,
      data: {
        channel,
      },
    })

    this.subscribedChannels.delete(channel)
  }

  /**
   * Subscribe to support channel (private-space)
   * For staff members to receive support updates
   */
  async subscribeToSupport(): Promise<void> {
    if (!this.socketId) {
      throw new Error('Not connected. Call connect() first.')
    }

    const channel = 'private-space'

    if (this.subscribedChannels.has(channel)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        // Generate authentication
        const auth = this.chatAuth.generateChannelAuth()

        // Send subscription request
        this.sendMessage({
          event: WebSocketEvent.Subscribe,
          data: {
            channel,
            ...auth,
          },
        })

        // Store subscription
        this.subscribedChannels.add(channel)

        // Listen for subscription success
        const timeout = setTimeout(() => {
          if (!this.subscribedChannels.has(channel)) {
            reject(new Error('Support subscription timeout'))
          } else {
            resolve()
          }
        }, 10000)

        // Resolve immediately for now (can be enhanced later)
        clearTimeout(timeout)
        resolve()
      } catch (error) {
        this.subscribedChannels.delete(channel)
        reject(error)
      }
    })
  }

  /**
   * Set event callbacks (merges with existing callbacks)
   * @param callbacks - Event callbacks
   */
  setCallbacks(callbacks: ChatWebSocketCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * Get current connection state
   * @returns Current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  /**
   * Get list of subscribed channels
   * @returns Set of subscribed channel names
   */
  getSubscribedChannels(): Set<string> {
    return new Set(this.subscribedChannels)
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: PusherMessage): void {
    const { event, data } = message

    switch (event) {
      case WebSocketEvent.ConnectionEstablished:
        this.handleConnectionEstablished(data)
        break

      case WebSocketEvent.Error:
        this.handlePusherError(data)
        break

      case WebSocketEvent.UpsertMessage:
        if (this.callbacks.onMessageReceived) {
          this.callbacks.onMessageReceived(data as ChatMessage)
        }
        break

      case WebSocketEvent.RemoveMessage:
        if (this.callbacks.onMessageDeleted) {
          this.callbacks.onMessageDeleted(data)
        }
        break

      case WebSocketEvent.UpdateSupportCount:
        if (this.callbacks.onSupportCountUpdated) {
          this.callbacks.onSupportCountUpdated(data)
        }
        break

      case WebSocketEvent.UpdateSupportChannel:
        if (this.callbacks.onSupportChannelUpdated) {
          this.callbacks.onSupportChannelUpdated(data as ChatChannel)
        }
        break

      case WebSocketEvent.Pong:
      case WebSocketEvent.SubscriptionSucceeded:
      case WebSocketEvent.SubscriptionError:
      default:
        break
    }
  }

  /**
   * Handle connection established event
   */
  private handleConnectionEstablished(data: any): void {
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data
    this.socketId = parsedData.socket_id

    this.setConnectionState(ConnectionState.Connected)
    this.reconnectAttempts = 0

    // Start ping/pong to keep connection alive
    this.startPingPong()

    // Resubscribe to channels if reconnecting
    if (this.subscribedChannels.size > 0) {
      const channels = Array.from(this.subscribedChannels)
      this.subscribedChannels.clear()

      channels.forEach((channel) => {
        const channelId = channel.replace('chat-', '')
        this.subscribeToChannel(channelId).catch((error) => {
          console.error(
            `[ChatWebSocket] Failed to resubscribe to ${channel}:`,
            error,
          )
        })
      })
    }
  }

  /**
   * Handle Pusher error events
   */
  private handlePusherError(data: any): void {
    console.error('[ChatWebSocket] Pusher error:', data)
    const error = new Error(data.message || 'Pusher error')
    this.handleError(error)
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    console.error('[ChatWebSocket] Error:', error)
    this.setConnectionState(ConnectionState.Error)

    if (this.callbacks.onError) {
      this.callbacks.onError(error)
    }
  }

  /**
   * Handle disconnection
   */
  private handleDisconnect(code: number): void {
    this.stopPingPong()
    this.socketId = null

    if (code === 1000) {
      // Normal closure
      this.setConnectionState(ConnectionState.Disconnected)
      return
    }

    // Attempt reconnection if enabled
    if (this.options.autoReconnect) {
      const shouldReconnect =
        this.options.maxReconnectAttempts === -1 ||
        this.reconnectAttempts < this.options.maxReconnectAttempts

      if (shouldReconnect) {
        this.setConnectionState(ConnectionState.Connecting)
        this.scheduleReconnect()
      } else {
        this.setConnectionState(ConnectionState.Disconnected)
      }
    } else {
      this.setConnectionState(ConnectionState.Disconnected)
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.options.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.options.maxReconnectDelay,
    )

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      this.connect().catch((error) => {
        console.error('[ChatWebSocket] Reconnection failed:', error)
      })
    }, delay)
  }

  /**
   * Start ping/pong keepalive
   */
  private startPingPong(): void {
    this.stopPingPong()

    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendMessage({
          event: WebSocketEvent.Ping,
          data: {},
        })
      }
    }, this.options.pingInterval)
  }

  /**
   * Stop ping/pong keepalive
   */
  private stopPingPong(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  /**
   * Send a message to the WebSocket server
   */
  private sendMessage(message: PusherMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error(
        '[ChatWebSocket] Cannot send message: WebSocket not open',
        message,
      )
    }
  }

  /**
   * Update connection state and notify callbacks
   */
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state

      if (this.callbacks.onConnectionStateChange) {
        this.callbacks.onConnectionStateChange(state)
      }
    }
  }
}
