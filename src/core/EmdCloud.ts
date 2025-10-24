import AppOptions from './AppOptions'
import { ValidationError } from 'src/errors/ValidationError'
import type { AppOptionsType } from 'src/types/common'
import { Auth, UserInteraction } from 'src/user'
import { Webhook } from 'src/webhook'
import { Database } from 'src/database'
import { Uploader } from 'src/uploader'
import { Chat, ChatWebSocket } from 'src/chat'
import type { ChatWebSocketOptions } from 'src/types/chat'

class EmdCloud {
  public auth: Auth
  public user: UserInteraction
  public webhook: Webhook
  public uploader: Uploader
  public chat: Chat
  public setAuthToken: AppOptions['setAuthToken']
  private readonly applicationOptions: AppOptions

  /**
   * Constructs an instance of the API SDK with the specified options.
   *
   * @param {AppOptionsType} opts - Configuration options for the cloud service. Must include:
   * - `environment`: The environment where the application is running.
   *   Should be one of `AppEnvironment.Client` or `AppEnvironment.Server`.
   * - `appId`: The unique identifier for the application.
   * - `apiUrl?`: Optional API URL. Defaults to `https://api.emd.one`.
   * - `authSchema?`: Optional authentication schema. Defaults to `token`.
   * - `token?`: Optional authentication token required for server environment.
   *
   * @throws {ValidationError} If the 'environment', 'appId', or 'token' (when environment is Server) is not provided.
   *
   * @example
   * const apiEmdCloud = new EmdCloud({
   *   environment: AppEnvironment.Server,
   *   appId: 'myAppId',
   *   apiToken: 'myAuthToken'
   * });
   */
  constructor(opts: AppOptionsType) {
    if (!opts.environment) {
      throw new ValidationError('The "environment" option is required.')
    }

    if (!opts.appId) {
      throw new ValidationError('The "app" option is required.')
    }

    if (opts.environment === 'server' && !opts.apiToken) {
      throw new ValidationError('The "apiToken" option is required.')
    }

    this.applicationOptions = new AppOptions(opts)
    this.auth = new Auth(this.applicationOptions)
    this.user = new UserInteraction(this.applicationOptions)
    this.webhook = new Webhook(this.applicationOptions)
    this.uploader = new Uploader(this.applicationOptions)
    this.chat = new Chat(this.applicationOptions)
    this.setAuthToken = this.applicationOptions.setAuthToken.bind(
      this.applicationOptions,
    )
  }

  /**
   * Creates a database instance for interacting with a specific collection.
   *
   * @param {string} collectionId - The unique identifier for the collection
   * @returns {Database} A database instance configured for the specified collection
   * @example
   * const usersDb = emdCloud.database('users-collection-id');
   * const ordersDb = emdCloud.database('orders-collection-id');
   */
  database(collectionId: string): Database {
    return new Database(this.applicationOptions, collectionId)
  }

  /**
   * Creates a chat WebSocket instance for real-time messaging.
   * Use this to establish a WebSocket connection and subscribe to chat channels.
   *
   * @param {Partial<ChatWebSocketOptions>} options - Optional WebSocket configuration
   * @returns {ChatWebSocket} A WebSocket instance for real-time chat
   * @example
   * const chatWs = emdCloud.chatWebSocket();
   * await chatWs.connect();
   * await chatWs.subscribeToChannel('channel-id');
   * chatWs.setCallbacks({
   *   onMessageReceived: (message) => console.log('New message:', message)
   * });
   */
  chatWebSocket(options?: Partial<ChatWebSocketOptions>): ChatWebSocket {
    return new ChatWebSocket(this.applicationOptions, options)
  }
}

export { EmdCloud }
