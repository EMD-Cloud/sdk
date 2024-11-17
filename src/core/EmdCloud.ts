import { ValidationError } from 'src/errors/ValidationError'
import { EmdCloudOptions } from 'src/types/common'

class EmdCloud {
  private options: EmdCloudOptions

  /**
   * Constructs an instance of the cloud service with the specified options.
   *
   * @param {EmdCloudOptions} options - Configuration options for the cloud service.
   * @throws {ValidationError} If the required options, such as `appId` or `token`, are not provided.
   */

  constructor(options: EmdCloudOptions) {
    if (!options.appId) {
      throw new ValidationError('The "appId" option is required.')
    }

    if (!options.token) {
      throw new ValidationError('The "token" option is required.')
    }

    this.options = options
  }
}

export { EmdCloud }
