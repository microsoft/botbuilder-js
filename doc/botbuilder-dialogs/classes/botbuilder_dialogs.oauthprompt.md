[Bot Builder SDK - Dialogs](../README.md) > [OAuthPrompt](../classes/botbuilder_dialogs.oauthprompt.md)



# Class: OAuthPrompt


:package: **botbuilder-dialogs**

Creates a new prompt that asks the user to sign in using the Bot Frameworks Single Sign On (SSO) service. The prompt will attempt to retrieve the users current token and if the user isn't signed in, it will send them an `OAuthCard` containing a button they can press to signin. Depending on the channel, the user will be sent through one of two possible signin flows:

*   The automatic signin flow where once the user signs in and the SSO service will forward the bot the users access token using either an `event` or `invoke` activity.
*   The "magic code" flow where where once the user signs in they will be prompted by the SSO service to send the bot a six digit code confirming their identity. This code will be sent as a standard `message` activity.

Both flows are automatically supported by the `OAuthPrompt` and the only thing you need to be careful of is that you don't block the `event` and `invoke` activities that the prompt might be waiting on.

Like other prompts, the `OAuthPrompt` can be used either as a dialog added to your bots `DialogSet` or on its own as a control if your bot is using some other conversation management system.

### Dialog Usage

When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted to signin as needed and their access token will be passed as an argument to the callers next waterfall step:

    const { DialogSet, OAuthPrompt } = require('botbuilder-dialogs');

    const dialogs = new DialogSet();

    dialogs.add('loginPrompt', new OAuthPrompt({
       connectionName: 'GitConnection',
       title: 'Login To GitHub',
       timeout: 300000   // User has 5 minutes to login
    }));

    dialogs.add('taskNeedingLogin', [
         async function (dc) {
             await dc.begin('loginPrompt');
         },
         async function (dc, token) {
             if (token) {
                 // Continue with task needing access token
             } else {
                 await dc.context.sendActivity(`Sorry... We couldn't log you in. Try again later.`);
                 await dc.end();
             }
         }
    ]);

### Control Usage

If your bot isn't dialog based you can still use the prompt on its own as a control. You will just need start the prompt from somewhere within your bots logic by calling the prompts `begin()` method:

    const state = {};
    const prompt = new OAuthPrompt({
       connectionName: 'GitConnection',
       title: 'Login To GitHub'
    });
    const result = await prompt.begin(context, state);
    if (!result.active) {
        const token = result.result;
    }

If the user is already signed into the service we will get a token back immediately. We therefore need to check to see if the prompt is still active after the call to `begin()`.

If the prompt is still active that means the user was sent an `OAuthCard` prompting the user to signin and we need to pass any additional activities we receive to the `continue()` method. We can't be certain which auth flow is being used so it's best to route _all_ activities, regardless of type, to the `continue()` method for processing.

    const prompt = new OAuthPrompt({
       connectionName: 'GitConnection',
       title: 'Login To GitHub'
    });
    const result = await prompt.continue(context, state);
    if (!result.active) {
        const token = result.result;
        if (token) {
            // User has successfully signed in
        } else {
            // The signin has timed out
        }
    }

## Type parameters
#### C :  `TurnContext`

The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.

#### R 
#### O 
## Hierarchy


 [Control](botbuilder_dialogs.control.md)`C`

**↳ OAuthPrompt**







## Implements

* [Dialog](../interfaces/botbuilder_dialogs.dialog.md)`C`

## Index

### Constructors

* [constructor](botbuilder_dialogs.oauthprompt.md#constructor)


### Properties

* [defaultOptions](botbuilder_dialogs.oauthprompt.md#defaultoptions)


### Methods

* [begin](botbuilder_dialogs.oauthprompt.md#begin)
* [continue](botbuilder_dialogs.oauthprompt.md#continue)
* [dialogBegin](botbuilder_dialogs.oauthprompt.md#dialogbegin)
* [dialogContinue](botbuilder_dialogs.oauthprompt.md#dialogcontinue)
* [signOutUser](botbuilder_dialogs.oauthprompt.md#signoutuser)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new OAuthPrompt**(settings: *[OAuthPromptSettingsWithTimeout](../interfaces/botbuilder_dialogs.oauthpromptsettingswithtimeout.md)*, validator?: *`prompts.PromptValidator`.<`any`>,.<`any`>*): [OAuthPrompt](botbuilder_dialogs.oauthprompt.md)


*Overrides [Control](botbuilder_dialogs.control.md).[constructor](botbuilder_dialogs.control.md#constructor)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/oauthPrompt.d.ts:126](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/prompts/oauthPrompt.d.ts#L126)*



Creates a new `OAuthPrompt` instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [OAuthPromptSettingsWithTimeout](../interfaces/botbuilder_dialogs.oauthpromptsettingswithtimeout.md)   |  Settings used to configure the prompt. |
| validator | `prompts.PromptValidator`.<`any`>,.<`any`>   |  (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent. |





**Returns:** [OAuthPrompt](botbuilder_dialogs.oauthprompt.md)

---


## Properties
<a id="defaultoptions"></a>

### «Protected» defaultOptions

**●  defaultOptions**:  *`O`* 

*Inherited from [Control](botbuilder_dialogs.control.md).[defaultOptions](botbuilder_dialogs.control.md#defaultoptions)*

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/control.d.ts#L27)*





___


## Methods
<a id="begin"></a>

###  begin

► **begin**(context: *`C`*, state: *`object`*, options?: *`O`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>



*Inherited from [Control](botbuilder_dialogs.control.md).[begin](botbuilder_dialogs.control.md#begin)*

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:51](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/control.d.ts#L51)*



Starts the control. Depending on the control, its possible for the control to finish immediately so it's advised to check the result object returned by `begin()` and ensure that the control is still active before continuing.

**Usage Example:**

    const state = {};
    const result = await control.begin(context, state);
    if (!result.active) {
        const value = result.result;
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `C`   |  Context for the current turn of the conversation with the user. |
| state | `object`   |  A state object that the control will use to persist its current state. This should be an empty object which the control will populate. The bot should persist this with its other conversation state for as long as the control is still active. |
| options | `O`   |  (Optional) additional options supported by the control. |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>





___

<a id="continue"></a>

###  continue

► **continue**(context: *`C`*, state: *`object`*): `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>



*Inherited from [Control](botbuilder_dialogs.control.md).[continue](botbuilder_dialogs.control.md#continue)*

*Defined in [libraries/botbuilder-dialogs/lib/control.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/control.d.ts#L68)*



Passes a users reply to the control for further processing. The bot should keep calling `continue()` for future turns until the control returns a result with `Active == false`. To cancel or interrupt the prompt simply delete the `state` object being persisted.

**Usage Example:**

    const result = await control.continue(context, state);
    if (!result.active) {
        const value = result.result;
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `C`   |  Context for the current turn of the conversation with the user. |
| state | `object`   |  A state object that was previously initialized by a call to [begin()](#begin). |





**Returns:** `Promise`.<[DialogResult](../interfaces/botbuilder_dialogs.dialogresult.md)`R`>





___

<a id="dialogbegin"></a>

###  dialogBegin

► **dialogBegin**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*, options: *[PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)*): `Promise`.<`any`>



*Overrides [Control](botbuilder_dialogs.control.md).[dialogBegin](botbuilder_dialogs.control.md#dialogbegin)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/oauthPrompt.d.ts:133](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/prompts/oauthPrompt.d.ts#L133)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |
| options | [PromptOptions](../interfaces/botbuilder_dialogs.promptoptions.md)   |  - |





**Returns:** `Promise`.<`any`>





___

<a id="dialogcontinue"></a>

###  dialogContinue

► **dialogContinue**(dc: *[DialogContext](botbuilder_dialogs.dialogcontext.md)`C`*): `Promise`.<`any`>



*Implementation of [Dialog](../interfaces/botbuilder_dialogs.dialog.md).[dialogContinue](../interfaces/botbuilder_dialogs.dialog.md#dialogcontinue)*

*Defined in [libraries/botbuilder-dialogs/lib/prompts/oauthPrompt.d.ts:134](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/prompts/oauthPrompt.d.ts#L134)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| dc | [DialogContext](botbuilder_dialogs.dialogcontext.md)`C`   |  - |





**Returns:** `Promise`.<`any`>





___

<a id="signoutuser"></a>

###  signOutUser

► **signOutUser**(context: *`TurnContext`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-dialogs/lib/prompts/oauthPrompt.d.ts:149](https://github.com/Microsoft/botbuilder-js/blob/ad875d1/libraries/botbuilder-dialogs/lib/prompts/oauthPrompt.d.ts#L149)*



Signs the user out of the service.

**Usage Example:**

    const prompt = new OAuthPrompt({
       connectionName: 'GitConnection',
       title: 'Login To GitHub'
    });
    await prompt.signOutUser(context);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `TurnContext`   |  - |





**Returns:** `Promise`.<`void`>





___


