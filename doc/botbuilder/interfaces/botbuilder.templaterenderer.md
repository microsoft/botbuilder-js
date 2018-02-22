[Bot Builder SDK - Core](../README.md) > [TemplateRenderer](../interfaces/botbuilder.templaterenderer.md)



# Interface: TemplateRenderer


Interface for a template renderer which provides the ability to create a text reply or activity reply from the language, templateid and data object

## Implemented by

* [DictionaryRenderer](../classes/botbuilder.dictionaryrenderer.md)
* [JsonTemplates](../classes/botbuilder.jsontemplates.md)


## Methods
<a id="rendertemplate"></a>

###  renderTemplate

► **renderTemplate**(context: *[BotContext](botbuilder.__global.botcontext.md)*, language: *`string`*, templateId: *`string`*, data: *`any`*): `Promise`.<[Partial]()[Activity](botbuilder.activity.md)⎮`string`⎮`undefined`>



*Defined in [libraries/botbuilder/lib/templateManager.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/templateManager.d.ts#L21)*



renders a template for the language/templateId


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.__global.botcontext.md)   |  - |
| language | `string`   |  id (such as 'en') |
| templateId | `string`   |  id of the template to apply |
| data | `any`   |  Data object to bind to |





**Returns:** `Promise`.<[Partial]()[Activity](botbuilder.activity.md)⎮`string`⎮`undefined`>





___


