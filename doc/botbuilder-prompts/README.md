


#  botbuilder-prompts


## Index

### Enumerations

* [ListStyle](enums/botbuilder_prompts.liststyle.md)


### Interfaces

* [AttachmentPrompt](interfaces/botbuilder_prompts.attachmentprompt.md)
* [ChoicePrompt](interfaces/botbuilder_prompts.choiceprompt.md)
* [ConfirmChoices](interfaces/botbuilder_prompts.confirmchoices.md)
* [ConfirmPrompt](interfaces/botbuilder_prompts.confirmprompt.md)
* [DatetimePrompt](interfaces/botbuilder_prompts.datetimeprompt.md)
* [FoundDatetime](interfaces/botbuilder_prompts.founddatetime.md)
* [NumberPrompt](interfaces/botbuilder_prompts.numberprompt.md)
* [OAuthPrompt](interfaces/botbuilder_prompts.oauthprompt.md)
* [OAuthPromptSettings](interfaces/botbuilder_prompts.oauthpromptsettings.md)
* [TextPrompt](interfaces/botbuilder_prompts.textprompt.md)


### Type aliases

* [PromptValidator](#promptvalidator)


### Functions

* [createAttachmentPrompt](#createattachmentprompt)
* [createChoicePrompt](#createchoiceprompt)
* [createConfirmPrompt](#createconfirmprompt)
* [createDatetimePrompt](#createdatetimeprompt)
* [createNumberPrompt](#createnumberprompt)
* [createOAuthPrompt](#createoauthprompt)
* [createTextPrompt](#createtextprompt)



---
## Type aliases
<a id="promptvalidator"></a>

###  PromptValidator

**Τ PromptValidator**:  *`function`* 

*Defined in [libraries/botbuilder-prompts/lib/textPrompt.d.ts:66](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/textPrompt.d.ts#L66)*



:package: **botbuilder-prompts**

Signature of a handler that can be passed to a prompt to provide additional validation logic or to customize the reply sent to the user when their response is invalid.
*__param__*: Type of value that will recognized and passed to the validator as input.

*__param__*: Type of output that will be returned by the validator. This can be changed from the input type by the validator.


#### Type declaration
►(context: *[TurnContext]()*, value: *`R`⎮`undefined`*): [Promiseable]()`O`⎮`undefined`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext]()   |  Context for the current turn of conversation. |
| value | `R`⎮`undefined`   |  The value that was recognized or `undefined` if not recognized. |





**Returns:** [Promiseable]()`O`⎮`undefined`






___


## Functions
<a id="createattachmentprompt"></a>

###  createAttachmentPrompt

► **createAttachmentPrompt**O(validator?: *[PromptValidator](#promptvalidator)[Attachment]()[], `O`*): [AttachmentPrompt](interfaces/botbuilder_prompts.attachmentprompt.md)`O`



*Defined in [libraries/botbuilder-prompts/lib/attachmentPrompt.d.ts:84](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/attachmentPrompt.d.ts#L84)*



:package: **botbuilder-prompts**

Creates a new prompt that asks the user to upload one or more attachments.

**Usage Example:**

    const { createAttachmentPrompt } = require('botbuilder-prompts');

    const imagePrompt = createAttachmentPrompt(async (context, values) => {
       if (values && values.length > 0) {
          for (let i = 0; i < values.length; i++) {
             if (!values[i].contentType.startsWith('image')) {
                await imagePrompt.prompt(context, `Only images are accepted.`);
                return undefined;
             }
          }
       } else {
          await imagePrompt.prompt(context, `Please upload at least one image.`);
       }
       return values;
    });


**Type parameters:**

#### O 

(Optional) type of result returned by the `recognize()` method. This defaults to an `attachment[]` but can be changed by the prompts custom validator.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](#promptvalidator)[Attachment]()[], `O`   |  (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid. |





**Returns:** [AttachmentPrompt](interfaces/botbuilder_prompts.attachmentprompt.md)`O`





___

<a id="createchoiceprompt"></a>

###  createChoicePrompt

► **createChoicePrompt**O(validator?: *[PromptValidator](#promptvalidator)[FoundChoice](), `O`*, defaultLocale?: *`undefined`⎮`string`*): [ChoicePrompt](interfaces/botbuilder_prompts.choiceprompt.md)`O`



*Defined in [libraries/botbuilder-prompts/lib/choicePrompt.d.ts:119](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/choicePrompt.d.ts#L119)*



:package: **botbuilder-prompts**

Creates a new prompt that asks the user to select from a list of choices.

**Usage Example:**

    const { createChoicePrompt } = require('botbuilder-prompts');

    const colorPrompt = createChoicePrompt(async (context, found) => {
       if (!found) {
          await colorPrompt.prompt(context, ['red', 'green', 'blue'], `Please choose a color from the list or say "cancel".`);
       }
       return found;
    });


**Type parameters:**

#### O 

(Optional) type of result returned by the `recognize()` method. This defaults to an instance of `FoundChoice` but can be changed by the prompts custom validator.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](#promptvalidator)[FoundChoice](), `O`   |  (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid. |
| defaultLocale | `undefined`⎮`string`   |  (Optional) locale to use if `context.activity.locale` not specified. Defaults to a value of `en-us`. |





**Returns:** [ChoicePrompt](interfaces/botbuilder_prompts.choiceprompt.md)`O`





___

<a id="createconfirmprompt"></a>

###  createConfirmPrompt

► **createConfirmPrompt**O(validator?: *[PromptValidator](#promptvalidator)`O`*, defaultLocale?: *`undefined`⎮`string`*): [ConfirmPrompt](interfaces/botbuilder_prompts.confirmprompt.md)`O`



*Defined in [libraries/botbuilder-prompts/lib/confirmPrompt.d.ts:134](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/confirmPrompt.d.ts#L134)*



:package: **botbuilder-prompts**

Creates a new prompt that asks the user to answer a yes/no question.

**Usage Example:**

    const { createConfirmPrompt } = require('botbuilder-prompts');

    const confirmPrompt = createConfirmPrompt(async (context, confirmed) => {
       if (typeof confirmed != 'boolean') {
          await confirmPrompt.prompt(context, `Please answer "yes" or "no".`);
       }
       return confirmed;
    });


**Type parameters:**

#### O 

(Optional) type of result returned by the `recognize()` method. This defaults to a boolean `true` or `false` but can be changed by the prompts custom validator.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](#promptvalidator)`O`   |  (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid. |
| defaultLocale | `undefined`⎮`string`   |  (Optional) locale to use if `context.activity.locale` is not specified. Defaults to a value of `en-us`. |





**Returns:** [ConfirmPrompt](interfaces/botbuilder_prompts.confirmprompt.md)`O`





___

<a id="createdatetimeprompt"></a>

###  createDatetimePrompt

► **createDatetimePrompt**O(validator?: *[PromptValidator](#promptvalidator)[FoundDatetime](interfaces/botbuilder_prompts.founddatetime.md)[], `O`*, defaultLocale?: *`undefined`⎮`string`*): [DatetimePrompt](interfaces/botbuilder_prompts.datetimeprompt.md)`O`



*Defined in [libraries/botbuilder-prompts/lib/datetimePrompt.d.ts:114](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/datetimePrompt.d.ts#L114)*



:package: **botbuilder-prompts**

Creates a new prompt that asks the user to reply with a date or time.

**Usage Example:**

    const { createDatetimePrompt } = require('botbuilder-prompts');

    const timePrompt = createDatetimePrompt(async (context, values) => {
       try {
          if (!Array.isArray(values) || values.length < 0) { throw new Error('missing time') }
          if (values[0].type !== 'datetime') { throw new Error('unsupported type') }
          const value = new Date(values[0].value);
          if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
          return value;
       } catch (err) {
          await timePrompt.prompt(context, `Answer with a time in the future like "tomorrow at 9am" or say "cancel".`);
          return undefined;
       }
    });


**Type parameters:**

#### O 

(Optional) type of result returned by the `recognize()` method. This defaults to an instance of `FoundDateTime` but can be changed by the prompts custom validator.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](#promptvalidator)[FoundDatetime](interfaces/botbuilder_prompts.founddatetime.md)[], `O`   |  (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid. |
| defaultLocale | `undefined`⎮`string`   |  (Optional) locale to use if `context.activity.locale` not specified. Defaults to a value of `en-us`. |





**Returns:** [DatetimePrompt](interfaces/botbuilder_prompts.datetimeprompt.md)`O`





___

<a id="createnumberprompt"></a>

###  createNumberPrompt

► **createNumberPrompt**O(validator?: *[PromptValidator](#promptvalidator)`number`, `O`*, defaultLocale?: *`undefined`⎮`string`*): [NumberPrompt](interfaces/botbuilder_prompts.numberprompt.md)`O`



*Defined in [libraries/botbuilder-prompts/lib/numberPrompt.d.ts:82](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/numberPrompt.d.ts#L82)*



:package: **botbuilder-prompts**

Creates a new prompt that asks the user to reply with a number.

**Usage Example:**

    const { createNumberPrompt } = require('botbuilder-prompts');

    const agePrompt = createNumberPrompt(async (context, value) => {
       if (typeof value == 'number') {
          if (value >= 1 && value < 111) {
             // Return age rounded down to nearest whole number.
             return Math.floor(value);
          }
       }
       await agePrompt.prompt(context, `Please enter a number between 1 and 110 or say "cancel".`);
       return undefined;
    });


**Type parameters:**

#### O 

(Optional) type of result returned by the `recognize()` method. This defaults to `number` but can be changed by the prompts custom validator.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](#promptvalidator)`number`, `O`   |  (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid. |
| defaultLocale | `undefined`⎮`string`   |  (Optional) locale to use if `context.activity.locale` not specified. Defaults to a value of `en-us`. |





**Returns:** [NumberPrompt](interfaces/botbuilder_prompts.numberprompt.md)`O`





___

<a id="createoauthprompt"></a>

###  createOAuthPrompt

► **createOAuthPrompt**O(settings: *[OAuthPromptSettings](interfaces/botbuilder_prompts.oauthpromptsettings.md)*, validator?: *[PromptValidator](#promptvalidator)[TokenResponse](), `O`*): [OAuthPrompt](interfaces/botbuilder_prompts.oauthprompt.md)`O`



*Defined in [libraries/botbuilder-prompts/lib/oauthPrompt.d.ts:154](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/oauthPrompt.d.ts#L154)*



:package: **botbuilder-prompts**

Creates a new prompt that asks the user to sign in using the Bot Frameworks Single Sign On (SSO) service.

**Usage Example:**

    async function ensureLogin(context, state, botLogic) {
       const now = new Date().getTime();
       if (state.token && now < (new Date(state.token.expiration).getTime() - 60000)) {
          return botLogic(context);
       } else {
          const loginPrompt = createOAuthPrompt({
              connectionName: 'GitConnection',
              title: 'Login To GitHub'
          });
          const token = await state.loginActive ? loginPrompt.recognize(context) : loginPrompt.getUserToken(context);
          if (token) {
              state.loginActive = false;
              state.token = token;
              return botLogic(context);
          } else if (context.activity.type === 'message') {
              if (!state.loginActive) {
                  state.loginActive = true;
                  state.loginStart = now;
                  await loginPrompt.prompt(context);
              } else if (now >= (state.loginStart + (5 * 60 * 1000))) {
                  state.loginActive = false;
                  await context.sendActivity(`We're having a problem logging you in. Please try again later.`);
              }
          }
       }
    }


**Type parameters:**

#### O 

(Optional) type of result returned by the `recognize()` method. This defaults to an instance of `TokenResponse` but can be changed by the prompts custom validator.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [OAuthPromptSettings](interfaces/botbuilder_prompts.oauthpromptsettings.md)   |  Configuration settings for the OAuthPrompt. |
| validator | [PromptValidator](#promptvalidator)[TokenResponse](), `O`   |  (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid. |





**Returns:** [OAuthPrompt](interfaces/botbuilder_prompts.oauthprompt.md)`O`





___

<a id="createtextprompt"></a>

###  createTextPrompt

► **createTextPrompt**O(validator?: *[PromptValidator](#promptvalidator)`string`, `O`*): [TextPrompt](interfaces/botbuilder_prompts.textprompt.md)`O`



*Defined in [libraries/botbuilder-prompts/lib/textPrompt.d.ts:88](https://github.com/Microsoft/botbuilder-js/blob/b50d910/libraries/botbuilder-prompts/lib/textPrompt.d.ts#L88)*



:package: **botbuilder-prompts**

Creates a new prompt that asks the user to enter some text.

**Usage Example:**

    const { createTextPrompt } = require('botbuilder-prompts');

    const namePrompt = createTextPrompt(async (context, value) => {
       if (value && value.length >= 3) {
          return value;
       }
       await namePrompt.prompt(context, `Your entry must be at least 3 characters in length.`);
       return undefined;
    });


**Type parameters:**

#### O 

(Optional) type of result returned by the `recognize()` method. This defaults to return a `string` but can be changed by the prompts custom validator.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| validator | [PromptValidator](#promptvalidator)`string`, `O`   |  (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid. |





**Returns:** [TextPrompt](interfaces/botbuilder_prompts.textprompt.md)`O`





___


