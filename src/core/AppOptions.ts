import { NotAllowedError } from 'src/errors/NotAllowedError'
import { ValidationError } from 'src/errors/ValidationError'
import { AppEnvironment, AppOptionsType, AuthType } from 'src/types/common'

class AppOptions {
  private readonly apiUrl: AppOptionsType['apiUrl']
  private readonly websocketUrl: AppOptionsType['websocketUrl']
  private readonly apiToken: AppOptionsType['apiToken']
  private readonly appId: AppOptionsType['appId']
  private readonly authSchema: AppOptionsType['authSchema']
  private readonly headerApiTokenKey: AppOptionsType['headerApiTokenKey']
  private readonly environment: AppOptionsType['environment']
  private readonly defaultAuthType: AppOptionsType['defaultAuthType']
  private authToken?: string

  constructor({
    appId,
    environment,
    apiToken = '',
    apiUrl = 'https://api.emd.one',
    websocketUrl = 'wss://ws.emd.one',
    authSchema = 'token',
    defaultAuthType,
    headerApiTokenKey = 'apitoken',
  }: AppOptionsType) {
    this.appId = appId
    this.environment = environment
    this.apiToken = apiToken
    this.apiUrl = apiUrl
    this.websocketUrl = websocketUrl
    this.authSchema = authSchema
    this.defaultAuthType = defaultAuthType || this.determineDefaultAuthType()
    this.headerApiTokenKey = headerApiTokenKey
  }

  getOptions() {
    return { apiUrl: this.apiUrl, websocketUrl: this.websocketUrl, app: this.appId }
  }

  getEnvironment() {
    return this.environment
  }

  /**
   * Get raw authentication token
   * @param authType - Optional auth type override
   * @returns Raw token string
   */
  getAuthToken(authType?: AuthType): string {
    const effectiveAuthType = authType || this.defaultAuthType

    if (effectiveAuthType === AuthType.AuthToken) {
      if (!this.authToken) throw new ValidationError('Unable auth token')
      return this.authToken
    }

    if (effectiveAuthType === AuthType.ApiToken) {
      if (this.environment === AppEnvironment.Client) {
        throw new NotAllowedError(
          `Obtaining an apiToken is prohibited on the client side`,
        )
      }
      return String(this.apiToken)
    }

    throw new ValidationError(
      `Not support current authType (${effectiveAuthType})`,
    )
  }

  private determineDefaultAuthType(): AuthType {
    if (this.environment === AppEnvironment.Client) {
      return AuthType.AuthToken
    }
    // Server: use ApiToken if available, otherwise AuthToken
    return this.apiToken ? AuthType.ApiToken : AuthType.AuthToken
  }

  getAuthorizationHeader(authType?: AuthType): Record<string, string> {
    const effectiveAuthType = authType || this.defaultAuthType
    const token = this.getAuthToken(authType)

    if (effectiveAuthType === AuthType.AuthToken) {
      return { Authorization: `${this.authSchema} ${token}` }
    }

    if (effectiveAuthType === AuthType.ApiToken) {
      return { [String(this.headerApiTokenKey)]: token }
    }

    throw new ValidationError(
      `Not support current authType (${effectiveAuthType})`,
    )
  }

  setAuthToken(token: string) {
    this.authToken = token
  }
}

export default AppOptions
