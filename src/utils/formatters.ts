import { ServerError } from 'src/errors/ServerError'
import { ResponseError, ResponseData } from 'src/types/fetch'
import { UserData, ForgotPassData, ForgotPassCheckCodeData } from 'src/types/user'

export function userResponseFormatter(
  res: ResponseData | ResponseError
): UserData {
  if (!res.success) throw new ServerError(res.error)

  return res.data as UserData
}

export function forgotPassResponseFormatter(
  res: ResponseData | ResponseError
): ForgotPassData {
  if (!res.success) throw new ServerError(res.error)

  return res.data as ForgotPassData
}

export function forgotPassCheckCodeResponseFormatter(
  res: ResponseData | ResponseError
): ForgotPassCheckCodeData {
  if (!res.success) throw new ServerError(res.error)

  return res.data as ForgotPassCheckCodeData
}
