
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
-   [Conclusion](#conclusion)

## Overview

The EMD Cloud SDK enables applications to interact with the [EMD Cloud](https://cloud.emd.one/) API. This library is designed to manage authentication and the configuration parameters necessary for the effective use of the EMD Cloud service.

## Get started

1. Register on the EMD Cloud platform and create an application via the link - https://console.cloud.emd.one
2. Get the API token of your application.
3. Install npm or yarn package:

	**NPM**
	```sh
	npm install @emd-cloud/sdk
	```

	**Yarn**
	```sh
	yarn add @emd-cloud/sdk
	```

Done! The SDK is ready for use.

## Usage
To use the EMD Cloud SDK, make sure to import it from the appropriate module in your JavaScript code:

```javascript
import { EmdCloud } from '@emd-cloud/sdk'
```

### Creating an instance

To create an instance of the  `EmdCloud`  class, you need to provide a configuration object containing parameters such as  `environment`,  `appId`, and optionally  `apiUrl`,  `authSchema`, and  `token`. Here’s an example of how to do this:

```javascript
const emdCloud = new EmdCloud({
	environment: 'server', // or 'client' for client-side usage
	appId: 'your-app-id',
	apiToken: 'your-auth-token' // Required if server mode is selected
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
-   server error.
-   validation error if the token is missing.

**Notes:**  
If the token is absent, an error will be thrown with the message "Unable auth token".

**Example:**
```javascript
await emdCloud.auth.authorization(); // On success, will return user data
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
		authType: 'api-token'
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
- **Save Modes**: Update operations support synchronous (`SYNC`) and asynchronous (`ASYNC`) save modes for different performance requirements.

#### Method: `database.getRows`

**Description:**  
Retrieves rows from the database collection with optional filtering, sorting, and pagination support. Supports MongoDB-style queries for complex filtering.

**Parameters:**
- `options` (object, optional): Query options including:
  - `query` (object, optional): MongoDB-style query object with `$and`, `$or` operators
  - `sort` (array, optional): Sort configuration `[{column: 'fieldName', sort: 'asc|desc'}]`
  - `limit` (number, optional): Maximum number of rows to return (default: 50)
  - `page` (number, optional): Page number for pagination (default: 0)
  - `search` (string, optional): Text search across collection
  - `hasOptimiseResponse` (boolean, optional): Optimize response size (default: false)
  - `useHumanReadableNames` (boolean, optional): Use readable column names (default: false)
- `callOptions` (object): API call options including `authType`

**Returns:**  
Returns a `Promise` that resolves to:
- Array of rows with count information
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
  { authType: 'auth-token' }
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
- `callOptions` (object): API call options including `authType`

**Returns:**  
Returns a `Promise` that resolves to:
- Count object with total number
- Server error

**Example:**
```javascript
const result = await usersDb.countRows(
  { query: { "$and": [{ "data.status": { "$eq": "active" } }] } },
  { authType: 'auth-token' }
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
- `callOptions` (object): API call options including `authType`

**Returns:**  
Returns a `Promise` that resolves to:
- Single row data object
- Server error

**Example:**
```javascript
const result = await usersDb.getRow(
  '60a7c8b8f123456789abcdef', 
  { useHumanReadableNames: true },
  { authType: 'auth-token' }
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
- `callOptions` (object): API call options including `authType`

**Returns:**  
Returns a `Promise` that resolves to:
- Created row data object
- Server error

**Example:**
```javascript
const result = await usersDb.createRow(
  { name: 'John Doe', email: 'john@example.com', status: 'active' },
  { notice: 'Created via API' },
  { authType: 'auth-token' }
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
  - `saveMode` (string, optional): Save operation mode - 'SYNC' or 'ASYNC' (default: 'SYNC')
  - `useHumanReadableNames` (boolean, optional): Use readable column names in response (default: false)
- `callOptions` (object): API call options including `authType`

**Returns:**  
Returns a `Promise` that resolves to:
- Updated row data object
- Server error

**Example:**
```javascript
const result = await usersDb.updateRow(
  '60a7c8b8f123456789abcdef',
  { status: 'inactive' },
  { notice: 'Deactivated user' },
  { authType: 'auth-token' }
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
- `callOptions` (object): API call options including `authType`

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
  { authType: 'auth-token' }
);
```

<br>

#### Method: `database.deleteRow`

**Description:**  
Deletes a single row by its unique identifier.

**Parameters:**
- `rowId` (string): The unique ID of the row to delete
- `callOptions` (object): API call options including `authType`

**Returns:**  
Returns a `Promise` that resolves to:
- Delete operation result
- Server error

**Example:**
```javascript
const result = await usersDb.deleteRow('60a7c8b8f123456789abcdef', { authType: 'auth-token' });
```

<br>

#### Method: `database.deleteRows`

**Description:**  
Deletes multiple rows by their unique identifiers in a single operation.

**Parameters:**
- `rowIds` (array): Array of row IDs to delete
- `callOptions` (object): API call options including `authType`

**Returns:**  
Returns a `Promise` that resolves to:
- Delete operation result with counts
- Server error

**Example:**
```javascript
const result = await usersDb.deleteRows(
  ['60a7c8b8f123456789abcdef', '60a7c8b8f123456789abcdeg'],
  { authType: 'auth-token' }
);
```

<br>

#### Method: `database.triggerButton`

**Description:**  
Triggers a button action on a specific row. This is used for executing custom workflows or actions defined in your EMD Cloud collection.

**Parameters:**
- `rowId` (string): The unique ID of the row containing the button
- `columnId` (string): The ID of the column containing the button to trigger
- `callOptions` (object): API call options including `authType`

**Returns:**  
Returns a `Promise` that resolves to:
- Trigger action result
- Server error

**Example:**
```javascript
const result = await ordersDb.triggerButton(
  '60a7c8b8f123456789abcdef',
  'approve-button-column-id',
  { authType: 'auth-token' }
);
```

<br>

## Conclusion

Ensure that you provide the necessary parameters when creating an instance and handle any validation errors. This class can be integrated into various applications to interact with EMD Cloud.
