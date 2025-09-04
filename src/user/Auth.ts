import AppOptions from 'src/core/AppOptions'
import { ValidationError } from 'src/errors/ValidationError'
import { ServerError } from 'src/errors/ServerError'
import {
  ForgotPassCheckCodeData,
  ForgotPassData,
  UserData,
  SocialProvider,
  OAuthUrlResponse,
} from 'src/types/user'
import { apiRequest } from 'src/utils/fetch'
import { responseFormatter } from 'src/utils/formatters'

// HTTP redirect status codes
const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308] as const

class Auth {
  private applicationOptions: AppOptions

  constructor(applicationOptions: AppOptions) {
    this.applicationOptions = applicationOptions
  }

  /**
   * Attempts to authorize a user using a stored authentication token.
   *
   * This method retrieves the application's API URL and app identifier from the application options,
   * then uses an existing authentication token to make a POST request to the authorization endpoint.
   * If the token is not present, it throws a ValidationError. After receiving the response, it formats
   * the response data and updates the token stored in the application options with the new token received.
   *
   * @throws {ValidationError} Thrown when the authentication token is missing.
   * @returns {Promise<UserData | ServerError | ValidationError>} Returns a promise that resolves to the user data on successful authorization,
   *         or throws an error (ServerError or ValidationError) if the authorization fails.
   */
  async authorization(): Promise<UserData | ServerError | ValidationError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authenticationHeader =
      this.applicationOptions.getAuthorizationHeader()

    const res = await apiRequest(`${apiUrl}/api/${app}/auth/me`, {
      method: 'POST',
      headers: { ...authenticationHeader },
      body: null,
    })

    const data = responseFormatter(res) as UserData

    this.applicationOptions.setAuthToken(data.token)

    return data
  }

  /**
   * Attempts to log in a user with provided credentials.
   *
   * @param {Object} params - The login parameters.
   * @param {string} params.login - The user's login identifier.
   * @param {string} params.password - The user's password.
   * @returns {Promise<UserData|ServerError>} A promise that resolves with the user data on successful login
   *                                         or a server error response on failure.
   * @throws {Error} Throws an error if the API request fails or the server returns an error.
   * @async
   */
  async login({
    login,
    password,
  }: {
    login: string
    password: string
  }): Promise<UserData | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(`${apiUrl}/api/${app}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    })

    const data = responseFormatter(res) as UserData

    this.applicationOptions.setAuthToken(data.token)

    return data
  }

  /**
   * Asynchronously registers a new user with the provided user details.
   *
   * @param {Object} options - The options for registration.
   * @param {string} [options.firstName] - The first name of the user.
   * @param {string} [options.lastName] - The last name of the user.
   * @param {string} options.login - The login identifier for the user.
   * @param {string} options.password - The password for the user account.
   * @param {Record<string, any>} [options.customFields] - Additional custom fields for the user.
   * @param {string} [options.captchaToken] - A token to verify the request is coming from a human.
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
  async registration({
    firstName,
    lastName,
    login,
    password,
    customFields,
    captchaToken,
  }: {
    firstName?: string
    lastName?: string
    login: string
    password: string
    customFields?: Record<string, any>
    captchaToken?: string
  }): Promise<UserData | ServerError> {
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

    return data
  }

  /**
   * Initiates a password reset process for the user identified by the given email.
   * Sends a password reset request to the server and expects a response.
   * Handles the response by formatting it and returning the relevant data.
   *
   * @param {string} email - The email address of the user who has forgotten their password.
   * @returns {Promise<ForgotPassData | ServerError>} - A promise that resolves with the password reset data
   * or an error if the operation fails. The promise will resolve with either ForgotPassData on success
   * or ServerError on failure.
   * @throws {ServerError} Throws an error if the response from the server indicates a failure.
   * @async
   */
  async forgotPassword(email: string): Promise<ForgotPassData | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(`${apiUrl}/api/${app}/auth/forgot`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      method: 'POST',
    })

    const data = responseFormatter(res) as ForgotPassData

    return data
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
   * @returns {Promise<ForgotPassCheckCodeData|ServerError>} A promise that resolves to the result of the verification process.
   *  If successful, it returns an object containing data related to the password recovery process.
   *  If an error occurs, it returns an object representing the server error.
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
  async forgotPasswordCheckCode({
    requestId,
    code,
  }: {
    requestId: string
    code: string
  }): Promise<ForgotPassCheckCodeData | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/auth/forgot/${requestId}`,
      {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        method: 'POST',
      },
    )

    const data = responseFormatter(res) as ForgotPassCheckCodeData

    return data
  }

  /**
   * Handles the password change process for a user who has forgotten their password.
   * This method verifies that the new passwords match and makes an API request to change the password.
   *
   * @param {Object} params - An object containing the necessary parameters.
   * @param {string} params.requestId - The request ID associated with the password reset request.
   * @param {string} params.newPassword - The new password to be set.
   * @param {string} params.newPasswordRepeat - The new password repeated for verification.
   * @returns {Promise<UserData|ServerError>} A promise that resolves to the user data on successful password change
   * or throws an error if the passwords do not match or if the server responds with an error.
   * @throws {ValidationError} Throws ValidationError if the new passwords do not match.
   * @async
   */
  async forgotPasswordChange({
    requestId,
    newPassword,
    newPasswordRepeat,
  }: {
    requestId: string
    newPassword: string
    newPasswordRepeat: string
  }): Promise<UserData | ServerError> {
    if (newPassword !== newPasswordRepeat)
      throw new ValidationError('Passwords is not match')

    const { apiUrl, app } = this.applicationOptions.getOptions()

    const res = await apiRequest(
      `${apiUrl}/api/${app}/auth/forgot/${requestId}`,
      {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword1: newPassword,
          newPassword2: newPasswordRepeat,
        }),
        method: 'PUT',
      },
    )

    const data = responseFormatter(res) as UserData

    return data
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

    try {
      // Construct OAuth URL with proper parameter handling
      const oauthUrl = new URL(`/api/${app}/oauth/${provider}`, apiUrl)
      oauthUrl.searchParams.set('redirectUrl', redirectUrl)

      // Use native fetch to handle redirect response
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
        throw new ServerError('OAuth redirect URL not found in response')
      }

      // If not a redirect, it might be an error response
      if (!response.ok) {
        const errorData = await response.json()
        throw new ServerError(errorData.error || 'OAuth initialization failed')
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
  async exchangeOAuthToken(secret: string): Promise<UserData | ServerError> {
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

    return data
  }
}

export { Auth }
