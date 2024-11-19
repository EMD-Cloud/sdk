export class NotAllowedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EmdCloudNotAllowedError'
  }
}
