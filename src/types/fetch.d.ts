export interface ResponseError {
  success: false
  code: number
  error: string
}

export interface ResponseData {
  success: true
  data: Record<string, any>
}

export interface ResponseList {
  success: true
  data: Record<string, any>[]
  count: number
}

export type Response = ResponseData | ResponseList
