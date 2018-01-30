[Bot Builder SDK - AI](../README.md) > [LanguageTranslator](../classes/botbuilder_ai.languagetranslator.md)



# Class: LanguageTranslator


The LanguageTranslator will use the Text Translator Cognitive service to translate text from a source language to one of the native languages that the bot speaks. By adding it to the middleware pipeline you will automatically get a translated experience, and also a LUIS model allowing the user to ask to speak a language.

## Implements

* [Middleware]()

## Index

### Constructors

* [constructor](botbuilder_ai.languagetranslator.md#constructor)


### Properties

* [luisAccessKey](botbuilder_ai.languagetranslator.md#luisaccesskey)
* [luisAppId](botbuilder_ai.languagetranslator.md#luisappid)
* [nativeLanguages](botbuilder_ai.languagetranslator.md#nativelanguages)


### Methods

* [postActivity](botbuilder_ai.languagetranslator.md#postactivity)
* [receiveActivity](botbuilder_ai.languagetranslator.md#receiveactivity)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new LanguageTranslator**(translatorKey: *`string`*, nativeLanguages: *`string`[]*, luisAppId: *`string`*, luisAccessKey: *`string`*): [LanguageTranslator](botbuilder_ai.languagetranslator.md)


*Defined in [libraries/botbuilder-ai/lib/languageTranslator.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-ai/lib/languageTranslator.d.ts#L21)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| translatorKey | `string`   |  - |
| nativeLanguages | `string`[]   |  - |
| luisAppId | `string`   |  - |
| luisAccessKey | `string`   |  - |





**Returns:** [LanguageTranslator](botbuilder_ai.languagetranslator.md)

---


## Properties
<a id="luisaccesskey"></a>

### «Protected» luisAccessKey

**●  luisAccessKey**:  *`string`* 

*Defined in [libraries/botbuilder-ai/lib/languageTranslator.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-ai/lib/languageTranslator.d.ts#L19)*





___

<a id="luisappid"></a>

### «Protected» luisAppId

**●  luisAppId**:  *`string`* 

*Defined in [libraries/botbuilder-ai/lib/languageTranslator.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-ai/lib/languageTranslator.d.ts#L18)*





___

<a id="nativelanguages"></a>

### «Protected» nativeLanguages

**●  nativeLanguages**:  *`string`[]* 

*Defined in [libraries/botbuilder-ai/lib/languageTranslator.d.ts:17](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-ai/lib/languageTranslator.d.ts#L17)*





___


## Methods
<a id="postactivity"></a>

###  postActivity

► **postActivity**(context: *[BotContext]()*, activities: *[Activity]()[]*, next: *`function`*): `Promise`.<[ConversationResourceResponse]()[]>



*Defined in [libraries/botbuilder-ai/lib/languageTranslator.d.ts:24](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-ai/lib/languageTranslator.d.ts#L24)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  - |
| activities | [Activity]()[]   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<[ConversationResourceResponse]()[]>





___

<a id="receiveactivity"></a>

###  receiveActivity

► **receiveActivity**(context: *[BotContext]()*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-ai/lib/languageTranslator.d.ts:23](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-ai/lib/languageTranslator.d.ts#L23)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___


