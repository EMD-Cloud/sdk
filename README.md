# SDK EMD Cloud Documentation

-   [Overview](#overview)
-   [Get started](#get-started)
-   [Usage](#usage)
    -   [Creating an instance](#creating-an-instance)
    -   [Parameters](#parameters)
-   [Methods](#methods)
    -   [Basic methods](#basic-methods)
        -   [Method: setAuthToken(token)](#method-setauthtokentoken)
    -   [Auth methods](#auth-methods)
        -   [Method: auth.authorization](#method-authauthorization)
        -   [Method: auth.login](#method-authlogin)
        -   [Method: auth.registration](#method-authregistration)
        -   [Method: auth.forgotPassword](#method-authforgotpassword)
        -   [Method: auth.forgotPasswordCheckCode](#method-authforgotpasswordcheckcode)
        -   [Method: auth.forgotPasswordChange](#method-authforgotpasswordchange)
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
4. Invoke the EmdCloud class in your application:
	```javascript
	import { EmdCloud } from  '@emd-cloud/sdk';

	const emdCloud =  new  EmdCloud({
		appId: '<your-app-id>',
		token: '<your-token>'
	});
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
    token: 'your-auth-token' // Required if server mode is selected
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

#### Method:  `setAuthToken(token)`

**Description:**  Sets the authentication token for the instance. The token must be a string.

**Example:**
```javascript
emdCloud.setAuthToken('new-auth-token')
```

----------

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

----------

#### Method:  `auth.login`

**Description:**  
This method authenticates the user using their login and password. It sends a POST request to the server to log in the user.

**Parameters:**

-   `login`  (string): the user's login.
-   `password`  (string): the user's password.

**Returns:**  
Returns a  `Promise`  that resolves to one of the following:

-   `UserData`: user data, including the token.
-   `ServerError`: server error.

**Example:**
```javascript
await emdCloud.auth.login({
    login: 'example@mail.com',
    password: 'myP@55word'
}) // On success, will return user data
```

----------

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

-   user data, including the token
-   server error

**Example:**
```javascript
await emdCloud.auth.registration({
    firstName: 'John',
    lastName: 'Jonathan',
    login: 'example@mail.com',
    password: 'you-password'
}) // On success, will return user data
```

----------

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

----------

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

## Conclusion

Ensure that you provide the necessary parameters when creating an instance and handle any validation errors. This class can be integrated into various applications to interact with EMD Cloud.
