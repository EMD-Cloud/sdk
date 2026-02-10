import { BaseModule } from 'src/core/BaseModule'
import { ValidationError } from 'src/errors/ValidationError'
import { ServerError } from 'src/errors/ServerError'
import type {
  ForgotPassCheckCodeData,
  ForgotPassData,
  UserData,
  OAuthUrlResponse,
  AuthUserResponse,
  ForgotPassDataResponse,
  ForgotPassCheckCodeDataResponse,
} from 'src/types/user'
import { SocialProvider } from '../types'
import { apiRequest } from 'src/utils/fetch'
import { responseFormatter } from 'src/utils/formatters'
import type { CallOptions } from 'src/types/common'

// HTTP redirect status codes
const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308] as const

class Auth extends BaseModule {
  /**
   * Attempts to authorize the current user using a stored authentication token.
   *
   * This method retrieves the API URL and app identifier from the application options,
   * then uses the existing authentication token to call the authorization endpoint.
   * If the token is not present, it throws a ValidationError. The formatted response
   * is returned as-is, which can contain user data when the session is active or `null`
   * when the token is valid but no session data is available.
   *
   * @throws {ValidationError} Thrown when the authentication token is missing.
   * @returns {Promise<UserData | ServerError | ValidationError | null>} Resolves with the user data, `null`,
   *          or throws a ServerError/ValidationError if the authorization request fails.
   */
  async authorization(
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<AuthUserResponse | ServerError | ValidationError | null>
  async authorization(
    callOptions?: CallOptions,
  ): Promise<UserData | ServerError | ValidationError | null>
  async authorization(
    callOptions: CallOptions = {},
  ): Promise<
    AuthUserResponse | UserData | ServerError | ValidationError | null
  > {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authenticationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    return this.request<AuthUserResponse>(
      `${apiUrl}/api/${app}/auth/me`,
      {
        method: 'POST',
        headers: { ...authenticationHeader },
        body: null,
      },
      callOptions,
    )
  }

  /**
   * Attempts to log in a user with provided credentials.
   *
   * @param {Object} params - The login parameters.
   * @param {string} params.login - The user's login identifier.
   * @param {string} params.password - The user's password.
   * @param {CallOptions} callOptions - Additional options for the API call.
   * @returns {Promise<UserData|ServerError>} A promise that resolves with the user data on successful login
   *                                         or a server error response on failure.
   * @throws {Error} Throws an error if the API request fails or the server returns an error.
   * @async
   */
  async login(
    params: { login: string; password: string },
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<AuthUserResponse | ServerError>
  async login(
    params: { login: string; password: string },
    callOptions?: CallOptions,
  ): Promise<UserData | ServerError>
  async login(
    params: { login: string; password: string },
    callOptions: CallOptions = {},
  ): Promise<AuthUserResponse | UserData | ServerError> {
    const { login, password } = params
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(`${apiUrl}/api/${app}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    })

    const data = responseFormatter(res) as UserData

    this.applicationOptions.setAuthToken(data.token)

    if (callOptions.ignoreFormatResponse) {
      return res as unknown as AuthUserResponse
    }

    return data
  }

  /**
   * Asynchronously registers a new user with the provided user details.
   *
   * @param {Object} params - The options for registration.
   * @param {string} [params.firstName] - The first name of the user.
   * @param {string} [params.lastName] - The last name of the user.
   * @param {string} params.login - The login identifier for the user.
   * @param {string} params.password - The password for the user account.
   * @param {Record<string, any>} [params.customFields] - Additional custom fields for the user.
   * @param {string} [params.captchaToken] - A token to verify the request is coming from a human.
   * @param {CallOptions} callOptions - Additional options for the API call.
   * @returns {Promise<UserData|ServerError>} A promise that resolves to the user data on successful registration
   * or a server error if the registration fails.
   * @async
   * @example
   * await emdCloud.auth.registration({
   *   firstName: 'Jane',
   *   lastName: 'Doe',
   *   login: 'janedoe',
   *   password: 'securepassword123',
   *   customFields: { age: 30 },
   *   captchaToken: 'abcd1234'
   * });
   */
  async registration(
    params: {
      firstName?: string
      lastName?: string
      login: string
      password: string
      customFields?: Record<string, any>
      captchaToken?: string
    },
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<AuthUserResponse | ServerError>
  async registration(
    params: {
      firstName?: string
      lastName?: string
      login: string
      password: string
      customFields?: Record<string, any>
      captchaToken?: string
    },
    callOptions?: CallOptions,
  ): Promise<UserData | ServerError>
  async registration(
    params: {
      firstName?: string
      lastName?: string
      login: string
      password: string
      customFields?: Record<string, any>
      captchaToken?: string
    },
    callOptions: CallOptions = {},
  ): Promise<AuthUserResponse | UserData | ServerError> {
    const { firstName, lastName, login, password, customFields, captchaToken } =
      params
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(`${apiUrl}/api/${app}/auth/register`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        login,
        password,
        customFields,
        captchaToken,
      }),
      method: 'POST',
    })

    const data = responseFormatter(res) as UserData

    this.applicationOptions.setAuthToken(data.token)

    if (callOptions.ignoreFormatResponse) {
      return res as unknown as AuthUserResponse
    }

    return data
  }

  /**
   * Initiates a password reset process for the user identified by the given email.
   * Sends a password reset request to the server and expects a response.
   * Handles the response by formatting it and returning the relevant data.
   *
   * @param {string} email - The email address of the user who has forgotten their password.
   * @param {CallOptions} callOptions - Additional options for the API call.
   * @returns {Promise<ForgotPassData | ServerError>} - A promise that resolves with the password reset data
   * or an error if the operation fails.
   * @throws {ServerError} Throws an error if the response from the server indicates a failure.
   * @async
   */
  async forgotPassword(
    email: string,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ForgotPassDataResponse | ServerError>
  async forgotPassword(
    email: string,
    callOptions?: CallOptions,
  ): Promise<ForgotPassData | ServerError>
  async forgotPassword(
    email: string,
    callOptions: CallOptions = {},
  ): Promise<ForgotPassDataResponse | ForgotPassData | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    return this.request<ForgotPassDataResponse>(
      `${apiUrl}/api/${app}/auth/forgot`,
      {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        method: 'POST',
      },
      callOptions,
    )
  }

  /**
   * Checks the verification code submitted by the user for password recovery.
   *
   * This method sends a POST request to the server with the verification code
   * provided by the user. It is part of the password recovery process where the
   * user must verify their identity by entering a code that was sent to them.
   *
   * @param {Object} params - The parameters for verifying the password recovery code.
   * @param {string} params.requestId - The unique identifier for the password recovery request.
   * @param {string} params.code - The verification code submitted by the user.
   * @param {CallOptions} callOptions - Additional options for the API call.
   * @returns {Promise<ForgotPassCheckCodeData|ServerError>} A promise that resolves to the result of the verification process.
   * @throws {ServerError} Throws an error if the server response indicates a failure.
   *
   * @example
   * async function verifyCode() {
   *   try {
   *     const response = await emdCloud.auth.forgotPasswordCheckCode({ requestId: '12345', code: '54321' });
   *     console.log('Verification successful:', response);
   *   } catch (error) {
   *     console.error('Verification failed:', error);
   *   }
   * }
   */
  async forgotPasswordCheckCode(
    params: { requestId: string; code: string },
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<ForgotPassCheckCodeDataResponse | ServerError>
  async forgotPasswordCheckCode(
    params: { requestId: string; code: string },
    callOptions?: CallOptions,
  ): Promise<ForgotPassCheckCodeData | ServerError>
  async forgotPasswordCheckCode(
    params: { requestId: string; code: string },
    callOptions: CallOptions = {},
  ): Promise<
    ForgotPassCheckCodeDataResponse | ForgotPassCheckCodeData | ServerError
  > {
    const { requestId, code } = params
    const { apiUrl, app } = this.applicationOptions.getOptions()

    return this.request<ForgotPassCheckCodeDataResponse>(
      `${apiUrl}/api/${app}/auth/forgot/${requestId}`,
      {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        method: 'POST',
      },
      callOptions,
    )
  }

  /**
   * Handles the password change process for a user who has forgotten their password.
   * This method verifies that the new passwords match and makes an API request to change the password.
   *
   * @param {Object} params - An object containing the necessary parameters.
   * @param {string} params.requestId - The request ID associated with the password reset request.
   * @param {string} params.newPassword - The new password to be set.
   * @param {string} params.newPasswordRepeat - The new password repeated for verification.
   * @param {CallOptions} callOptions - Additional options for the API call.
   * @returns {Promise<UserData|ServerError>} A promise that resolves to the user data on successful password change
   * or throws an error if the passwords do not match or if the server responds with an error.
   * @throws {ValidationError} Throws ValidationError if the new passwords do not match.
   * @async
   */
  async forgotPasswordChange(
    params: {
      requestId: string
      newPassword: string
      newPasswordRepeat: string
    },
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<AuthUserResponse | ServerError>
  async forgotPasswordChange(
    params: {
      requestId: string
      newPassword: string
      newPasswordRepeat: string
    },
    callOptions?: CallOptions,
  ): Promise<UserData | ServerError>
  async forgotPasswordChange(
    params: {
      requestId: string
      newPassword: string
      newPasswordRepeat: string
    },
    callOptions: CallOptions = {},
  ): Promise<AuthUserResponse | UserData | ServerError> {
    const { requestId, newPassword, newPasswordRepeat } = params

    if (newPassword !== newPasswordRepeat)
      throw new ValidationError('Passwords is not match')

    const { apiUrl, app } = this.applicationOptions.getOptions()

    return this.request<AuthUserResponse>(
      `${apiUrl}/api/${app}/auth/forgot/${requestId}`,
      {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword1: newPassword,
          newPassword2: newPasswordRepeat,
        }),
        method: 'PUT',
      },
      callOptions,
    )
  }

  /**
   * Initiates social login flow for OAuth authentication with VK or Yandex.
   *
   * This method generates an OAuth authorization URL that the client should redirect
   * the user to for authentication with the selected social provider.
   *
   * @param {Object} params - The social login parameters.
   * @param {SocialProvider} params.provider - The social provider to use ('vk' or 'yandex').
   * @param {string} params.redirectUrl - The URL to redirect back to after OAuth authorization.
   * @returns {Promise<OAuthUrlResponse|ServerError>} A promise that resolves with the OAuth authorization URL
   *                                                  or a server error if the request fails.
   * @throws {ValidationError} Throws an error if the provider is not supported.
   * @throws {ServerError} Throws an error if the OAuth provider is not configured or request fails.
   * @async
   *
   * @example
   * // Initiate VK OAuth login
   * const response = await emdCloud.auth.socialLogin({
   *   provider: SocialProvider.VK,
   *   redirectUrl: 'https://myapp.com/auth/callback'
   * });
   * // Redirect user to response.url
   * window.location.href = response.url;
   */
  async socialLogin({
    provider,
    redirectUrl,
  }: {
    provider: SocialProvider
    redirectUrl: string
  }): Promise<OAuthUrlResponse | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    if (!Object.values(SocialProvider).includes(provider)) {
      throw new ValidationError(`Unsupported social provider: ${provider}`)
    }

    // Construct OAuth URL with proper parameter handling
    const oauthUrl = new URL(`/api/${app}/oauth/${provider}`, apiUrl)
    oauthUrl.searchParams.set('redirectUrl', redirectUrl)

    // In client environments, return URL for direct navigation
    // Browser will handle the redirect chain automatically, avoiding CORS issues
    if (this.applicationOptions.getEnvironment() === 'client') {
      return { url: oauthUrl.toString() } as OAuthUrlResponse
    }

    // Server-side: attempt to get redirect location via fetch
    try {
      const response = await fetch(oauthUrl.toString(), {
        method: 'GET',
        redirect: 'manual', // Don't follow redirects automatically
      })

      // OAuth endpoint returns a redirect to the provider's auth page
      if (REDIRECT_STATUS_CODES.includes(response.status as any)) {
        const location = response.headers.get('location')
        if (location) {
          return { url: location } as OAuthUrlResponse
        }
        throw new ServerError(
          `OAuth redirect received but no location header found (status: ${response.status})`,
        )
      }

      // If not a redirect, it might be an error response
      if (!response.ok) {
        let errorMessage = `OAuth initialization failed (status: ${response.status})`

        // Only try to parse body if content-type indicates JSON
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (jsonError) {
            // JSON parsing failed, append parse error details
            errorMessage = `${errorMessage} (could not parse response body)`
          }
        } else {
          // Non-JSON response, try to get text for debugging
          try {
            const text = await response.text()
            if (text) {
              errorMessage = `${errorMessage}: ${text.substring(0, 200)}`
            }
          } catch {
            errorMessage = `${errorMessage} (empty or unreadable response)`
          }
        }

        throw new ServerError(errorMessage)
      }

      // Unexpected successful response without redirect
      throw new ServerError('Unexpected response from OAuth endpoint')
    } catch (error) {
      if (error instanceof ServerError || error instanceof ValidationError) {
        throw error
      }
      throw new ServerError(
        `Failed to initialize OAuth: ${(error as Error).message}`,
      )
    }
  }

  /**
   * Exchanges an OAuth secret token for an authentication token.
   *
   * This method is used after the OAuth callback to exchange the temporary secret
   * token for a permanent authentication token and user data.
   *
   * @param {string} secret - The secret token received from the OAuth callback.
   * @param {CallOptions} callOptions - Additional options for the API call.
   * @returns {Promise<UserData|ServerError>} A promise that resolves with the authenticated user data
   *                                          including the authentication token, or a server error if the exchange fails.
   * @throws {ValidationError} Throws an error if the secret token is missing.
   * @async
   *
   * @example
   * // After OAuth callback, exchange the secret for authentication
   * const urlParams = new URLSearchParams(window.location.search);
   * const secret = urlParams.get('secret');
   *
   * if (secret) {
   *   const userData = await emdCloud.auth.exchangeOAuthToken(secret);
   *   console.log('Authenticated user:', userData);
   * }
   */
  async exchangeOAuthToken(
    secret: string,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<AuthUserResponse | ServerError>
  async exchangeOAuthToken(
    secret: string,
    callOptions?: CallOptions,
  ): Promise<UserData | ServerError>
  async exchangeOAuthToken(
    secret: string,
    callOptions: CallOptions = {},
  ): Promise<AuthUserResponse | UserData | ServerError> {
    if (!secret) {
      throw new ValidationError('OAuth secret token is required')
    }

    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/oauth/get-access-token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      },
    )

    const data = responseFormatter(res) as UserData

    if (data.token) {
      this.applicationOptions.setAuthToken(data.token)
    }

    if (callOptions.ignoreFormatResponse) {
      return res as unknown as AuthUserResponse
    }

    return data
  }

  /**
   * Asynchronously updates an existing user's information.
   *
   * @param {Object} payload - The payload containing user update data.
   * @param {string} [payload._id] - The unique identifier of the user (if not provided, the current authenticated user is updated).
   * @param {string} [payload.firstName] - The updated first name of the user.
   * @param {string} [payload.lastName] - The updated last name of the user.
   * @param {string} [payload.patronymicName] - The updated patronymic (middle) name of the user.
   * @param {string} [payload.login] - The new login identifier for the user.
   * @param {Record<string, any>} [payload.customFields] - Additional custom fields to update.
   * @param {string} [payload.avatarUrl] - URL to the user's avatar image.
   * @param {string} [payload.password] - The user's current password (required for sensitive updates in some cases).
   * @param {string} [payload.oldPassword] - The current password (when changing password).
   * @param {string} [payload.newPassword1] - The new password (first entry).
   * @param {string} [payload.newPassword2] - The new password (confirmation).
   * @param {string} [payload.accountStatus] - The status of the account (e.g., 'active', 'disabled').
   * @param {boolean} [payload.staffManage] - Whether the user has staff management permissions.
   * @param {CallOptions} callOptions - Additional options for the API call.
   * @returns {Promise<UserData|ServerError>} A promise resolving with the updated user data,
   * or an error if the update fails.
   * @async
   * @example
   * await emdCloud.auth.updateUser({
   *   _id: 'user123',
   *   firstName: 'Jane',
   *   lastName: 'Doe',
   *   avatarUrl: 'https://example.com/avatar.png',
   *   customFields: { department: 'Sales' },
   * });
   */
  async updateUser(
    payload: {
      _id?: string
      firstName?: string
      lastName?: string
      patronymicName?: string
      login?: string
      customFields?: Record<string, any>
      avatarUrl?: string
      password?: string
      oldPassword?: string
      newPassword1?: string
      newPassword2?: string
      accountStatus?: string
      staffManage?: boolean
    },
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<AuthUserResponse | ServerError>
  async updateUser(
    payload: {
      _id?: string
      firstName?: string
      lastName?: string
      patronymicName?: string
      login?: string
      customFields?: Record<string, any>
      avatarUrl?: string
      password?: string
      oldPassword?: string
      newPassword1?: string
      newPassword2?: string
      accountStatus?: string
      staffManage?: boolean
    },
    callOptions?: CallOptions,
  ): Promise<UserData | ServerError>
  async updateUser(
    payload: {
      _id?: string
      firstName?: string
      lastName?: string
      patronymicName?: string
      login?: string
      customFields?: Record<string, any>
      avatarUrl?: string
      password?: string
      oldPassword?: string
      newPassword1?: string
      newPassword2?: string
      accountStatus?: string
      staffManage?: boolean
    },
    callOptions: CallOptions = {},
  ): Promise<AuthUserResponse | UserData | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authenticationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    return this.request<AuthUserResponse>(
      `${apiUrl}/api/${app}/user`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...authenticationHeader,
        },
        body: JSON.stringify(payload),
        method: 'PUT',
      },
      callOptions,
    )
  }
}

export { Auth }
