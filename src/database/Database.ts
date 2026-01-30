import AppOptions from 'src/core/AppOptions'
import { BaseModule } from 'src/core/BaseModule'
import { NotAllowedError } from 'src/errors/NotAllowedError'
import { ServerError } from 'src/errors/ServerError'
import { ValidationError } from 'src/errors/ValidationError'
import type { CallOptions } from 'src/types/common'
import type {
  DatabaseListOptions,
  DatabaseCountOptions,
  DatabaseCreateOptions,
  DatabaseUpdateOptions,
  DatabaseBulkUpdatePayload,
  DatabaseGetRowOptions,
  DatabaseRowResponse,
  DatabaseRowsResponse,
  DatabaseCountResponse,
  DatabaseBulkResponse,
  DatabaseDeleteResponse,
  DatabaseTriggerResponse,
} from 'src/types/database'

class Database extends BaseModule {
  private readonly collectionId: string

  constructor(applicationOptions: AppOptions, collectionId: string) {
    super(applicationOptions)
    this.collectionId = collectionId
  }

  /**
   * Retrieves rows from the database collection with optional filtering, sorting, and pagination.
   *
   * @param {DatabaseListOptions} options - Options for retrieving rows including query, sort, pagination
   * @param {CallOptions} callOptions - Additional options for the API call including authentication type
   * @returns {Promise<DatabaseRowsResponse | ServerError>} A promise that resolves to the rows data or error
   * @example
   * const result = await database.getRows(
   *   {
   *     query: { "$and": [{ "data.status": { "$eq": "active" } }] },
   *     limit: 20,
   *     page: 0,
   *     sort: [{ column: "createdAt", sort: "desc" }]
   *   },
   *   { authType: 'auth-token' }
   * );
   */
  async getRows<T = Record<string, any>>(
    options: DatabaseListOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseRowsResponse<T> | ServerError>
  async getRows<T = Record<string, any>>(
    options?: DatabaseListOptions,
    callOptions?: CallOptions,
  ): Promise<DatabaseRowsResponse<T>['data'] | ServerError>
  async getRows<T = Record<string, any>>(
    options: DatabaseListOptions = {},
    callOptions: CallOptions = {},
  ): Promise<DatabaseRowsResponse<T> | DatabaseRowsResponse<T>['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    let authorizationHeader: Record<string, string> = {}

    try {
      authorizationHeader = this.applicationOptions.getAuthorizationHeader(
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
      search,
      limit,
      page,
      orderBy,
      sort,
      query,
      hasOptimiseResponse,
      useHumanReadableNames,
    } = options

    const payload: Record<string, any> = {}
    if (search !== undefined) payload.search = search
    if (limit !== undefined) payload.limit = limit
    if (page !== undefined) payload.page = page
    if (orderBy !== undefined) payload.orderBy = orderBy
    if (sort !== undefined) payload.sort = sort
    if (query !== undefined) payload.query = query
    if (hasOptimiseResponse !== undefined)
      payload.hasOptimiseResponse = hasOptimiseResponse
    if (useHumanReadableNames !== undefined)
      payload.useHumanReadableNames = useHumanReadableNames

    return this.request<DatabaseRowsResponse<T>>(
      `${apiUrl}/api/${app}/database/${this.collectionId}/row`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authorizationHeader,
        },
        body: JSON.stringify(payload),
      },
      callOptions,
    )
  }

  /**
   * Gets the total count of rows matching the specified query.
   *
   * @param {DatabaseCountOptions} options - Options for counting rows including query and search
   * @param {CallOptions} callOptions - Additional options for the API call including authentication type
   * @returns {Promise<DatabaseCountResponse | ServerError>} A promise that resolves to the count or error
   * @example
   * const result = await database.countRows(
   *   { query: { "$and": [{ "data.status": { "$eq": "active" } }] } },
   *   { authType: 'auth-token' }
   * );
   */
  async countRows(
    options: DatabaseCountOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseCountResponse | ServerError>
  async countRows(
    options?: DatabaseCountOptions,
    callOptions?: CallOptions,
  ): Promise<DatabaseCountResponse['data'] | ServerError>
  async countRows(
    options: DatabaseCountOptions = {},
    callOptions: CallOptions = {},
  ): Promise<DatabaseCountResponse | DatabaseCountResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    let authorizationHeader: Record<string, string> = {}

    try {
      authorizationHeader = this.applicationOptions.getAuthorizationHeader(
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

    const { search, query, createdAt } = options

    const payload: Record<string, any> = {}
    if (search !== undefined) payload.search = search
    if (query !== undefined) payload.query = query
    if (createdAt !== undefined) payload.createdAt = createdAt

    return this.request<DatabaseCountResponse>(
      `${apiUrl}/api/${app}/database/${this.collectionId}/row/count`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authorizationHeader,
        },
        body: JSON.stringify(payload),
      },
      callOptions,
    )
  }

  /**
   * Retrieves a single row by its ID.
   *
   * @param {string} rowId - The ID of the row to retrieve
   * @param {DatabaseGetRowOptions} options - Options for retrieving the row
   * @param {CallOptions} callOptions - Additional options for the API call including authentication type
   * @returns {Promise<DatabaseRowResponse | ServerError>} A promise that resolves to the row data or error
   * @example
   * const result = await database.getRow(
   *   '60a7c8b8f123456789abcdef',
   *   { useHumanReadableNames: true },
   *   { authType: 'auth-token' }
   * );
   */
  async getRow<T = Record<string, any>>(
    rowId: string,
    options: DatabaseGetRowOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseRowResponse<T> | ServerError>
  async getRow<T = Record<string, any>>(
    rowId: string,
    options?: DatabaseGetRowOptions,
    callOptions?: CallOptions,
  ): Promise<DatabaseRowResponse<T>['data'] | ServerError>
  async getRow<T = Record<string, any>>(
    rowId: string,
    options: DatabaseGetRowOptions = {},
    callOptions: CallOptions = {},
  ): Promise<DatabaseRowResponse<T> | DatabaseRowResponse<T>['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    let authorizationHeader: Record<string, string> = {}

    try {
      authorizationHeader = this.applicationOptions.getAuthorizationHeader(
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

    const { useHumanReadableNames = false } = options

    const queryParams = useHumanReadableNames
      ? `?useHumanReadableNames=${useHumanReadableNames}`
      : ''

    return this.request<DatabaseRowResponse<T>>(
      `${apiUrl}/api/${app}/database/${this.collectionId}/row/${rowId}${queryParams}`,
      {
        method: 'GET',
        headers: {
          ...authorizationHeader,
        },
      },
      callOptions,
    )
  }

  /**
   * Creates a new row in the database collection.
   *
   * @param {Record<string, any>} rowData - The data for the new row
   * @param {DatabaseCreateOptions} options - Additional options for creating the row
   * @param {CallOptions} callOptions - Additional options for the API call including authentication type
   * @returns {Promise<DatabaseRowResponse | ServerError>} A promise that resolves to the created row or error
   * @example
   * const result = await database.createRow(
   *   { title: 'New Task', status: 'pending' },
   *   { notice: 'Created via API' },
   *   { authType: 'auth-token' }
   * );
   */
  async createRow<T = Record<string, any>>(
    rowData: Record<string, any>,
    options: DatabaseCreateOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseRowResponse<T> | ServerError>
  async createRow<T = Record<string, any>>(
    rowData: Record<string, any>,
    options?: DatabaseCreateOptions,
    callOptions?: CallOptions,
  ): Promise<DatabaseRowResponse<T>['data'] | ServerError>
  async createRow<T = Record<string, any>>(
    rowData: Record<string, any>,
    options: DatabaseCreateOptions = {},
    callOptions: CallOptions = {},
  ): Promise<DatabaseRowResponse<T> | DatabaseRowResponse<T>['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authorizationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    const { user, notice, useHumanReadableNames } = options

    const payload: Record<string, any> = {
      data: rowData,
    }
    if (user !== undefined) payload.user = user
    if (notice !== undefined) payload.notice = notice
    if (useHumanReadableNames !== undefined)
      payload.useHumanReadableNames = useHumanReadableNames

    return this.request<DatabaseRowResponse<T>>(
      `${apiUrl}/api/${app}/database/${this.collectionId}/row`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authorizationHeader,
        },
        body: JSON.stringify(payload),
      },
      callOptions,
    )
  }

  /**
   * Updates an existing row in the database collection.
   *
   * @param {string} rowId - The ID of the row to update
   * @param {Record<string, any>} rowData - The data to update
   * @param {DatabaseUpdateOptions} options - Additional options for updating the row
   * @param {CallOptions} callOptions - Additional options for the API call including authentication type
   * @returns {Promise<DatabaseRowResponse | ServerError>} A promise that resolves to the updated row or error
   * @example
   * const result = await database.updateRow(
   *   '60a7c8b8f123456789abcdef',
   *   { status: 'completed' },
   *   { notice: 'Updated via API' },
   *   { authType: 'auth-token' }
   * );
   */
  async updateRow<T = Record<string, any>>(
    rowId: string,
    rowData: Record<string, any>,
    options: DatabaseUpdateOptions,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseRowResponse<T> | ServerError>
  async updateRow<T = Record<string, any>>(
    rowId: string,
    rowData: Record<string, any>,
    options?: DatabaseUpdateOptions,
    callOptions?: CallOptions,
  ): Promise<DatabaseRowResponse<T>['data'] | ServerError>
  async updateRow<T = Record<string, any>>(
    rowId: string,
    rowData: Record<string, any>,
    options: DatabaseUpdateOptions = {},
    callOptions: CallOptions = {},
  ): Promise<DatabaseRowResponse<T> | DatabaseRowResponse<T>['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authorizationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    const { user, notice, saveMode, useHumanReadableNames } = options

    const payload: Record<string, any> = {
      _id: rowId,
      data: rowData,
    }
    if (user !== undefined) payload.user = user
    if (notice !== undefined) payload.notice = notice
    if (saveMode !== undefined) payload.saveMode = saveMode
    if (useHumanReadableNames !== undefined)
      payload.useHumanReadableNames = useHumanReadableNames

    return this.request<DatabaseRowResponse<T>>(
      `${apiUrl}/api/${app}/database/${this.collectionId}/row`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authorizationHeader,
        },
        body: JSON.stringify(payload),
      },
      callOptions,
    )
  }

  /**
   * Updates multiple rows matching the specified query.
   *
   * @param {DatabaseBulkUpdatePayload} payload - The bulk update payload containing query, data, and notice
   * @param {CallOptions} callOptions - Additional options for the API call including authentication type
   * @returns {Promise<DatabaseBulkResponse | ServerError>} A promise that resolves to the bulk update result or error
   * @example
   * const result = await database.bulkUpdate(
   *   {
   *     query: { "$and": [{ "data.status": { "$eq": "pending" } }] },
   *     data: { "status": "in-progress" },
   *     notice: "Bulk status update"
   *   },
   *   { authType: 'auth-token' }
   * );
   */
  async bulkUpdate(
    payload: DatabaseBulkUpdatePayload,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseBulkResponse | ServerError>
  async bulkUpdate(
    payload: DatabaseBulkUpdatePayload,
    callOptions?: CallOptions,
  ): Promise<DatabaseBulkResponse['data'] | ServerError>
  async bulkUpdate(
    payload: DatabaseBulkUpdatePayload,
    callOptions: CallOptions = {},
  ): Promise<DatabaseBulkResponse | DatabaseBulkResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authorizationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    return this.request<DatabaseBulkResponse>(
      `${apiUrl}/api/${app}/database/${this.collectionId}/row/bulk`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authorizationHeader,
        },
        body: JSON.stringify(payload),
      },
      callOptions,
    )
  }

  /**
   * Deletes a single row by its ID.
   *
   * @param {string} rowId - The ID of the row to delete
   * @param {CallOptions} callOptions - Additional options for the API call including authentication type
   * @returns {Promise<DatabaseDeleteResponse | ServerError>} A promise that resolves to the delete result or error
   * @example
   * const result = await database.deleteRow('60a7c8b8f123456789abcdef', { authType: 'auth-token' });
   */
  async deleteRow(
    rowId: string,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseDeleteResponse | ServerError>
  async deleteRow(
    rowId: string,
    callOptions?: CallOptions,
  ): Promise<DatabaseDeleteResponse['data'] | ServerError>
  async deleteRow(
    rowId: string,
    callOptions: CallOptions = {},
  ): Promise<DatabaseDeleteResponse | DatabaseDeleteResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authorizationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    const payload = {
      _id: rowId,
    }

    return this.request<DatabaseDeleteResponse>(
      `${apiUrl}/api/${app}/database/${this.collectionId}/row`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authorizationHeader,
        },
        body: JSON.stringify(payload),
      },
      callOptions,
    )
  }

  /**
   * Deletes multiple rows by their IDs.
   *
   * @param {string[]} rowIds - Array of row IDs to delete
   * @param {CallOptions} callOptions - Additional options for the API call including authentication type
   * @returns {Promise<DatabaseDeleteResponse | ServerError>} A promise that resolves to the delete result or error
   * @example
   * const result = await database.deleteRows(
   *   ['60a7c8b8f123456789abcdef', '60a7c8b8f123456789abcdeg'],
   *   { authType: 'auth-token' }
   * );
   */
  async deleteRows(
    rowIds: string[],
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseDeleteResponse | ServerError>
  async deleteRows(
    rowIds: string[],
    callOptions?: CallOptions,
  ): Promise<DatabaseDeleteResponse['data'] | ServerError>
  async deleteRows(
    rowIds: string[],
    callOptions: CallOptions = {},
  ): Promise<DatabaseDeleteResponse | DatabaseDeleteResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authorizationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    const payload = {
      _ids: rowIds,
    }

    return this.request<DatabaseDeleteResponse>(
      `${apiUrl}/api/${app}/database/${this.collectionId}/row/many`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authorizationHeader,
        },
        body: JSON.stringify(payload),
      },
      callOptions,
    )
  }

  /**
   * Triggers a button action on a specific row.
   *
   * @param {string} rowId - The ID of the row containing the button
   * @param {string} columnId - The ID of the column containing the button
   * @param {CallOptions} callOptions - Additional options for the API call including authentication type
   * @returns {Promise<DatabaseTriggerResponse | ServerError>} A promise that resolves to the trigger result or error
   * @example
   * const result = await database.triggerButton(
   *   '60a7c8b8f123456789abcdef',
   *   'approve-button-column-id',
   *   { authType: 'auth-token' }
   * );
   */
  async triggerButton(
    rowId: string,
    columnId: string,
    callOptions: CallOptions & { ignoreFormatResponse: true },
  ): Promise<DatabaseTriggerResponse | ServerError>
  async triggerButton(
    rowId: string,
    columnId: string,
    callOptions?: CallOptions,
  ): Promise<DatabaseTriggerResponse['data'] | ServerError>
  async triggerButton(
    rowId: string,
    columnId: string,
    callOptions: CallOptions = {},
  ): Promise<DatabaseTriggerResponse | DatabaseTriggerResponse['data'] | ServerError> {
    const { apiUrl, app } = this.applicationOptions.getOptions()

    const authorizationHeader = this.applicationOptions.getAuthorizationHeader(
      callOptions.authType,
    )

    const payload = {
      columnId,
    }

    return this.request<DatabaseTriggerResponse>(
      `${apiUrl}/api/${app}/database/${this.collectionId}/row/${rowId}/button`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authorizationHeader,
        },
        body: JSON.stringify(payload),
      },
      callOptions,
    )
  }
}

export { Database }
