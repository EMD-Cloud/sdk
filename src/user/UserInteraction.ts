import { BaseModule } from 'src/core/BaseModule'
import { ValidationError } from 'src/errors/ValidationError'
import { ServerError } from 'src/errors/ServerError'
import type {
  UserData,
  SocialAttachResponse,
  UserListOptions,
  UserListResponse,
  AuthUserResponse,
  SocialAttachRawResponse,
  SimpleSuccessResponse,
  UserListRawResponse,
} from 'src/types/user'
import { SocialProvider } from '../types'
import type { CallOptions } from 'src/types/common'

class UserInteraction extends BaseModule {
  /**
   * Initiates the process to attach a social network account to the current user.
   *
   * This method generates an authorization URL for the specified social provider
   * (Steam, VK, or Twitch) that the user should be redirected to in order to
   * grant permission to link their social account.
   *
   * @param {Object} params - The social account attachment parameters.
   * @param {SocialProvider} params.provider - The social provider to attach ('steam', 'vk', or 'twitch').
   * @param {string} params.redirectUrl - The URL to redirect back to after authorization.
   * @param {CallOptions} callOptions - Additional options for the API call.
   * @returns {Promise<SocialAttachResponse|ServerError>} A promise that resolves with the authorization URL
   *                                                       or a server error if the request fails.
   * @throws {ValidationError} Throws an error if the provider is not supported.
   * @async
   *
   * @example
   * // Attach a Steam account
   * const response = await emdCloud.user.attachSocialAccount({
   *   provider: SocialProvider.STEAM,
   *   redirectUrl: 'https://myapp.com/profile'
   * });
   * // Redirect user to response.url
   * window.location.href = response.url;
   */
  async attachSocialAccount(
    params: { provider: SocialProvider; redirectUrl: string },
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<SocialAttachRawResponse | ServerError>
  async attachSocialAccount(
    params: { provider: SocialProvider; redirectUrl: string },
    callOptions?: CallOptions,
  ): Promise<SocialAttachResponse | ServerError>
  async attachSocialAccount(
    params: { provider: SocialProvider; redirectUrl: string },
    callOptions: CallOptions = {},
  ): Promise<SocialAttachRawResponse | SocialAttachResponse | ServerError> {
    const { provider, redirectUrl } = params
    const { apiUrl, app } = this.applicationOptions.getOptions()

    if (!Object.values(SocialProvider).includes(provider)) {
      throw new ValidationError(`Unsupported social provider: ${provider}`)
    }

    const authenticationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    const attachUrl = new URL(`/api/${app}/user/attach/${provider}`, apiUrl)
    attachUrl.searchParams.set('redirectUrl', redirectUrl)

    return this.request<SocialAttachRawResponse>(
      attachUrl.toString(),
      {
        method: 'GET',
        headers: { ...authenticationHeader },
      },
      callOptions,
    )
  }

  /**
   * Detaches a social network account from the current user.
   *
   * This method removes the connection between the user's account and the specified
   * social provider (Steam, VK, or Twitch).
   *
   * @param {SocialProvider} provider - The social provider to detach ('steam', 'vk', or 'twitch').
   * @param {CallOptions} callOptions - Additional options for the API call.
   * @returns {Promise<{success: boolean}|ServerError>} A promise that resolves with success status
   *                                                     or a server error if the request fails.
   * @throws {ValidationError} Throws an error if the provider is not supported.
   * @async
   *
   * @example
   * // Detach Steam account
   * const result = await emdCloud.user.detachSocialAccount(SocialProvider.STEAM);
   * if (result.success) {
   *   console.log('Steam account detached successfully');
   * }
   */
  async detachSocialAccount(
    provider: SocialProvider,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<SimpleSuccessResponse | ServerError>
  async detachSocialAccount(
    provider: SocialProvider,
    callOptions?: CallOptions,
  ): Promise<{ success: boolean } | ServerError>
  async detachSocialAccount(
    provider: SocialProvider,
    callOptions: CallOptions = {},
  ): Promise<SimpleSuccessResponse | { success: boolean } | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    if (!Object.values(SocialProvider).includes(provider)) {
      throw new ValidationError(`Unsupported social provider: ${provider}`)
    }

    const authenticationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    return this.request<SimpleSuccessResponse>(
      `${apiUrl}/api/${app}/user/unattach/${provider}`,
      {
        method: 'DELETE',
        headers: { ...authenticationHeader },
      },
      callOptions,
    )
  }

  /**
   * Updates the current user's last activity timestamp (ping).
   *
   * This method can be used to track user presence and activity. It updates the
   * user's `ping` field with the current timestamp and can be used to determine
   * if a user is online or their last seen time.
   *
   * @param {CallOptions} callOptions - Additional options for the API call.
   * @returns {Promise<{success: boolean}|ServerError>} A promise that resolves with success status
   *                                                     or a server error if the request fails.
   * @async
   *
   * @example
   * // Update user activity
   * const result = await emdCloud.user.ping();
   * if (result.success) {
   *   console.log('User activity updated');
   * }
   *
   * @example
   * // Ping user every 30 seconds to maintain online status
   * setInterval(async () => {
   *   await emdCloud.user.ping();
   * }, 30000);
   */
  async ping(
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<SimpleSuccessResponse | ServerError>
  async ping(
    callOptions?: CallOptions,
  ): Promise<{ success: boolean } | ServerError>
  async ping(
    callOptions: CallOptions = {},
  ): Promise<SimpleSuccessResponse | { success: boolean } | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authenticationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    return this.request<SimpleSuccessResponse>(
      `${apiUrl}/api/${app}/user/ping`,
      {
        method: 'POST',
        headers: { ...authenticationHeader },
        body: null,
      },
      callOptions,
    )
  }

  /**
   * Retrieves a paginated list of users in the application.
   *
   * This method is typically available only to staff members with appropriate permissions.
   * It allows searching, filtering, sorting, and paginating through the user base.
   *
   * @param {UserListOptions} [options] - Optional parameters for filtering and pagination.
   * @param {string} [options.search] - Search term to filter users by name or login.
   * @param {number} [options.limit=50] - Maximum number of users to return per page.
   * @param {number} [options.page=0] - Page number for pagination (0-indexed).
   * @param {string} [options.orderBy='createdAt'] - Field to sort by.
   * @param {'ASC'|'DESC'} [options.sort='DESC'] - Sort direction.
   * @param {AccountStatus|null} [options.accountStatus] - Filter by account status.
   * @param {CallOptions} callOptions - Additional options for the API call.
   * @returns {Promise<UserListResponse|ServerError>} A promise that resolves with the list of users
   *                                                   and total count, or a server error if the request fails.
   * @async
   *
   * @example
   * // Get first page of users
   * const users = await emdCloud.user.getUserList({
   *   limit: 20,
   *   page: 0,
   *   orderBy: 'createdAt',
   *   sort: 'DESC'
   * });
   * console.log(`Found ${users.total} users`, users.data);
   *
   * @example
   * // Search for specific users
   * const searchResults = await emdCloud.user.getUserList({
   *   search: 'john',
   *   limit: 10
   * });
   *
   * @example
   * // Filter by account status
   * const approvedUsers = await emdCloud.user.getUserList({
   *   accountStatus: AccountStatus.Approved
   * });
   */
  async getUserList(
    options: UserListOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<UserListRawResponse | ServerError>
  async getUserList(
    options?: UserListOptions,
    callOptions?: CallOptions,
  ): Promise<UserListResponse | ServerError>
  async getUserList(
    options: UserListOptions = {},
    callOptions: CallOptions = {},
  ): Promise<UserListRawResponse | UserListResponse | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authenticationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    const { search, limit, page, orderBy, sort, accountStatus } = options

    const queryParams = new URLSearchParams()
    if (search !== undefined) queryParams.set('search', search)
    if (limit !== undefined) queryParams.set('limit', limit.toString())
    if (page !== undefined) queryParams.set('page', page.toString())
    if (orderBy !== undefined) queryParams.set('orderBy', orderBy)
    if (sort !== undefined) queryParams.set('sort', sort)
    if (accountStatus !== undefined && accountStatus !== null)
      queryParams.set('accountStatus', accountStatus)

    return this.request<UserListRawResponse>(
      `${apiUrl}/api/${app}/user/list?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: { ...authenticationHeader },
      },
      callOptions,
    )
  }

  /**
   * Retrieves detailed information about a specific user by their ID.
   *
   * This method is typically available only to staff members with appropriate permissions,
   * or to users requesting their own information. Encrypted fields may be hidden depending
   * on permissions.
   *
   * @param {string} userId - The unique identifier (_id) of the user to retrieve.
   * @param {CallOptions} callOptions - Additional options for the API call.
   * @returns {Promise<UserData|ServerError>} A promise that resolves with the user's detailed data
   *                                          or a server error if the request fails.
   * @async
   *
   * @example
   * // Get details of a specific user
   * const user = await emdCloud.user.getUserDetails('507f1f77bcf86cd799439011');
   * console.log('User details:', user);
   *
   * @example
   * // Get current user's own details
   * const currentUser = await emdCloud.auth.authorization();
   * if (currentUser && currentUser._id) {
   *   const fullDetails = await emdCloud.user.getUserDetails(currentUser._id);
   *   console.log('My full details:', fullDetails);
   * }
   */
  async getUserDetails(
    userId: string,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<AuthUserResponse | ServerError>
  async getUserDetails(
    userId: string,
    callOptions?: CallOptions,
  ): Promise<UserData | ServerError>
  async getUserDetails(
    userId: string,
    callOptions: CallOptions = {},
  ): Promise<AuthUserResponse | UserData | ServerError> {
    if (!userId) {
      throw new ValidationError('User ID is required')
    }

    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authenticationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    return this.request<AuthUserResponse>(
      `${apiUrl}/api/${app}/user/${userId}`,
      {
        method: 'GET',
        headers: { ...authenticationHeader },
      },
      callOptions,
    )
  }
}

export { UserInteraction }
