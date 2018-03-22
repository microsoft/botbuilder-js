[Bot Builder SDK - AI](../README.md) > [LanguageTranslator](../classes/botbuilder_ai.languagetranslator.md)



# Class: LanguageTranslator


The LanguageTranslator will use the Text Translator Cognitive service to translate text from a source language to one of the native languages that the bot speaks. By adding it to the middleware pipeline you will automatically get a translated experience, and also a LUIS model allowing the user to ask to speak a language.

## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder_ai.languagetranslator.md#constructor)


### Methods

* [onProcessRequest](botbuilder_ai.languagetranslator.md#onprocessrequest)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new LanguageTranslator**(settings: *[TranslatorSettings](../interfaces/botbuilder_ai.translatorsettings.md)*): [LanguageTranslator](botbuilder_ai.languagetranslator.md)


*Defined in [libraries/botbuilder-ai/lib/languageTranslator.d.ts:25](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-ai/lib/languageTranslator.d.ts#L25)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [TranslatorSettings](../interfaces/botbuilder_ai.translatorsettings.md)   |  - |





**Returns:** [LanguageTranslator](botbuilder_ai.languagetranslator.md)

---


## Methods
<a id="onprocessrequest"></a>

###  onProcessRequest

► **onProcessRequest**(context: *`BotContext`*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-ai/lib/languageTranslator.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-ai/lib/languageTranslator.d.ts#L27)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___


