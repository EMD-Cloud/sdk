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

Dillinger uses a number of open source projects to work properly:

- [Databases](#) - Working with a database service (storing, retrieving, recording, deleting data).
- [Workflows](#) - Working with script services (retrieving information, starting, stopping scripts).
- [Webhooks](#) - Working with the Webhook Service.