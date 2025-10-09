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

export interface ResponseSingleUnit {
  success: true
  data: string | number
}

export type Response = ResponseData | ResponseList | ResponseSingleUnit
