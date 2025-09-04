import AppOptions from './AppOptions';
import { ValidationError } from 'src/errors/ValidationError';
import { AppEnvironment } from 'src/types/common';
import { Auth } from 'src/user';
import { Webhook } from 'src/webhook';
class EmdCloud {
    /**
     * Constructs an instance of the API SDK with the specified options.
     *
     * @param {AppOptionsType} opts - Configuration options for the cloud service. Must include:
     * - `environment`: The environment where the application is running.
     *   Should be one of `AppEnvironment.Client` or `AppEnvironment.Server`.
     * - `appId`: The unique identifier for the application.
     * - `apiUrl?`: Optional API URL. Defaults to `https://api.emd.one`.
     * - `authSchema?`: Optional authentication schema. Defaults to `token`.
     * - `token?`: Optional authentication token required for server environment.
     *
     * @throws {ValidationError} If the 'environment', 'appId', or 'token' (when environment is Server) is not provided.
     *
     * @example
     * const apiEmdCloud = new EmdCloud({
     *   environment: AppEnvironment.Server,
     *   appId: 'myAppId',
     *   apiToken: 'myAuthToken'
     * });
     */
    constructor(opts) {
        const applicationOptions = new AppOptions(opts);
        if (!opts.environment) {
            throw new ValidationError('The "environment" option is required.');
        }
        if (!opts.appId) {
            throw new ValidationError('The "app" option is required.');
        }
        if (opts.environment === AppEnvironment.Server && !opts.apiToken) {
            throw new ValidationError('The "apiToken" option is required.');
        }
        this.auth = new Auth(applicationOptions);
        this.webhook = new Webhook(applicationOptions);
        this.setAuthToken = applicationOptions.setAuthToken;
    }
}
export { EmdCloud };
