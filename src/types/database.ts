export interface DatabaseRowData<T = Record<string, any>> {
  _id?: string
  data: T
  user?: string
  notice?: string
  createdAt?: string
  updatedAt?: string
}

export interface DatabaseQuery {
  $or?: Record<string, any>[]
  $and?: Record<string, any>[]
  [key: string]: any
}

export interface DatabaseSort {
  column: string
  sort: 'asc' | 'desc'
}

export interface DatabaseListOptions {
  search?: string
  limit?: number
  page?: number
  orderBy?: string
  sort?: DatabaseSort[]
  query?: DatabaseQuery
  hasOptimiseResponse?: boolean
  useHumanReadableNames?: boolean
  createdAt?: string
}

export interface DatabaseGetRowOptions {
  useHumanReadableNames?: boolean
}

export interface DatabaseCountOptions {
  search?: string
  query?: DatabaseQuery
  createdAt?: string
}

export enum DatabaseSaveMode {
  SYNC = 'SYNC',
  ASYNC = 'ASYNC',
}

export interface DatabaseCreateOptions {
  user?: string
  notice?: string
  useHumanReadableNames?: boolean
}

export interface DatabaseUpdateOptions {
  notice?: string
  user?: string
  saveMode?: DatabaseSaveMode
  useHumanReadableNames?: boolean
}

export interface DatabaseBulkUpdatePayload {
  query: DatabaseQuery
  data: Record<string, any>
  notice: string
}

export interface DatabaseRowResponse<T = Record<string, any>> {
  success: true
  data: DatabaseRowData<T>
}

export interface DatabaseRowsResponse<T = Record<string, any>> {
  success: true
  data: DatabaseRowData<T>[]
  count: number
}

export interface DatabaseCountResponse {
  success: true
  data: {
    count: number
  }
}

export interface DatabaseBulkResponse {
  success: true
  data: {
    modifiedCount: number
    matchedCount: number
  }
}

export interface DatabaseDeleteResponse {
  success: true
  data: {
    deletedCount: number
  }
}

export interface DatabaseTriggerResponse {
  success: true
  data: Record<string, any>
}
