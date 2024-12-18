export enum AccountStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected'
}

export enum PingStatus {
  Online = 'online',
  Offline = 'offline'
}

export interface UserData {
  _id: string
  space: string
  login: string
  accountVerified: boolean
  accountStatus: AccountStatus
  searchableName: string
  external: boolean
  firstName: string
  lastName: string
  patronymicName: string
  avatarUrl: string
  level: number
  points: number
  quotaFreeSpaces: number
  passwordRecoveryRequest: string | null
  ping: string | null
  linkedAccounts: Record<string, any>
  customFields: Record<string, any>
  lastActivityInMinutes: null | number
  pingStatus: PingStatus
  token: string
}

export interface ForgotPassData {
  requestId: string
}

export enum RequestStatus {
  Open = 'open'
}

export interface ForgotPassCheckCodeData {
  _id: string
  requestStatus: RequestStatus
}
