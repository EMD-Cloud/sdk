import AppOptions from './AppOptions'
import { ValidationError } from 'src/errors/ValidationError'
import type { AppOptionsType } from 'src/types/common'
import { Auth, UserInteraction } from 'src/user'
import { Webhook } from 'src/webhook'
import { Database } from 'src/database'
import { Uploader } from 'src/uploader'

class EmdCloud {
  public auth: Auth
  public user: UserInteraction
  public webhook: Webhook
  public uploader: Uploader
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
}

export { EmdCloud }
