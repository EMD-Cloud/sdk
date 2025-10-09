export type WebhookData = Record<string, any>

export interface WebhookResponse {
  success: true
  data: WebhookData
}
