
# EMD Cloud / SDK

-   [Overview](#overview)
-   [Get started](#get-started)
-   [Usage](#usage)
	-   [Creating an instance](#creating-an-instance)
	-   [Parameters](#parameters)
-   [Methods](#methods)
	-   [Basic methods](#basic-methods)
		-   [Method: setAuthToken](#method--setauthtoken)
	-   [Auth methods](#auth-methods)
		-   [Method: auth.authorization](#method--authauthorization)
		-   [Method: auth.login](#method--authlogin)
		-   [Method: auth.socialLogin](#method--authsociallogin)
		-   [Method: auth.exchangeOAuthToken](#method--authexchangeoauthtoken)
		-   [Method: auth.registration](#method--authregistration)
		-   [Method: auth.forgotPassword](#method--authforgotpassword)
		-   [Method: auth.forgotPasswordCheckCode](#method--authforgotpasswordcheckcode)
		-   [Method: auth.forgotPasswordChange](#method--authforgotpasswordchange)
		-   [Method: auth.updateUser](#method--authupdateuser)
	-   [User Interaction methods](#user-interaction-methods)
		-   [Method: user.attachSocialAccount](#method--userattachsocialaccount)
		-   [Method: user.detachSocialAccount](#method--userdetachsocialaccount)
		-   [Method: user.ping](#method--userping)
		-   [Method: user.getUserList](#method--usergetuserlist)
		-   [Method: user.getUserDetails](#method--usergetuserdetails)
	-   [Uploader methods](#uploader-methods)
		-   [Method: uploader.uploadFile](#method--uploaderuploadfile)
		-   [Method: uploader.getFileUrl](#method--uploadergetfileurl)
		-   [Method: uploader.getMetaUrl](#method--uploadergetmetaurl)
	-   [Webhook methods](#webhook-methods)
		-   [Method: webhook.call](#method--webhookcall)
	-   [Database methods](#database-methods)
		-   [Creating a database instance](#creating-a-database-instance)
		-   [Method: database.getRows](#method--databasegetrows)
		-   [Method: database.countRows](#method--databasecountrows)
		-   [Method: database.getRow](#method--databasegetrow)
		-   [Method: database.createRow](#method--databasecreaterow)
		-   [Method: database.updateRow](#method--databaseupdaterow)
		-   [Method: database.bulkUpdate](#method--databasebulkupdate)
		-   [Method: database.deleteRow](#method--databasedeleterow)
		-   [Method: database.deleteRows](#method--databasedeleterows)
		-   [Method: database.triggerButton](#method--databasetriggerbutton)
		-   [Typing Relations](#typing-relations)
	-   [Chat methods](#chat-methods)
		-   [Method: chat.listChannels](#method--chatlistchannels)
		-   [Method: chat.createChannelByType](#method--chatcreatechannelbytype)
		-   [Method: chat.upsertChannel](#method--chatupsertchannel)
		-   [Method: chat.getChannel](#method--chatgetchannel)
		-   [Method: chat.deleteChannel](#method--chatdeletechannel)
		-   [Method: chat.sendMessage](#method--chatsendmessage)
		-   [Method: chat.listMessages](#method--chatlistmessages)
		-   [Method: chat.deleteMessage](#method--chatdeletemessage)
		-   [Method: chat.getUnreadCount](#method--chatgetunreadcount)
	-   [Real-time Chat (WebSocket)](#real-time-chat-websocket)
		-   [Creating a WebSocket instance](#creating-a-websocket-instance)
		-   [Method: chatWs.connect](#method--chatwsconnect)
		-   [Method: chatWs.disconnect](#method--chatwsdisconnect)
		-   [Method: chatWs.subscribeToChannel](#method--chatwssubscribetochannel)
		-   [Method: chatWs.unsubscribeFromChannel](#method--chatwsunsubscribefromchannel)
		-   [Method: chatWs.subscribeToSupport](#method--chatwssubscribetosupport)
		-   [Method: chatWs.setCallbacks](#method--chatwssetcallbacks)
		-   [Method: chatWs.getConnectionState](#method--chatwsgetconnectionstate)
		-   [Method: chatWs.getSubscribedChannels](#method--chatwsgetsubscribedchannels)
-   [Conclusion](#conclusion)

## Overview

The EMD Cloud SDK enables applications to interact with the [EMD Cloud](https://cloud.emd.one/) API. This library is designed to manage authentication and the configuration parameters necessary for the effective use of the EMD Cloud service.

## Get started

**Requirements:**
- Node.js v22.0.0 or higher (for native WebSocket support)

**Setup:**

1. Register on the EMD Cloud platform and create an application via the link - https://console.cloud.emd.one
2. Get the API token of your application.
3. Install npm or yarn package:

	**NPM**
	```sh
	npm install @emd-cloud/sdk tus-js-client uuid
	```

	**Yarn**
	```sh
	yarn add @emd-cloud/sdk tus-js-client uuid
	```

	**Note:** `tus-js-client` and `uuid` are peer dependencies required for file upload functionality.

Done! The SDK is ready for use.

## Usage
To use the EMD Cloud SDK, make sure to import it from the appropriate module in your JavaScript code:

```javascript
import { EmdCloud, AuthType, AppEnvironment } from '@emd-cloud/sdk'
```

### Creating an instance

To create an instance of the  `EmdCloud`  class, you need to provide a configuration object containing parameters such as  `environment`,  `appId`, and optionally  `apiUrl`,  `authSchema`, and  `token`. Here’s an example of how to do this:

```javascript
// Server environment example
const emdCloud = new EmdCloud({
	environment: AppEnvironment.Server,
	appId: 'your-app-id',
	apiToken: 'your-api-token',
	defaultAuthType: AuthType.ApiToken // Optional: set default auth type
})

// Client environment example  
const clientSdk = new EmdCloud({
	environment: AppEnvironment.Client,
	appId: 'your-app-id'
	// defaultAuthType automatically set to AuthType.AuthToken for client
})
```

Done! The SDK is ready for use.

### Parameters

The configuration parameters passed to the constructor must include:

-   **environment**  (required): The environment in which the application operates. It can be  `client`  or  `server`.
-   **appId**  (required): A unique identifier for your application.
-   **apiUrl**  (optional): URL for the API endpoint. Defaults to  `https://api.emd.one`.
-   **authSchema**  (optional): The authentication scheme used for connection. Defaults to  `token`.
-   **token**  (optional): An authentication token. Required if the environment is  `server`.

## Methods

### Basic methods:

#### Method:  `setAuthToken`

**Description:**  Sets the authentication token for the instance. The token must be a string.

**Example:**
```javascript
emdCloud.setAuthToken('new-auth-token')
```

<br>
<br>

### Auth methods:

#### Method:  `auth.authorization`

**Description:**  
This method authorizes the user by sending a request to the server to obtain information about the current user. An authentication token must be set.

**Returns:** 
 
Returns a  `Promise`  that resolves to one of the following:

-   user data, including the token.
-   `null` when the stored auth token is valid but no user session exists (for example, when the token was revoked).
-   server error.
-   validation error if the token is missing.

**Notes:**  
If the token is absent, an error will be thrown with the message "Unable auth token".

**Example:**
```javascript
await emdCloud.auth.authorization(); // Returns user data or null when the session is missing
```

<br>

#### Method:  `auth.login`

**Description:**  
This method authenticates the user using their login and password. It sends a POST request to the server to log in the user.

**Parameters:**

-   `login`  (string): the user's login.
-   `password`  (string): the user's password.

**Returns:** 
 
Returns a  `Promise`  that resolves to one of the following:

-   user data, including the token.
-   server error.

**Example:**
```javascript
await emdCloud.auth.login({
	login: 'example@mail.com',
	password: 'myP@55word'
}) // On success, will return user data
```

<br>

#### Method:  `auth.socialLogin`

**Description:**  
This method initiates social login flow for OAuth authentication with VK or Yandex providers. It generates an OAuth authorization URL that the client should redirect the user to for authentication.

**Parameters:**

-   `provider`  (SocialProvider): The social provider to use. Can be `SocialProvider.VK` for VKontakte or `SocialProvider.YANDEX` for Yandex.
-   `redirectUrl`  (string): The URL to redirect back to after OAuth authorization. This should be your application's callback URL.

**Returns:** 

Returns a  `Promise`  that resolves to one of the following:

-   An object containing the OAuth authorization URL (`{ url: string }`).
-   Server error if the OAuth provider is not configured or request fails.

**Notes:**  
- The provider must be imported from the SDK: `import { SocialProvider } from '@emd-cloud/sdk'`
- After receiving the URL, redirect the user to it for authentication
- The OAuth provider will redirect back to your `redirectUrl` with a secret token

**Environment-specific behavior:**
- In `client` environment: Returns the OAuth URL directly. Use `window.location.href = response.url` to navigate.
- In `server` environment: Attempts to fetch and follow the redirect to get the final OAuth provider URL.

**Example:**
```javascript
import { SocialProvider } from '@emd-cloud/sdk'

// Step 1: Initiate OAuth login
const response = await emdCloud.auth.socialLogin({
	provider: SocialProvider.VK, // or SocialProvider.YANDEX
	redirectUrl: 'https://myapp.com/auth/callback'
})

// Step 2: Redirect user to OAuth provider
window.location.href = response.url
```

<br>

#### Method:  `auth.exchangeOAuthToken`

**Description:**  
This method exchanges an OAuth secret token (received from the OAuth callback) for an authentication token and user data. This is the final step in the OAuth authentication flow.

**Parameters:**

-   `secret`  (string): The secret token received from the OAuth callback URL parameters.

**Returns:** 

Returns a  `Promise`  that resolves to one of the following:

-   User data including the authentication token.
-   Server error if the token exchange fails.

**Notes:**  
- The secret token is provided in the callback URL as a query parameter
- Upon successful exchange, the authentication token is automatically set in the SDK instance
- The returned user data contains all user information including profile details

**Complete OAuth Flow Example:**
```javascript
import { SocialProvider } from '@emd-cloud/sdk'

// Step 1: Initiate OAuth login (e.g., when user clicks "Login with VK")
async function startSocialLogin() {
	const response = await emdCloud.auth.socialLogin({
		provider: SocialProvider.VK,
		redirectUrl: 'https://myapp.com/auth/callback'
	})
	
	// Redirect user to VK/Yandex for authentication
	window.location.href = response.url
}

// Step 2: Handle OAuth callback (on your callback page)
async function handleOAuthCallback() {
	// Extract secret from URL parameters
	const urlParams = new URLSearchParams(window.location.search)
	const secret = urlParams.get('secret')
	
	if (secret) {
		try {
			// Exchange secret for authentication token
			const userData = await emdCloud.auth.exchangeOAuthToken(secret)
			console.log('User authenticated:', userData)
			
			// User is now logged in, redirect to dashboard
			window.location.href = '/dashboard'
		} catch (error) {
			console.error('OAuth authentication failed:', error)
		}
	} else {
		// Check for error parameter
		const error = urlParams.get('error')
		if (error) {
			console.error('OAuth error:', error)
		}
	}
}
```

<br>

#### Method:  `auth.registration`

**Description:**  
This method registers a new user by sending data to the server.

**Parameters:**

-   `firstName`  (string, optional): the first name of the user.
-   `lastName`  (string, optional): the last name of the user.
-   `login`  (string): the login for the new account.
-   `password`  (string): the password for the new account.
-   `customFields`  (object, optional): additional custom fields.
-   `captchaToken`  (string, optional): a token used for captcha verification.

**Returns:** 
 
Returns a  `Promise`  that resolves to one of the following:

-   user data, including the token.
-   server error.

**Example:**
```javascript
await emdCloud.auth.registration({
	firstName: 'John',
	lastName: 'Jonathan',
	login: 'example@mail.com',
	password: 'you-password'
}) // On success, will return user data
```

<br>

#### Method:  `auth.forgotPassword`

**Description:**  
This method initiates the password reset process by sending a request to the server with the user's email address.

**Parameters:**

-   `email`  (string): the email address to send the password reset instructions.

**Returns:** 
 
Returns a  `Promise`  that resolves to one of the following:

- information about the password reset process
- server error

**Example:**
```javascript
await emdCloud.auth.forgotPassword('example@mail.com') // On success, will return requestId for code verification request
```

#### Method:  `auth.forgotPasswordCheckCode`

**Description:**  
This method checks the code sent to the user for resetting the password using the request ID.

**Parameters:**

-   `requestId`  (string): the request ID for the password reset.
-   `code`  (string): the code for verification.

**Returns:** 
 
Returns a  `Promise`  that resolves to one of the following:

- the results of code verification.
- server error.

**Example:**
```javascript
await emdCloud.auth.forgotPasswordCheckCode({
	requestId: 'your-request-id',
	code: 'your-code'
}) // On success, will return _id for the password update request
```

<br>

#### Method:  `auth.forgotPasswordChange`

**Description:**  
This method changes the user's password after successfully verifying the reset code. The request ID and new passwords are required.

**Parameters:**

-   `requestId`  (string): the request ID for the password reset.
-   `newPassword`  (string): the new password.
-   `newPasswordRepeat`  (string): the repeat of the new password.

**Returns:** 
 
Returns a  `Promise`  that resolves to one of the following:

- user data with the updated token
- server error

**Notes:**  
If the new password does not match the repeat, a  `ValidationError`  will be thrown with the message "Passwords do not match".

**Example:**
```javascript
await emdCloud.auth.forgotPasswordChange({
	requestId: 'your-request-id',
	newPassword: 'your-password',
	newPasswordRepeat: 'your-password'
}) // On success, will return _id for the password update request
```

#### Method:  `auth.updateUser`

**Description:**  
This method updates an existing user's information.  
It can be used to change profile data (first name, last name, avatar, custom fields), login credentials, account status, or password.  
If `_id` is omitted, the update applies to the currently authenticated user.

**Parameters:**

-   `_id` (string, optional): Unique identifier of the user.  
-   `firstName` (string, optional): Updated first name.  
-   `lastName` (string, optional): Updated last name.  
-   `patronymicName` (string, optional): Updated patronymic (middle) name.  
-   `login` (string, optional): New login identifier.  
-   `customFields` (Record<string, any>, optional): Additional custom fields to update.  
-   `avatarUrl` (string, optional): URL to the user's avatar image.  
-   `password` (string, optional): Current password (may be required for sensitive updates).  
-   `oldPassword` (string, optional): Current password (when changing password).  
-   `newPassword1` (string, optional): New password (first entry).  
-   `newPassword2` (string, optional): New password (confirmation).  
-   `accountStatus` (string, optional): Status of the account (e.g., `'active'`, `'disabled'`).  
-   `staffManage` (boolean, optional): Whether the user has staff management permissions.  

**Returns:**  

Returns a `Promise` that resolves to one of the following:  

- updated user data (`UserData`)  
- server error (`ServerError`)  

**Example:**  
```javascript
await emdCloud.auth.updateUser({
  _id: 'user123',
  firstName: 'Jane',
  lastName: 'Doe',
  avatarUrl: 'https://example.com/avatar.png',
  customFields: { department: 'Sales', role: 'Manager' },
}) // On success, will return updated UserData object
```

<br>
<br>

### User Interaction methods:

#### Method:  `user.attachSocialAccount`

**Description:**
This method initiates the process to attach a social network account (Steam, VK, or Twitch) to the current user. It generates an authorization URL that the user should be redirected to in order to grant permission to link their social account.

**Parameters:**

-   `provider` (SocialProvider): The social provider to attach. Can be `SocialProvider.STEAM`, `SocialProvider.VK`, or `SocialProvider.TWITCH`.
-   `redirectUrl` (string): The URL to redirect back to after authorization.

**Returns:**

Returns a `Promise` that resolves to one of the following:

- An object containing the authorization URL (`{ url: string }`)
- Server error (`ServerError`)

**Notes:**
- The provider must be imported from the SDK: `import { SocialProvider } from '@emd-cloud/sdk'`
- User must be authenticated before calling this method
- After receiving the URL, redirect the user to it for social account authorization

**Example:**
```javascript
import { SocialProvider } from '@emd-cloud/sdk'

// Attach a Steam account
const response = await emdCloud.user.attachSocialAccount({
  provider: SocialProvider.STEAM,
  redirectUrl: 'https://myapp.com/profile'
});

// Redirect user to authorization page
window.location.href = response.url;
```

<br>

#### Method:  `user.detachSocialAccount`

**Description:**
This method removes the connection between the user's account and the specified social provider (Steam, VK, or Twitch).

**Parameters:**

-   `provider` (SocialProvider): The social provider to detach. Can be `SocialProvider.STEAM`, `SocialProvider.VK`, or `SocialProvider.TWITCH`.

**Returns:**

Returns a `Promise` that resolves to one of the following:

- Success status object (`{ success: boolean }`)
- Server error (`ServerError`)

**Example:**
```javascript
import { SocialProvider } from '@emd-cloud/sdk'

// Detach Steam account
const result = await emdCloud.user.detachSocialAccount(SocialProvider.STEAM);
if (result.success) {
  console.log('Steam account detached successfully');
}
```

<br>

#### Method:  `user.ping`

**Description:**
This method updates the current user's last activity timestamp. It can be used to track user presence and activity, updating the user's `ping` field with the current timestamp to determine if a user is online or their last seen time.

**Returns:**

Returns a `Promise` that resolves to one of the following:

- Success status object (`{ success: boolean }`)
- Server error (`ServerError`)

**Example:**
```javascript
// Update user activity once
const result = await emdCloud.user.ping();
if (result.success) {
  console.log('User activity updated');
}

// Ping user every 30 seconds to maintain online status
setInterval(async () => {
  await emdCloud.user.ping();
}, 30000);
```

<br>

#### Method:  `user.getUserList`

**Description:**
This method retrieves a paginated list of users in the application. It is typically available only to staff members with appropriate permissions and allows searching, filtering, sorting, and paginating through the user base.

**Parameters:**

-   `options` (UserListOptions, optional): Optional parameters for filtering and pagination:
    -   `search` (string, optional): Search term to filter users by name or login.
    -   `limit` (number, optional): Maximum number of users to return per page (default: 50).
    -   `page` (number, optional): Page number for pagination, 0-indexed (default: 0).
    -   `orderBy` (string, optional): Field to sort by (default: 'createdAt').
    -   `sort` ('ASC'|'DESC', optional): Sort direction (default: 'DESC').
    -   `accountStatus` (AccountStatus|null, optional): Filter by account status.

**Returns:**

Returns a `Promise` that resolves to one of the following:

- User list with count (`{ data: UserData[], total: number }`)
- Server error (`ServerError`)

**Example:**
```javascript
import { AccountStatus } from '@emd-cloud/sdk'

// Get first page of users
const users = await emdCloud.user.getUserList({
  limit: 20,
  page: 0,
  orderBy: 'createdAt',
  sort: 'DESC'
});
console.log(`Found ${users.total} users`, users.data);

// Search for specific users
const searchResults = await emdCloud.user.getUserList({
  search: 'john',
  limit: 10
});

// Filter by account status
const approvedUsers = await emdCloud.user.getUserList({
  accountStatus: AccountStatus.Approved
});
```

<br>

#### Method:  `user.getUserDetails`

**Description:**
This method retrieves detailed information about a specific user by their ID. It is typically available only to staff members with appropriate permissions, or to users requesting their own information. Encrypted fields may be hidden depending on permissions.

**Parameters:**

-   `userId` (string): The unique identifier (_id) of the user to retrieve.

**Returns:**

Returns a `Promise` that resolves to one of the following:

- Complete user data (`UserData`)
- Server error (`ServerError`)

**Example:**
```javascript
// Get details of a specific user
const user = await emdCloud.user.getUserDetails('507f1f77bcf86cd799439011');
console.log('User details:', user);

// Get current user's own details
const currentUser = await emdCloud.auth.authorization();
if (currentUser && currentUser._id) {
  const fullDetails = await emdCloud.user.getUserDetails(currentUser._id);
  console.log('My full details:', fullDetails);
}
```

<br>
<br>

### Uploader methods:

The uploader module provides file upload functionality using the TUS protocol for resumable uploads. Files can be uploaded with progress tracking, custom permissions, and automatic retry capabilities.

#### Method:  `uploader.uploadFile`

**Description:**
Uploads a file to EMD Cloud storage using chunked upload with the TUS protocol. This method provides resumable uploads with support for progress tracking, automatic retries, and flexible permission settings. The upload can be paused and resumed even after connection interruptions.

**Parameters:**

-   `file` (File): The browser File object to upload.
-   `options` (object, optional): Configuration options for the upload:
    -   `integration` (string, optional): S3 integration identifier (default: 'default').
    -   `chunkSize` (number, optional): Size of each upload chunk in bytes.
    -   `retryDelays` (array, optional): Retry delay intervals in milliseconds (default: [0, 3000, 5000, 10000, 20000]).
    -   `readPermission` (ReadPermission, optional): Access permission level for the file (default: ReadPermission.OnlyAppStaff).
    -   `permittedUsers` (array, optional): Array of user IDs who can access the file (required when readPermission is OnlyPermittedUsers).
    -   `presignedUrlTTL` (number, optional): Time-to-live for presigned URLs in minutes (default: 60).
    -   `headers` (object, optional): Additional HTTP headers to include in upload requests.
-   `callbacks` (object, optional): Event callbacks for upload lifecycle:
    -   `onProgress` (function, optional): Called on progress updates with `(progress: UploadProgress) => void`.
    -   `onSuccess` (function, optional): Called when upload succeeds with `(fileId: string, fileUrl: string) => void`.
    -   `onError` (function, optional): Called when upload fails with `(error: Error) => void`.

**Returns:**

Returns an object containing:
-   `uploadId` (string): Unique identifier for this upload.
-   `file` (UploadFile): Object to track upload state with properties:
    -   `id` (string): Upload identifier.
    -   `fileName` (string): Name of the file being uploaded.
    -   `status` (UploadStatus): Current upload status (pending, uploading, success, failed).
    -   `progress` (UploadProgress, optional): Current upload progress.
    -   `fileUrl` (string, optional): URL to access the file (available after successful upload).
    -   `error` (Error, optional): Error that occurred during upload (if failed).
    -   `abort` (function): Function to abort the upload.

**Notes:**
- User must be authenticated before uploading files.
- The `ReadPermission` enum must be imported: `import { ReadPermission } from '@emd-cloud/sdk'`.
- If `readPermission` is set to `OnlyPermittedUsers`, the `permittedUsers` array is required.

**Example:**
```javascript
import { ReadPermission } from '@emd-cloud/sdk'

// Basic file upload with progress tracking
const { file } = emdCloud.uploader.uploadFile(myFile, {
  readPermission: ReadPermission.OnlyAuthUser,
  presignedUrlTTL: 120
}, {
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
    console.log(`Uploaded ${progress.bytesUploaded} of ${progress.bytesTotal} bytes`);
  },
  onSuccess: (fileId, fileUrl) => {
    console.log('File uploaded successfully!');
    console.log('File URL:', fileUrl);
  },
  onError: (error) => {
    console.error('Upload failed:', error.message);
  }
});

// Check upload status
console.log('Current status:', file.status);

// Abort upload if needed
// file.abort();
```

**Example with specific user permissions:**
```javascript
import { ReadPermission } from '@emd-cloud/sdk'

// Upload document accessible only to specific users
const { file } = emdCloud.uploader.uploadFile(document, {
  readPermission: ReadPermission.OnlyPermittedUsers,
  permittedUsers: ['user-id-1', 'user-id-2', 'user-id-3']
}, {
  onSuccess: (fileId, fileUrl) => {
    console.log('Document uploaded and accessible to permitted users');
  }
});
```

**Example with public access:**
```javascript
import { ReadPermission } from '@emd-cloud/sdk'

// Upload publicly accessible file
const { file } = emdCloud.uploader.uploadFile(imageFile, {
  readPermission: ReadPermission.Public,
  presignedUrlTTL: 1440 // 24 hours
}, {
  onSuccess: (fileId, fileUrl) => {
    console.log('Public file URL:', fileUrl);
  }
});
```

<br>

#### Method:  `uploader.getFileUrl`

**Description:**
Constructs the URL to access an uploaded file. This method is useful when you have a file ID and need to generate the access URL.

**Parameters:**

-   `integration` (string): The integration ID used during upload.
-   `fileId` (string): The file identifier (base64url encoded).

**Returns:**

Returns a string containing the complete URL to access the file.

**Example:**
```javascript
const fileUrl = emdCloud.uploader.getFileUrl('default', 'abc123def456');
console.log(fileUrl);
// Output: https://api.emd.one/api/myapp/uploader/chunk/default/file/abc123def456
```

<br>

#### Method:  `uploader.getMetaUrl`

**Description:**
Constructs the URL to access file metadata. This can be used to retrieve information about an uploaded file without downloading the actual file content.

**Parameters:**

-   `integration` (string): The integration ID used during upload.
-   `fileId` (string): The file identifier (base64url encoded).

**Returns:**

Returns a string containing the complete URL to access file metadata.

**Example:**
```javascript
const metaUrl = emdCloud.uploader.getMetaUrl('default', 'abc123def456');
console.log(metaUrl);
// Output: https://api.emd.one/api/myapp/uploader/chunk/default/meta/abc123def456
```

<br>
<br>

### Webhook methods:

#### Method:  `webhook.call`

**Description:**  
This function constructs the URL for the API call, adds necessary headers including authorization,
and handles the response by formatting it if needed. It supports customization of the request
through requestOptions and callOptions.

**Parameters:**

- `id` - A string that uniquely identifies the webhook.
- `requestOptions` - An object specifying the fetch request options such as method, headers, body, etc.
- `callOptions` - An object specifying additional options for the API call, including the authentication type, ignore format response option.

**Returns:** 
 
Returns a  `Promise`  that resolves to one of the following:

-   webhook data, including the token.
-   server error.

**Example:**
```javascript
await emdCloud.webhook.call(
	'my_webhook',
	{
		method: 'POST',
		body: { title: 'test' }
	},
	{
		authType: AuthType.ApiToken
	}
); // On success, will return webhook data
```

<br>
<br>

### Database methods:

The database module allows you to interact with collections in your EMD Cloud spaces. Each database instance is bound to a specific space and collection, enabling CRUD operations, batch updates, and trigger actions.

#### Creating a database instance

To work with database collections, you need to create a database instance for each collection:

```javascript
const usersDb = emdCloud.database('users-collection-id');
const ordersDb = emdCloud.database('orders-collection-id');
```

Each instance is scoped to a specific collection within your app's space, so you'll need separate instances for different collections.

#### Key Features

- **Human-Readable Names**: Many methods support the `useHumanReadableNames` parameter, which replaces technical column identifiers (e.g., `col_xxx`) with human-readable key names (e.g., `code`, `name`, `id`) in JSON responses.
- **Save Modes**: Update operations support synchronous and asynchronous save modes via `DatabaseSaveMode.SYNC` / `DatabaseSaveMode.ASYNC` (wire values: `sync` / `async`).
- **Response Wrapping Control**: All database methods accept `callOptions.ignoreFormatResponse`.  
  - `false`/omitted (default): SDK returns unwrapped `data`  
  - `true`: SDK returns full API envelope (`{ success, data, ... }`)

#### Method: `database.getRows`

**Description:**  
Retrieves rows from the database collection with optional filtering, sorting, and pagination support. Supports MongoDB-style queries for complex filtering.

**Parameters:**
- `options` (object, optional): Query options including:
  - `query` (object, optional): MongoDB-style query object with `$and`, `$or` operators
  - `orderBy` (string, optional): Compatibility field accepted by gateway schema; current row-list backend sorting is driven by `sort`
  - `sort` (array, optional): Sort configuration `[{column: 'fieldName', sort: 'asc|desc'}]`
  - `limit` (number, optional): Maximum number of rows to return (default: 50)
  - `page` (number, optional): Page number for pagination (default: 0)
  - `search` (string, optional): Text search across collection
  - `createdAt` (string, optional): Filter rows by creation date
  - `hasOptimiseResponse` (boolean, optional): Optimize response size (default: false)
  - `ignoreColumns` (string[], optional): Omit specific columns from response payload
  - `useHumanReadableNames` (boolean, optional): Use readable column names (default: false)
- `callOptions` (object): API call options including:
  - `authType` (`AuthType`, optional): `AuthType.AuthToken` | `AuthType.ApiToken`
  - `ignoreFormatResponse` (boolean, optional)

**Type note:**
- For typed schemas (`getRows<TSchema>()`), literal `ignoreColumns` values (e.g. `['title']`) narrow the return type automatically.
- Widened key arrays (e.g. `(keyof TSchema)[]`) keep a safe non-narrowed return type.

**Returns:**  
Returns a `Promise` that resolves to:
- Unwrapped row array (`DatabaseRowData[]` by default, `OptimisedRowData[]` with `hasOptimiseResponse: true`)
- Full response envelope when `ignoreFormatResponse: true` (`{ success, data, count, ... }`)
- Server error

**Example:**
```javascript
const result = await usersDb.getRows(
  {
    query: { "$and": [{ "data.status": { "$eq": "active" } }] },
    sort: [{ column: "createdAt", sort: "desc" }],
    limit: 20,
    page: 0
  },
  { authType: AuthType.AuthToken }
);
```

<br>

#### Method: `database.countRows`

**Description:**  
Gets the total count of rows matching the specified query without returning the actual data.

**Parameters:**
- `options` (object, optional): Count options including:
  - `query` (object, optional): MongoDB-style query object
  - `search` (string, optional): Text search across collection
  - `createdAt` (string, optional): Filter by creation date
- `callOptions` (object): API call options including:
  - `authType` (`AuthType`, optional): `AuthType.AuthToken` | `AuthType.ApiToken`
  - `ignoreFormatResponse` (boolean, optional)

**Returns:**  
Returns a `Promise` that resolves to:
- Unwrapped count value (`number`)
- Full response envelope when `ignoreFormatResponse: true` (`{ success, count, data, ... }`)
- Server error

**Example:**
```javascript
const result = await usersDb.countRows(
  { query: { "$and": [{ "data.status": { "$eq": "active" } }] } },
  { authType: AuthType.AuthToken }
);
```

<br>

#### Method: `database.getRow`

**Description:**  
Retrieves a single row by its unique identifier.

**Parameters:**
- `rowId` (string): The unique ID of the row to retrieve
- `options` (object, optional): Options for retrieving the row including:
  - `useHumanReadableNames` (boolean, optional): Use readable column names (default: false)
- `callOptions` (object): API call options including:
  - `authType` (`AuthType`, optional): `AuthType.AuthToken` | `AuthType.ApiToken`
  - `ignoreFormatResponse` (boolean, optional)

**Returns:**  
Returns a `Promise` that resolves to:
- Unwrapped row object
- Full response envelope when `ignoreFormatResponse: true`
- Server error

**Example:**
```javascript
const result = await usersDb.getRow(
  '60a7c8b8f123456789abcdef', 
  { useHumanReadableNames: true },
  { authType: AuthType.AuthToken }
);
```

<br>

#### Method: `database.createRow`

**Description:**  
Creates a new row in the database collection.

**Parameters:**
- `rowData` (object): The data for the new row
- `options` (object, optional): Create options including:
  - `user` (string, optional): User ID to associate with the row
  - `notice` (string, optional): Notice/comment for the operation
  - `useHumanReadableNames` (boolean, optional): Use readable column names in response (default: false)
- `callOptions` (object): API call options including:
  - `authType` (`AuthType`, optional): `AuthType.AuthToken` | `AuthType.ApiToken`
  - `ignoreFormatResponse` (boolean, optional)

**Returns:**  
Returns a `Promise` that resolves to:
- Unwrapped created row object
- Full response envelope when `ignoreFormatResponse: true`
- Server error

**Example:**
```javascript
const result = await usersDb.createRow(
  { name: 'John Doe', email: 'john@example.com', status: 'active' },
  { notice: 'Created via API' },
  { authType: AuthType.AuthToken }
);
```

<br>

#### Method: `database.updateRow`

**Description:**  
Updates an existing row in the database collection.

**Parameters:**
- `rowId` (string): The unique ID of the row to update
- `rowData` (object): The data to update
- `options` (object, optional): Update options including:
  - `user` (string, optional): User ID to associate with the update
  - `notice` (string, optional): Notice/comment for the operation
  - `saveMode` (DatabaseSaveMode, optional): Save mode (`DatabaseSaveMode.SYNC` / `DatabaseSaveMode.ASYNC`, wire: `sync` / `async`)
  - `useHumanReadableNames` (boolean, optional): Use readable column names in response (default: false)
- `callOptions` (object): API call options including:
  - `authType` (`AuthType`, optional): `AuthType.AuthToken` | `AuthType.ApiToken`
  - `ignoreFormatResponse` (boolean, optional)

**Returns:**  
Returns a `Promise` that resolves to:
- Unwrapped updated row object (`saveMode: ASYNC` returns minimal `{ _id, data }`)
- Full response envelope when `ignoreFormatResponse: true`
- Server error

**Example:**
```javascript
const result = await usersDb.updateRow(
  '60a7c8b8f123456789abcdef',
  { status: 'inactive' },
  { notice: 'Deactivated user' },
  { authType: AuthType.AuthToken }
);
```

<br>

#### Method: `database.bulkUpdate`

**Description:**  
Updates multiple rows matching the specified query in a single operation.

**Parameters:**
- `payload` (object): Bulk update configuration including:
  - `query` (object): MongoDB-style query to match rows for update
  - `data` (object): Data to update on matching rows
  - `notice` (string): Notice/comment for the bulk operation
- `callOptions` (object): API call options including:
  - `authType` (`AuthType`, optional): `AuthType.AuthToken` | `AuthType.ApiToken`
  - `ignoreFormatResponse` (boolean, optional)

**Returns:**  
Returns a `Promise` that resolves to:
- Bulk operation result with counts
- Server error

**Example:**
```javascript
const result = await usersDb.bulkUpdate(
  {
    query: { "$and": [{ "data.status": { "$eq": "pending" } }] },
    data: { status: "active" },
    notice: "Bulk activation of pending users"
  },
  { authType: AuthType.AuthToken }
);
```

<br>

#### Method: `database.deleteRow`

**Description:**  
Deletes a single row by its unique identifier.

**Parameters:**
- `rowId` (string): The unique ID of the row to delete
- `callOptions` (object): API call options including:
  - `authType` (`AuthType`, optional): `AuthType.AuthToken` | `AuthType.ApiToken`
  - `ignoreFormatResponse` (boolean, optional)

**Returns:**  
Returns a `Promise` that resolves to:
- Delete operation result
- Server error

**Example:**
```javascript
const result = await usersDb.deleteRow('60a7c8b8f123456789abcdef', { authType: AuthType.AuthToken });
```

<br>

#### Method: `database.deleteRows`

**Description:**  
Deletes multiple rows by their unique identifiers in a single operation.

**Parameters:**
- `rowIds` (array): Array of row IDs to delete
- `callOptions` (object): API call options including:
  - `authType` (`AuthType`, optional): `AuthType.AuthToken` | `AuthType.ApiToken`
  - `ignoreFormatResponse` (boolean, optional)

**Returns:**  
Returns a `Promise` that resolves to:
- Delete operation result with counts
- Server error

**Example:**
```javascript
const result = await usersDb.deleteRows(
  ['60a7c8b8f123456789abcdef', '60a7c8b8f123456789abcdeg'],
  { authType: AuthType.AuthToken }
);
```

<br>

#### Method: `database.triggerButton`

**Description:**  
Triggers a button action on a specific row. This is used for executing custom workflows or actions defined in your EMD Cloud collection.

**Parameters:**
- `rowId` (string): The unique ID of the row containing the button
- `columnId` (string): The ID of the column containing the button to trigger
- `callOptions` (object): API call options including:
  - `authType` (`AuthType`, optional): `AuthType.AuthToken` | `AuthType.ApiToken`
  - `ignoreFormatResponse` (boolean, optional)

**Returns:**  
Returns a `Promise` that resolves to:
- Trigger action result
- Server error

**Example:**
```javascript
const result = await ordersDb.triggerButton(
  '60a7c8b8f123456789abcdef',
  'approve-button-column-id',
  { authType: AuthType.AuthToken }
);
```

<br>

#### Typing Relations

The SDK provides generic marker types for typing relation columns in your database schemas. This gives you compile-time accuracy for both read responses and write payloads.

**Marker types:**

- `Relation<T>` — marks a **has-one** relation field (single row reference)
- `RelationMany<T>` — marks a **has-many** relation field (multiple row references)
- `ResolveRelations<T, D>` — transforms relation markers into their resolved types based on depth `D` (used internally by the SDK; you rarely need to call it directly)

**Depth behavior (applied automatically by the SDK):**

| Depth | Use case | `Relation<T>` becomes | `RelationMany<T>` becomes |
|-------|----------|----------------------|--------------------------|
| `D=1` (default) | API read responses (`getRows`, `getRow`) | `DatabaseRelatedRowData<T>` (or `null`) | `DatabaseRelatedRowData<T>[]` |
| `D=0` | Write operations (`createRow`, `updateRow`) | `string` (ObjectId) | `string[]` (ObjectId array) |

The API resolves relations exactly **1 level deep**. Nested relation fields inside resolved rows remain as raw ObjectId strings. All database methods auto-resolve relation markers — just pass your raw schema type.

**Example — defining schemas and using relation types:**

```typescript
import {
  Relation,
  RelationMany,
  DatabaseRelatedRowData,
} from '@emd-cloud/sdk'

// Define your collection schemas
interface TeamSchema {
  name: string
  country: string
}

interface TourSchema {
  title: string
  tournament: Relation<TournamentSchema>
}

interface TournamentSchema {
  title: string
  tours: RelationMany<TourSchema>
  winner: Relation<TeamSchema> | null // nullable relation
}

// --- Reading rows (auto-resolved at D=1) ---
// Just pass your raw schema type — the SDK wraps it with ResolveRelations automatically
const tourDb = emdCloud.database('tours-collection-id')
const result = await tourDb.getRows<TourSchema>()

// result[0].data.tournament is DatabaseRelatedRowData<{ title: string; tours: string[]; winner: string | null }>
const tournamentTitle = result[0].data.tournament.data.title // string
const tourIds = result[0].data.tournament.data.tours          // string[] (depth exhausted)

// --- Writing rows (auto-resolved at D=0) ---
// createRow/updateRow also auto-resolve — just pass your raw schema type
await tourDb.createRow<TourSchema>(
  { title: 'Round 1', tournament: '507f1f77bcf86cd799439011' }
)

// --- Self-referencing relations (e.g. tournament bracket) ---
interface MatchSchema {
  name: string
  next_match_win: Relation<MatchSchema> | null
  prev_match_win: RelationMany<MatchSchema>
}

const matchDb = emdCloud.database('matches-collection-id')
const matches = await matchDb.getRows<MatchSchema>()

const match = matches[0].data
match.next_match_win       // DatabaseRelatedRowData<{ name: string; next_match_win: string | null; prev_match_win: string[] }> | null
match.prev_match_win       // DatabaseRelatedRowData<{ name: string; next_match_win: string | null; prev_match_win: string[] }>[]
```

**`DatabaseEntity<T>` — the main type for your collections:**

Define it once per collection and use it everywhere — for state, function parameters, component props, etc. The SDK methods resolve relation types automatically from your raw schema generic. Option-specific overloads are narrow when options are literal (`{ hasOptimiseResponse: true }`, `{ saveMode: DatabaseSaveMode.ASYNC }`); broadly typed options return a safe union.

```typescript
import {
  DatabaseEntity,
  DatabaseUpdateOptions,
  DatabaseSaveMode,
  Relation,
  RelationMany,
} from '@emd-cloud/sdk'

// 1. Define your schemas
interface TourSchema {
  title: string
  tournament: Relation<TournamentSchema>
}

interface TournamentSchema {
  title: string
  tours: RelationMany<TourSchema>
  winner: Relation<TeamSchema> | null
}

// 2. Define entity types — one line per collection
type Tournament = DatabaseEntity<TournamentSchema>
type Tour = DatabaseEntity<TourSchema>

// 3. Use them everywhere
function renderTournament(tournament: Tournament) {
  tournament._id                          // string
  tournament.data.title                   // string
  tournament.data.tours                   // DatabaseRelatedRowData<...>[]
  tournament.data.tours[0].data.title     // string
  tournament.data.tours[0].data.tournament // string (depth exhausted)
  tournament.createdAt                    // string
}

// SDK methods auto-resolve — results are assignable to your entity type
const tours: Tour[] = await tourDb.getRows<TourSchema>()
const tour: Tour = await tourDb.getRow<TourSchema>('row-id')

// Write methods auto-resolve too — relations become string IDs
await tourDb.createRow<TourSchema>({
  title: 'Round 1',
  tournament: '507f1f77bcf86cd799439011',
})

// Literal options select narrow overloads:
const optimised = await tourDb.getRows<TourSchema>({ hasOptimiseResponse: true })
// optimised[0] is OptimisedRowData<...>

// Broadly typed options return a safe union:
const updateOptions: DatabaseUpdateOptions = { saveMode: DatabaseSaveMode.ASYNC }
const updated = await tourDb.updateRow<TourSchema>('row-id', { title: 'Round 2' }, updateOptions)
// updated is DatabaseRowData<...> | DatabaseAsyncRowData<...>
```

> **Note:** The SDK also exports `DatabaseWriteData<T>`, `OptimisedDatabaseEntity<T>`, and `ResolveRelations<T, D>` for advanced use cases, but you typically don't need them — the SDK methods handle the type resolution based on the options you pass.

<br>
<br>

### Chat methods:

The chat module provides both REST API methods for managing chat channels and messages, and WebSocket functionality for real-time messaging. Access REST API operations via `emdCloud.chat`.

#### Method:  `chat.listChannels`

**Description:**
Lists chat channels with filtering and pagination support. You can filter by channel type, search content, and retrieve unread or long-pending chats.

**Parameters:**

-   `options` (object, optional): List options including:
    -   `type` (ChatChannelType, optional): Filter by channel type (default: ChatChannelType.Public)
    -   `search` (string, optional): Search in user names or chat content
    -   `limit` (number, optional): Number of channels per page (default: 50)
    -   `page` (number, optional): Page number, 0-indexed (default: 0)
    -   `orderBy` (string, optional): Field to sort by (default: 'createdAt')
    -   `sort` ('ASC'|'DESC', optional): Sort direction (default: 'DESC')
    -   `unreadedChats` (boolean, optional): Show only unread chats
    -   `longTimeAnswer` (boolean, optional): Show chats with long time since answer

**Returns:**

Returns a `Promise` that resolves to one of the following:

-   Channel list with pagination info (`{ data: ChatChannel[], count: number, pages: number }`)
-   Server error

**Notes:**
The `ChatChannelType` enum must be imported: `import { ChatChannelType } from '@emd-cloud/sdk'`

**Example:**
```javascript
import { ChatChannelType } from '@emd-cloud/sdk'

// Get all public channels
const channels = await emdCloud.chat.listChannels({
  type: ChatChannelType.Public,
  limit: 20,
  page: 0
});
console.log(`Found ${channels.count} channels across ${channels.pages} pages`);

// Get unread staff-to-user chats
const unreadSupport = await emdCloud.chat.listChannels({
  type: ChatChannelType.StaffToUser,
  unreadedChats: true
});
```

<br>

#### Method:  `chat.createChannelByType`

**Description:**
Creates or retrieves an existing chat channel by type. This method is used to create staff-to-user support chats, peer-to-peer direct messages, or internal staff channels.

**Parameters:**

-   `type` (ChatChannelType): Channel type - must be `StaffToUser`, `PeerToPeer`, or `Staff`
-   `options` (object, optional): Creation options including:
    -   `userId` (string, optional): User ID for staff-to-user chats
    -   `id` (string, optional): Custom channel ID
    -   `accesses` (array, optional): Array of user UUIDs for peer-to-peer chats

**Returns:**

Returns a `Promise` that resolves to one of the following:

-   Created or existing channel (`ChatChannel`)
-   Server error
-   Validation error if type is invalid

**Example:**
```javascript
import { ChatChannelType } from '@emd-cloud/sdk'

// Create staff-to-user support chat
const supportChannel = await emdCloud.chat.createChannelByType(
  ChatChannelType.StaffToUser,
  { userId: 'user-uuid-123' }
);

// Create peer-to-peer direct message
const dmChannel = await emdCloud.chat.createChannelByType(
  ChatChannelType.PeerToPeer,
  { accesses: ['user-uuid-1', 'user-uuid-2'] }
);

// Create internal staff channel
const staffChannel = await emdCloud.chat.createChannelByType(
  ChatChannelType.Staff,
  { id: 'team-alpha' }
);
```

<br>

#### Method:  `chat.upsertChannel`

**Description:**
Creates a new chat channel or updates an existing one. Include `_id` in the data to update an existing channel.

**Parameters:**

-   `data` (object): Channel data including:
    -   `_id` (string, optional): Channel MongoDB ID (for updates)
    -   `id` (string, optional): Custom channel identifier
    -   `type` (ChatChannelType, optional): Channel type
    -   `resolved` (boolean, optional): Whether support chat is resolved

**Returns:**

Returns a `Promise` that resolves to one of the following:

-   Created or updated channel (`ChatChannel`)
-   Server error

**Example:**
```javascript
import { ChatChannelType } from '@emd-cloud/sdk'

// Create new public channel
const newChannel = await emdCloud.chat.upsertChannel({
  id: 'general-chat',
  type: ChatChannelType.Public
});

// Update existing channel (mark support chat as resolved)
const updated = await emdCloud.chat.upsertChannel({
  _id: 'channel-mongo-id',
  resolved: true
});
```

<br>

#### Method:  `chat.getChannel`

**Description:**
Retrieves detailed information about a specific chat channel, including participant access information.

**Parameters:**

-   `id` (string): Channel ID (not MongoDB _id)
-   `options` (object, optional): Options including:
    -   `cleanupUnreaded` (boolean, optional): Clear unread counts on fetch (default: true)

**Returns:**

Returns a `Promise` that resolves to one of the following:

-   Channel details (`ChatChannel`)
-   Server error

**Example:**
```javascript
// Get channel details
const channel = await emdCloud.chat.getChannel('staff-to-user-user-uuid');
console.log('Channel type:', channel.type);
console.log('Unread messages:', channel.unreadCountRecipient);

// Get channel without clearing unread count
const channelPreview = await emdCloud.chat.getChannel('channel-id', {
  cleanupUnreaded: false
});
```

<br>

#### Method:  `chat.deleteChannel`

**Description:**
Permanently deletes a chat channel and all its messages.

**Parameters:**

-   `channelId` (string): Channel MongoDB _id to delete

**Returns:**

Returns a `Promise` that resolves to one of the following:

-   Success status (`{ success: boolean }`)
-   Server error

**Example:**
```javascript
const result = await emdCloud.chat.deleteChannel('channel-mongo-id');
if (result.success) {
  console.log('Channel deleted successfully');
}
```

<br>

#### Method:  `chat.sendMessage`

**Description:**
Sends a message to a chat channel. Messages can include text content and/or up to 10 file attachments.

**Parameters:**

-   `channelId` (string): Channel ID to send message to
-   `options` (object): Message options including:
    -   `message` (string, optional): Message text content
    -   `attaches` (array, optional): Array of attachments (max 10) with:
        -   `type` (string): Attachment type (e.g., 'image', 'file')
        -   `attach` (string): Attachment identifier/path
        -   `name` (string, optional): Display name

**Returns:**

Returns a `Promise` that resolves to one of the following:

-   Created message (`ChatMessage`)
-   Server error
-   Validation error if neither message nor attachments provided, or if more than 10 attachments

**Example:**
```javascript
// Send text message
const message = await emdCloud.chat.sendMessage('channel-id', {
  message: 'Hello, how can I help you today?'
});

// Send message with attachments
const messageWithFiles = await emdCloud.chat.sendMessage('channel-id', {
  message: 'Here are the requested documents',
  attaches: [
    { type: 'image', attach: 'image-id-123', name: 'screenshot.png' },
    { type: 'file', attach: 'file-id-456', name: 'report.pdf' }
  ]
});
```

<br>

#### Method:  `chat.listMessages`

**Description:**
Retrieves messages from a chat channel with pagination and search capabilities.

**Parameters:**

-   `channelId` (string): Channel ID to list messages from
-   `options` (object, optional): List options including:
    -   `search` (string, optional): Text search across messages
    -   `limit` (number, optional): Number of messages per page (default: 50)
    -   `page` (number, optional): Page number, 0-indexed (default: 0)
    -   `orderBy` (string, optional): Field to sort by (default: 'createdAt')
    -   `sort` ('ASC'|'DESC', optional): Sort direction (default: 'DESC')

**Returns:**

Returns a `Promise` that resolves to one of the following:

-   Message list with pagination (`{ data: ChatMessage[], count: number, pages: number }`)
-   Server error

**Example:**
```javascript
// Get recent messages (newest first)
const messages = await emdCloud.chat.listMessages('channel-id', {
  limit: 50,
  page: 0,
  orderBy: 'createdAt',
  sort: 'DESC'
});
console.log(`Found ${messages.count} messages`);

// Search messages
const searchResults = await emdCloud.chat.listMessages('channel-id', {
  search: 'order status',
  limit: 20
});
```

<br>

#### Method:  `chat.deleteMessage`

**Description:**
Deletes a specific message from a chat channel.

**Parameters:**

-   `channelId` (string): Channel ID containing the message
-   `messageId` (string): Message MongoDB _id to delete

**Returns:**

Returns a `Promise` that resolves to one of the following:

-   Success status (`{ success: boolean }`)
-   Server error

**Example:**
```javascript
const result = await emdCloud.chat.deleteMessage('channel-id', 'message-mongo-id');
if (result.success) {
  console.log('Message deleted successfully');
}
```

<br>

#### Method:  `chat.getUnreadCount`

**Description:**
Gets the unread message count for a staff-to-user chat channel. Returns separate counts for the chat creator (staff) and recipient (user).

**Parameters:**

-   `channelId` (string): Channel ID
-   `options` (object, optional): Options including:
    -   `cleanupUnreaded` (boolean, optional): Clear unread counts on fetch (default: false)

**Returns:**

Returns a `Promise` that resolves to one of the following:

-   Unread counts (`{ creator: number, recipient: number }`)
-   Server error

**Example:**
```javascript
const counts = await emdCloud.chat.getUnreadCount('channel-id');
console.log(`Staff unread: ${counts.creator}, User unread: ${counts.recipient}`);

// Get counts and mark as read
const clearedCounts = await emdCloud.chat.getUnreadCount('channel-id', {
  cleanupUnreaded: true
});
```

<br>
<br>

### Real-time Chat (WebSocket):

The ChatWebSocket class provides real-time messaging capabilities using the native WebSocket API with Pusher protocol compatibility. Create WebSocket instances via `emdCloud.chatWebSocket()`.

#### Creating a WebSocket instance

To enable real-time chat updates, create a WebSocket instance with optional configuration:

```javascript
import { ConnectionState } from '@emd-cloud/sdk'

// Basic WebSocket instance
const chatWs = emdCloud.chatWebSocket();

// WebSocket with configuration and callbacks
const chatWs = emdCloud.chatWebSocket({
  autoReconnect: true,
  maxReconnectAttempts: -1, // -1 = infinite
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  pingInterval: 30000,
  callbacks: {
    onMessageReceived: (message) => {
      console.log('New message:', message);
    },
    onConnectionStateChange: (state) => {
      console.log('Connection state:', state);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  }
});
```

#### Key Features

- **Native WebSocket API**: Uses browser and Node.js v22+ native WebSocket (zero external dependencies)
- **JWS Authentication**: Channels authenticated using JWT tokens from SDK configuration
- **Auto-reconnection**: Exponential backoff strategy (1s → 30s max delay) with configurable retry limits
- **Ping/Pong Keepalive**: Automatic 30-second ping intervals to maintain connection
- **Event Callbacks**: Real-time notifications for messages, deletions, support updates, and connection changes
- **Connection States**: Track connection status (`connecting`, `connected`, `disconnected`, `error`)

<br>

#### Method:  `chatWs.connect`

**Description:**
Establishes a WebSocket connection to the EMD Cloud chat server. The connection uses the `websocketUrl` configured in the SDK options.

**Returns:**

Returns a `Promise` that resolves when the connection is successfully established.

**Notes:**
- Authentication token must be set before connecting
- Connection state changes are reported via `onConnectionStateChange` callback
- On successful connection, the `ConnectionEstablished` event triggers automatic ping/pong keepalive

**Example:**
```javascript
try {
  await chatWs.connect();
  console.log('Connected to chat server');
} catch (error) {
  console.error('Connection failed:', error);
}
```

<br>

#### Method:  `chatWs.disconnect`

**Description:**
Closes the WebSocket connection and cleans up all resources including timers and subscriptions.

**Notes:**
- Stops automatic reconnection attempts
- Clears ping/pong keepalive timers
- Removes all channel subscriptions
- Sets connection state to `Disconnected`

**Example:**
```javascript
chatWs.disconnect();
console.log('Disconnected from chat server');
```

<br>

#### Method:  `chatWs.subscribeToChannel`

**Description:**
Subscribes to a chat channel to receive real-time message updates. The subscription uses JWS authentication generated from the SDK's auth token.

**Parameters:**

-   `channelId` (string): Chat channel ID to subscribe to
-   `chatId` (string, optional): Optional chat ID for authentication context

**Returns:**

Returns a `Promise` that resolves when subscription succeeds, rejects on error or timeout (10 seconds).

**Notes:**
- Must be connected before subscribing
- Channel name is automatically prefixed with `chat-`
- Duplicate subscriptions are ignored (returns immediately)
- Authentication is handled automatically using SDK configuration

**Example:**
```javascript
try {
  await chatWs.connect();
  await chatWs.subscribeToChannel('channel-id-123');
  console.log('Subscribed to channel');
} catch (error) {
  console.error('Subscription failed:', error);
}

// Subscribe with chat ID for authentication
await chatWs.subscribeToChannel('support-channel', 'chat-mongo-id');
```

<br>

#### Method:  `chatWs.unsubscribeFromChannel`

**Description:**
Unsubscribes from a chat channel, stopping real-time message updates for that channel.

**Parameters:**

-   `channelId` (string): Chat channel ID to unsubscribe from

**Notes:**
- If not currently subscribed to the channel, this is a no-op
- Channel name is automatically prefixed with `chat-`

**Example:**
```javascript
chatWs.unsubscribeFromChannel('channel-id-123');
console.log('Unsubscribed from channel');
```

<br>

#### Method:  `chatWs.subscribeToSupport`

**Description:**
Subscribes to the special support channel (`private-space`) to receive real-time support chat updates. This is typically used by staff members to monitor all support conversations.

**Returns:**

Returns a `Promise` that resolves when subscription succeeds, rejects on timeout.

**Notes:**
- Must be connected before subscribing
- Requires staff permissions to successfully subscribe
- Receives `UpdateSupportCount` and `UpdateSupportChannel` events

**Example:**
```javascript
try {
  await chatWs.connect();
  await chatWs.subscribeToSupport();
  console.log('Subscribed to support updates');
} catch (error) {
  console.error('Support subscription failed:', error);
}
```

<br>

#### Method:  `chatWs.setCallbacks`

**Description:**
Sets or updates event callbacks for WebSocket events. New callbacks are merged with existing ones.

**Parameters:**

-   `callbacks` (object): Event callbacks including:
    -   `onMessageReceived` (function, optional): Called when a new message arrives `(message: ChatMessage) => void`
    -   `onMessageDeleted` (function, optional): Called when a message is deleted `(data: { _id: string, channel: string }) => void`
    -   `onSupportCountUpdated` (function, optional): Called when support unread count changes `(data: { count: number }) => void`
    -   `onSupportChannelUpdated` (function, optional): Called when a support channel updates `(channel: ChatChannel) => void`
    -   `onConnectionStateChange` (function, optional): Called on connection state changes `(state: ConnectionState) => void`
    -   `onError` (function, optional): Called on any error `(error: Error) => void`

**Example:**
```javascript
chatWs.setCallbacks({
  onMessageReceived: (message) => {
    console.log('New message from', message.user);
    console.log('Content:', message.message);

    // Update UI with new message
    addMessageToUI(message);
  },
  onMessageDeleted: (data) => {
    console.log('Message deleted:', data._id);
    removeMessageFromUI(data._id);
  },
  onConnectionStateChange: (state) => {
    if (state === ConnectionState.Connected) {
      console.log('Connected!');
    } else if (state === ConnectionState.Disconnected) {
      console.log('Disconnected');
    }
  }
});
```

<br>

#### Method:  `chatWs.getConnectionState`

**Description:**
Returns the current WebSocket connection state.

**Returns:**

Returns the current `ConnectionState` enum value:
- `ConnectionState.Connecting` - Attempting to connect
- `ConnectionState.Connected` - Successfully connected
- `ConnectionState.Disconnected` - Not connected
- `ConnectionState.Error` - Connection error occurred

**Example:**
```javascript
import { ConnectionState } from '@emd-cloud/sdk'

const state = chatWs.getConnectionState();
if (state === ConnectionState.Connected) {
  console.log('WebSocket is connected');
} else {
  console.log('WebSocket is not connected');
}
```

<br>

#### Method:  `chatWs.getSubscribedChannels`

**Description:**
Returns a set of all currently subscribed channel names.

**Returns:**

Returns a `Set<string>` containing subscribed channel names (including the `chat-` prefix).

**Example:**
```javascript
const channels = chatWs.getSubscribedChannels();
console.log('Subscribed to channels:', Array.from(channels));
// Output: ['chat-channel-1', 'chat-channel-2', 'private-space']
```

<br>

#### Complete WebSocket Example

Here's a complete example showing WebSocket setup and usage:

```javascript
import { EmdCloud, AppEnvironment, ConnectionState, ChatChannelType } from '@emd-cloud/sdk'

// Initialize SDK
const emdCloud = new EmdCloud({
  environment: AppEnvironment.Client,
  appId: 'your-app-id'
});

// Set auth token (from login)
emdCloud.setAuthToken('user-auth-token');

// Create WebSocket instance with callbacks
const chatWs = emdCloud.chatWebSocket({
  autoReconnect: true,
  callbacks: {
    onMessageReceived: (message) => {
      console.log(`[${message.channel}] ${message.user}: ${message.message}`);
      updateChatUI(message);
    },
    onMessageDeleted: ({ _id, channel }) => {
      console.log(`Message ${_id} deleted from ${channel}`);
      removeMessageFromUI(_id);
    },
    onConnectionStateChange: (state) => {
      if (state === ConnectionState.Connected) {
        console.log('✓ Connected to chat');
      } else if (state === ConnectionState.Error) {
        console.log('✗ Connection error');
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error.message);
    }
  }
});

// Connect and subscribe
async function startChat() {
  try {
    // Establish WebSocket connection
    await chatWs.connect();

    // Get user's channels
    const channels = await emdCloud.chat.listChannels({
      type: ChatChannelType.StaffToUser,
      limit: 10
    });

    // Subscribe to all user channels
    for (const channel of channels.data) {
      await chatWs.subscribeToChannel(channel.id);
      console.log(`Subscribed to ${channel.id}`);
    }

    // For staff: subscribe to support updates
    if (isStaff) {
      await chatWs.subscribeToSupport();
    }
  } catch (error) {
    console.error('Failed to start chat:', error);
  }
}

// Send a message
async function sendChatMessage(channelId, text) {
  const message = await emdCloud.chat.sendMessage(channelId, {
    message: text
  });
  console.log('Message sent:', message._id);
}

// Cleanup on app close
function cleanup() {
  chatWs.disconnect();
}

// Start the chat
startChat();
```

<br>

## Conclusion

Ensure that you provide the necessary parameters when creating an instance and handle any validation errors. This class can be integrated into various applications to interact with EMD Cloud.
