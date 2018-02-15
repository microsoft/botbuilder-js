


#  botbuilder


## Index

### Modules

* [__global](modules/botbuilder.__global.md)


### Enumerations

* [RecognizeOrder](enums/botbuilder.recognizeorder.md)


### Classes

* [AttachmentRecognizer](classes/botbuilder.attachmentrecognizer.md)
* [Bot](classes/botbuilder.bot.md)
* [BotService](classes/botbuilder.botservice.md)
* [BotStateManager](classes/botbuilder.botstatemanager.md)
* [BrowserLocalStorage](classes/botbuilder.browserlocalstorage.md)
* [BrowserSessionStorage](classes/botbuilder.browsersessionstorage.md)
* [CardStyler](classes/botbuilder.cardstyler.md)
* [DictionaryRenderer](classes/botbuilder.dictionaryrenderer.md)
* [IntentRecognizer](classes/botbuilder.intentrecognizer.md)
* [IntentRecognizerSet](classes/botbuilder.intentrecognizerset.md)
* [JsonTemplates](classes/botbuilder.jsontemplates.md)
* [MemoryStorage](classes/botbuilder.memorystorage.md)
* [MiddlewareSet](classes/botbuilder.middlewareset.md)
* [RegExpRecognizer](classes/botbuilder.regexprecognizer.md)
* [StorageMiddleware](classes/botbuilder.storagemiddleware.md)
* [TemplateManager](classes/botbuilder.templatemanager.md)
* [TestAdapter](classes/botbuilder.testadapter.md)
* [TestFlow](classes/botbuilder.testflow.md)


### Interfaces

* [ActivityAdapter](interfaces/botbuilder.activityadapter.md)
* [AttachmentRecognizerSettings](interfaces/botbuilder.attachmentrecognizersettings.md)
* [BotStateManagerSettings](interfaces/botbuilder.botstatemanagersettings.md)
* [EntityObject](interfaces/botbuilder.entityobject.md)
* [Intent](interfaces/botbuilder.intent.md)
* [IntentRecognizerSetSettings](interfaces/botbuilder.intentrecognizersetsettings.md)
* [Middleware](interfaces/botbuilder.middleware.md)
* [RegExpLocaleMap](interfaces/botbuilder.regexplocalemap.md)
* [RegExpRecognizerSettings](interfaces/botbuilder.regexprecognizersettings.md)
* [SearchCatalog](interfaces/botbuilder.searchcatalog.md)
* [SearchEngine](interfaces/botbuilder.searchengine.md)
* [SearchHit](interfaces/botbuilder.searchhit.md)
* [Storage](interfaces/botbuilder.storage.md)
* [StorageSettings](interfaces/botbuilder.storagesettings.md)
* [StoreItem](interfaces/botbuilder.storeitem.md)
* [StoreItems](interfaces/botbuilder.storeitems.md)
* [TemplateRenderer](interfaces/botbuilder.templaterenderer.md)


### Type aliases

* [Promiseable](#promiseable)
* [SimpleTemplateFunction](#simpletemplatefunction)
* [TemplateDictionary](#templatedictionary)
* [TemplateFunction](#templatefunction)
* [TemplateFunctionMap](#templatefunctionmap)
* [TemplateIdMap](#templateidmap)


### Variables

* [EntityTypes](#entitytypes)


### Functions

* [isPromised](#ispromised)



---
## Type aliases
<a id="promiseable"></a>

###  Promiseable

**Τ Promiseable**:  *`Promise`.<`T`>⎮`T`* 

*Defined in [libraries/botbuilder/lib/middleware.d.ts:14](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/middleware.d.ts#L14)*



Type signature for a return value that can (Optionally) return its value asynchronously using a Promise.
*__param__*: (Optional) type of value being returned. This defaults to `void`.





___

<a id="simpletemplatefunction"></a>

###  SimpleTemplateFunction

**Τ SimpleTemplateFunction**:  *`function`* 

*Defined in [libraries/botbuilder/lib/dictionaryRenderer.d.ts:11](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/dictionaryRenderer.d.ts#L11)*


#### Type declaration
►(context: *[BotContext](interfaces/botbuilder.__global.botcontext.md)*, data: *`Object`*): [Partial]()[Activity]()⎮`string`⎮`undefined`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](interfaces/botbuilder.__global.botcontext.md)   |  - |
| data | `Object`   |  - |





**Returns:** [Partial]()[Activity]()⎮`string`⎮`undefined`






___

<a id="templatedictionary"></a>

###  TemplateDictionary

**Τ TemplateDictionary**:  *`object`* 

*Defined in [libraries/botbuilder/lib/dictionaryRenderer.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/dictionaryRenderer.d.ts#L21)*



Map of Language -> map of functions

#### Type declaration


[language: `string`]: [TemplateIdMap](#templateidmap)






___

<a id="templatefunction"></a>

###  TemplateFunction

**Τ TemplateFunction**:  *`function`* 

*Defined in [libraries/botbuilder/lib/jsonTemplates.d.ts:17](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/jsonTemplates.d.ts#L17)*



A template function that can return a stringified value from a given data object.
*__param__*: The data object to return a value from.

*__param__*: (Optional) path to the value to return.


#### Type declaration
►(data: *`Object`*, path?: *`undefined`⎮`string`*): `string`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| data | `Object`   |  - |
| path | `undefined`⎮`string`   |  - |





**Returns:** `string`






___

<a id="templatefunctionmap"></a>

###  TemplateFunctionMap

**Τ TemplateFunctionMap**:  *`object`* 

*Defined in [libraries/botbuilder/lib/jsonTemplates.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/jsonTemplates.d.ts#L21)*



A set of named template functions.

#### Type declaration


[name: `string`]: [TemplateFunction](#templatefunction)






___

<a id="templateidmap"></a>

###  TemplateIdMap

**Τ TemplateIdMap**:  *`object`* 

*Defined in [libraries/botbuilder/lib/dictionaryRenderer.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/dictionaryRenderer.d.ts#L15)*



Map of template Id -> Function

#### Type declaration


[id: `string`]: [SimpleTemplateFunction](#simpletemplatefunction)






___


## Variables
<a id="entitytypes"></a>

###  EntityTypes

**●  EntityTypes**:  *[EntityTypes](interfaces/botbuilder.__global.entitytypes.md)* 

*Defined in [libraries/botbuilder/lib/entityObject.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/entityObject.d.ts#L18)*



Well known entity types.




___


## Functions
<a id="ispromised"></a>

###  isPromised

► **isPromised**T(result: *[Promiseable](#promiseable)`T`*): `boolean`



*Defined in [libraries/botbuilder/lib/middleware.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/middleware.d.ts#L19)*



Returns true if a result that can (Optionally) be a Promise looks like a Promise.


**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| result | [Promiseable](#promiseable)`T`   |  The result to test. |





**Returns:** `boolean`





___


