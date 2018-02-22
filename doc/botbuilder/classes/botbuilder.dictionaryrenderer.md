[Bot Builder SDK - Core](../README.md) > [DictionaryRenderer](../classes/botbuilder.dictionaryrenderer.md)



# Class: DictionaryRenderer


This is a simple template renderer which has a resource map of template functions let myTemplates = { "en" : { "templateId": (context, data) => `your name is ${data.name}` } }

To use, simply add to your pipeline bot.use(new DictionaryRenderer(myTemplates))

## Implements

* [TemplateRenderer](../interfaces/botbuilder.templaterenderer.md)
* [Middleware](../interfaces/botbuilder.middleware.md)

## Index

### Constructors

* [constructor](botbuilder.dictionaryrenderer.md#constructor)


### Methods

* [contextCreated](botbuilder.dictionaryrenderer.md#contextcreated)
* [renderTemplate](botbuilder.dictionaryrenderer.md#rendertemplate)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new DictionaryRenderer**(templates: *[TemplateDictionary](../#templatedictionary)*): [DictionaryRenderer](botbuilder.dictionaryrenderer.md)


*Defined in [libraries/botbuilder/lib/dictionaryRenderer.d.ts:36](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/dictionaryRenderer.d.ts#L36)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| templates | [TemplateDictionary](../#templatedictionary)   |  - |





**Returns:** [DictionaryRenderer](botbuilder.dictionaryrenderer.md)

---


## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/dictionaryRenderer.d.ts:38](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/dictionaryRenderer.d.ts#L38)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="rendertemplate"></a>

###  renderTemplate

► **renderTemplate**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, language: *`string`*, templateId: *`string`*, data: *`any`*): `Promise`.<[Partial]()[Activity](../interfaces/botbuilder.activity.md)⎮`string`⎮`undefined`>



*Implementation of [TemplateRenderer](../interfaces/botbuilder.templaterenderer.md).[renderTemplate](../interfaces/botbuilder.templaterenderer.md#rendertemplate)*

*Defined in [libraries/botbuilder/lib/dictionaryRenderer.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/dictionaryRenderer.d.ts#L39)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| language | `string`   |  - |
| templateId | `string`   |  - |
| data | `any`   |  - |





**Returns:** `Promise`.<[Partial]()[Activity](../interfaces/botbuilder.activity.md)⎮`string`⎮`undefined`>





___


