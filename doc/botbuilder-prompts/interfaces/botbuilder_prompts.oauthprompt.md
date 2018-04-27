[Bot Builder SDK - Prompts](../README.md) > [OAuthPrompt](../interfaces/botbuilder_prompts.oauthprompt.md)



# Interface: OAuthPrompt


:package: **botbuilder-prompts**

Prompts the user to sign in using the Bot Frameworks Single Sign On (SSO) service.

**Usage Example:**

    const { createOAuthPrompt } = require('botbuilder-prompts');

    const loginPrompt = createOAuthPrompt({
       connectionName: 'GitConnection',
       title: 'Login To GitHub'
    });

## Type parameters
#### O 

(Optional) type of result returned by the [recognize()](#recognize) method. This defaults to an instance of `TokenResponse` but can be changed by the prompts custom validator.


## Methods
<a id="getusertoken"></a>

###  getUserToken

► **getUserToken**(context: *[TurnContext]()*): `Promise`.<`O`⎮`undefined`>



*Defined in [libraries/botbuilder-prompts/lib/oauthPrompt.d.ts:101](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/oauthPrompt.d.ts#L101)*



Attempts to retrieve the cached token for a signed in user. You will generally want to call this before calling [prompt()](#prompt) to send the user a signin card.

**Usage Example:**

    const token = await loginPrompt.getUserToken(context);
    if (!token) {
       await loginPrompt.prompt(context);
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext]()   |  Context for the current turn of conversation. |





**Returns:** `Promise`.<`O`⎮`undefined`>





___

<a id="prompt"></a>

###  prompt

► **prompt**(context: *[TurnContext]()*, prompt?: *[Partial]()[Activity]()*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-prompts/lib/oauthPrompt.d.ts:57](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/oauthPrompt.d.ts#L57)*



Sends a formated prompt to the user.

An `OAuthCard` will be automatically created and sent to the user requesting them to signin. If you need to localize the card or customize the message sent to the user for any reason you can pass in the `Activity` to send. This should just be an activity of type `message` and contain at least one attachment that's an `OAuthCard`.

**Usage Example:**

    await loginPrompt.prompt(context);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext]()   |  Context for the current turn of conversation. |
| prompt | [Partial]()[Activity]()   |  (Optional) activity to send along the user. This should include an attachment containing an `OAuthCard`. If ommited, an activity will be automatically generated. |





**Returns:** `Promise`.<`void`>





___

<a id="recognize"></a>

###  recognize

► **recognize**(context: *[TurnContext]()*): `Promise`.<`O`⎮`undefined`>



*Defined in [libraries/botbuilder-prompts/lib/oauthPrompt.d.ts:86](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/oauthPrompt.d.ts#L86)*



Attempts to resolve the token after [prompt()](#prompt) has been called. There are two core flows that need to be supported to complete a users signin:

*   The automatic signin flow where the SSO service will forward the bot the users access token using either an `event` or `invoke` activity.
*   The "magic code" flow where a user is prompted by the SSO service to send the bot a six digit code confirming their identity. This code will be sent as a standard `message` activity.

The `recognize()` method automatically handles both flows for the bot but you should ensure that you don't accidentally filter out the `event` and `invoke` activities before calling recognize(). Because of this we generally recommend you put the call to recognize() towards the beginning of your bot logic.

You should also be prepared for the case where the user fails to enter the correct "magic code" or simply decides they don't want to click the signin button.

**Usage Example:**

    const token = await loginPrompt.recognize(context);
    if (token) {
       // Save token and continue.
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext]()   |  Context for the current turn of conversation. |





**Returns:** `Promise`.<`O`⎮`undefined`>





___

<a id="signoutuser"></a>

###  signOutUser

► **signOutUser**(context: *[TurnContext]()*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-prompts/lib/oauthPrompt.d.ts:112](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/oauthPrompt.d.ts#L112)*



Signs the user out of the service.

**Usage Example:**

    await loginPrompt.signOutUser(context);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext]()   |  Context for the current turn of conversation. |





**Returns:** `Promise`.<`void`>





___


