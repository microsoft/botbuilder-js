[Bot Builder SDK - Core](../README.md) > [TemplateManager](../classes/botbuilder.templatemanager.md)



# Class: TemplateManager

## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)

## Index

### Methods

* [contextCreated](botbuilder.templatemanager.md#contextcreated)
* [getLanguagePolicy](botbuilder.templatemanager.md#getlanguagepolicy)
* [list](botbuilder.templatemanager.md#list)
* [postActivity](botbuilder.templatemanager.md#postactivity)
* [register](botbuilder.templatemanager.md#register)
* [setLanguagePolicy](botbuilder.templatemanager.md#setlanguagepolicy)



---
## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/templateManager.d.ts:26](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/templateManager.d.ts#L26)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="getlanguagepolicy"></a>

###  getLanguagePolicy

► **getLanguagePolicy**(): `string`[]



*Defined in [libraries/botbuilder/lib/templateManager.d.ts:45](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/templateManager.d.ts#L45)*



Get the current language fallback policy




**Returns:** `string`[]





___

<a id="list"></a>

###  list

► **list**(): [TemplateRenderer](../interfaces/botbuilder.templaterenderer.md)[]



*Defined in [libraries/botbuilder/lib/templateManager.d.ts:36](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/templateManager.d.ts#L36)*



list of registered template renderers




**Returns:** [TemplateRenderer](../interfaces/botbuilder.templaterenderer.md)[]





___

<a id="postactivity"></a>

###  postActivity

► **postActivity**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, activities: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)[]*, next: *`function`*): `Promise`.<[ConversationResourceResponse](../interfaces/botbuilder.conversationresourceresponse.md)[]>



*Defined in [libraries/botbuilder/lib/templateManager.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/templateManager.d.ts#L27)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| activities | [Partial]()[Activity](../interfaces/botbuilder.activity.md)[]   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<[ConversationResourceResponse](../interfaces/botbuilder.conversationresourceresponse.md)[]>





___

<a id="register"></a>

###  register

► **register**(renderer: *[TemplateRenderer](../interfaces/botbuilder.templaterenderer.md)*): [TemplateManager](botbuilder.templatemanager.md)



*Defined in [libraries/botbuilder/lib/templateManager.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/templateManager.d.ts#L32)*



register template renderer


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| renderer | [TemplateRenderer](../interfaces/botbuilder.templaterenderer.md)   |  - |





**Returns:** [TemplateManager](botbuilder.templatemanager.md)





___

<a id="setlanguagepolicy"></a>

###  setLanguagePolicy

► **setLanguagePolicy**(fallback: *`string`[]*): `void`



*Defined in [libraries/botbuilder/lib/templateManager.d.ts:41](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/templateManager.d.ts#L41)*



SetLanguagePolicy allows you to set the fallback strategy


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| fallback | `string`[]   |  array of languages to try when binding templates |





**Returns:** `void`





___


