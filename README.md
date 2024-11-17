# EMD Cloud / SDK

> Use the capabilities of the EMD Cloud platform in your node.js application.

## How to use

1. Install npm or yarn package:

```sh
npm install @emd-cloud/sdk
yarn install @emd-cloud/sdk
```

2. Register on the EMD Cloud platform and create an application via the link - https://console.cloud.emd.one

3. Get the API token of your application.

4. Invoke the EmdCloud class in your application:

```javascript
import { EmdCloud } from '@emd-cloud/sdk';

const emdCloud = new EmdCloud({
    appId: '<your-app-id>',
    token: '<your-token>'
});
```

Done! The SDK is ready for use.

## Documentation

We offer you a list of possibilities for using our SDK.

- [Database](#) - Working with a Database service.
- [Workflow](#) - Working with a Workflow service.
- [Webhook](#) - Working with a Webhook service.