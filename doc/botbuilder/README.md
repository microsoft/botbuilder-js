


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
* [MessageStyler](classes/botbuilder.messagestyler.md)
* [MiddlewareSet](classes/botbuilder.middlewareset.md)
* [RegExpRecognizer](classes/botbuilder.regexprecognizer.md)
* [StorageMiddleware](classes/botbuilder.storagemiddleware.md)
* [TemplateManager](classes/botbuilder.templatemanager.md)
* [TestAdapter](classes/botbuilder.testadapter.md)
* [TestFlow](classes/botbuilder.testflow.md)


### Interfaces

* [Activity](interfaces/botbuilder.activity.md)
* [ActivityAdapter](interfaces/botbuilder.activityadapter.md)
* [AnimationCard](interfaces/botbuilder.animationcard.md)
* [Attachment](interfaces/botbuilder.attachment.md)
* [AttachmentData](interfaces/botbuilder.attachmentdata.md)
* [AttachmentInfo](interfaces/botbuilder.attachmentinfo.md)
* [AttachmentRecognizerSettings](interfaces/botbuilder.attachmentrecognizersettings.md)
* [AttachmentView](interfaces/botbuilder.attachmentview.md)
* [AudioCard](interfaces/botbuilder.audiocard.md)
* [BotStateManagerSettings](interfaces/botbuilder.botstatemanagersettings.md)
* [CardAction](interfaces/botbuilder.cardaction.md)
* [CardImage](interfaces/botbuilder.cardimage.md)
* [ChannelAccount](interfaces/botbuilder.channelaccount.md)
* [ConversationAccount](interfaces/botbuilder.conversationaccount.md)
* [ConversationParameters](interfaces/botbuilder.conversationparameters.md)
* [ConversationReference](interfaces/botbuilder.conversationreference.md)
* [ConversationResourceResponse](interfaces/botbuilder.conversationresourceresponse.md)
* [Entity](interfaces/botbuilder.entity.md)
* [EntityObject](interfaces/botbuilder.entityobject.md)
* [Fact](interfaces/botbuilder.fact.md)
* [GeoCoordinates](interfaces/botbuilder.geocoordinates.md)
* [HeroCard](interfaces/botbuilder.herocard.md)
* [Intent](interfaces/botbuilder.intent.md)
* [IntentRecognizerSetSettings](interfaces/botbuilder.intentrecognizersetsettings.md)
* [MediaUrl](interfaces/botbuilder.mediaurl.md)
* [MessageReaction](interfaces/botbuilder.messagereaction.md)
* [Middleware](interfaces/botbuilder.middleware.md)
* [Place](interfaces/botbuilder.place.md)
* [ReceiptCard](interfaces/botbuilder.receiptcard.md)
* [ReceiptItem](interfaces/botbuilder.receiptitem.md)
* [RegExpLocaleMap](interfaces/botbuilder.regexplocalemap.md)
* [RegExpRecognizerSettings](interfaces/botbuilder.regexprecognizersettings.md)
* [ResourceResponse](interfaces/botbuilder.resourceresponse.md)
* [SearchCatalog](interfaces/botbuilder.searchcatalog.md)
* [SearchEngine](interfaces/botbuilder.searchengine.md)
* [SearchHit](interfaces/botbuilder.searchhit.md)
* [SigninCard](interfaces/botbuilder.signincard.md)
* [Storage](interfaces/botbuilder.storage.md)
* [StorageSettings](interfaces/botbuilder.storagesettings.md)
* [StoreItem](interfaces/botbuilder.storeitem.md)
* [StoreItems](interfaces/botbuilder.storeitems.md)
* [SuggestedActions](interfaces/botbuilder.suggestedactions.md)
* [TemplateRenderer](interfaces/botbuilder.templaterenderer.md)
* [ThumbnailCard](interfaces/botbuilder.thumbnailcard.md)
* [ThumbnailUrl](interfaces/botbuilder.thumbnailurl.md)
* [VideoCard](interfaces/botbuilder.videocard.md)


### Type aliases

* [Promiseable](#promiseable)
* [SimpleTemplateFunction](#simpletemplatefunction)
* [TemplateDictionary](#templatedictionary)
* [TemplateFunction](#templatefunction)
* [TemplateFunctionMap](#templatefunctionmap)
* [TemplateIdMap](#templateidmap)


### Variables

* [ActivityTypes](#activitytypes)
* [AttachmentLayouts](#attachmentlayouts)
* [EndOfConversationCodes](#endofconversationcodes)
* [EntityTypes](#entitytypes)
* [TextFormats](#textformats)


### Functions

* [applyConversationReference](#applyconversationreference)
* [getConversationReference](#getconversationreference)
* [isPromised](#ispromised)



---
## Type aliases
<a id="promiseable"></a>

###  Promiseable

**Τ Promiseable**:  *`Promise`.<`T`>⎮`T`* 

*Defined in [libraries/botbuilder/lib/middleware.d.ts:14](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/middleware.d.ts#L14)*



Type signature for a return value that can (Optionally) return its value asynchronously using a Promise.
*__param__*: (Optional) type of value being returned. This defaults to `void`.





___

<a id="simpletemplatefunction"></a>

###  SimpleTemplateFunction

**Τ SimpleTemplateFunction**:  *`function`* 

*Defined in [libraries/botbuilder/lib/dictionaryRenderer.d.ts:11](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/dictionaryRenderer.d.ts#L11)*


#### Type declaration
►(context: *[BotContext](interfaces/botbuilder.__global.botcontext.md)*, data: *`Object`*): [Partial]()[Activity](interfaces/botbuilder.activity.md)⎮`string`⎮`undefined`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](interfaces/botbuilder.__global.botcontext.md)   |  - |
| data | `Object`   |  - |





**Returns:** [Partial]()[Activity](interfaces/botbuilder.activity.md)⎮`string`⎮`undefined`






___

<a id="templatedictionary"></a>

###  TemplateDictionary

**Τ TemplateDictionary**:  *`object`* 

*Defined in [libraries/botbuilder/lib/dictionaryRenderer.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/dictionaryRenderer.d.ts#L21)*



Map of Language -> map of functions

#### Type declaration


[language: `string`]: [TemplateIdMap](#templateidmap)






___

<a id="templatefunction"></a>

###  TemplateFunction

**Τ TemplateFunction**:  *`function`* 

*Defined in [libraries/botbuilder/lib/jsonTemplates.d.ts:17](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/jsonTemplates.d.ts#L17)*



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

*Defined in [libraries/botbuilder/lib/jsonTemplates.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/jsonTemplates.d.ts#L21)*



A set of named template functions.

#### Type declaration


[name: `string`]: [TemplateFunction](#templatefunction)






___

<a id="templateidmap"></a>

###  TemplateIdMap

**Τ TemplateIdMap**:  *`object`* 

*Defined in [libraries/botbuilder/lib/dictionaryRenderer.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/dictionaryRenderer.d.ts#L15)*



Map of template Id -> Function

#### Type declaration


[id: `string`]: [SimpleTemplateFunction](#simpletemplatefunction)






___


## Variables
<a id="activitytypes"></a>

###  ActivityTypes

**●  ActivityTypes**:  *`object`* 

*Defined in [libraries/botbuilder/lib/activity.d.ts:11](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/activity.d.ts#L11)*



List of activity types supported by the Bot Framework.

#### Type declaration




 contactRelationUpdate: `string`






 conversationUpdate: `string`






 endOfConversation: `string`






 event: `string`






 invoke: `string`






 message: `string`






 messageReaction: `string`






 typing: `string`







___

<a id="attachmentlayouts"></a>

###  AttachmentLayouts

**●  AttachmentLayouts**:  *`object`* 

*Defined in [libraries/botbuilder/lib/activity.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/activity.d.ts#L27)*



Desired layout style for a list of attachments sent to a user.

#### Type declaration




 carousel: `string`






 list: `string`







___

<a id="endofconversationcodes"></a>

###  EndOfConversationCodes

**●  EndOfConversationCodes**:  *`object`* 

*Defined in [libraries/botbuilder/lib/activity.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/activity.d.ts#L32)*



Codes indicating why a conversation has ended.

#### Type declaration




 botIssuedInvalidMessage: `string`






 botTimedOut: `string`






 channelFailed: `string`






 completedSuccessfully: `string`






 unknown: `string`






 unrecognized: `string`






 userCancelled: `string`







___

<a id="entitytypes"></a>

###  EntityTypes

**●  EntityTypes**:  *[EntityTypes](interfaces/botbuilder.__global.entitytypes.md)* 

*Defined in [libraries/botbuilder/lib/entityObject.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/entityObject.d.ts#L18)*



Well known entity types.




___

<a id="textformats"></a>

###  TextFormats

**●  TextFormats**:  *`object`* 

*Defined in [libraries/botbuilder/lib/activity.d.ts:22](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/activity.d.ts#L22)*



Desired text format for a message being sent to a user.

#### Type declaration




 markdown: `string`






 plain: `string`







___


## Functions
<a id="applyconversationreference"></a>

###  applyConversationReference

► **applyConversationReference**(activity: *[Partial]()[Activity](interfaces/botbuilder.activity.md)*, reference: *[ConversationReference](interfaces/botbuilder.conversationreference.md)*): `void`



*Defined in [libraries/botbuilder/lib/activity.d.ts:42](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/activity.d.ts#L42)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()[Activity](interfaces/botbuilder.activity.md)   |  - |
| reference | [ConversationReference](interfaces/botbuilder.conversationreference.md)   |  - |





**Returns:** `void`





___

<a id="getconversationreference"></a>

###  getConversationReference

► **getConversationReference**(activity: *[Partial]()[Activity](interfaces/botbuilder.activity.md)*): [ConversationReference](interfaces/botbuilder.conversationreference.md)



*Defined in [libraries/botbuilder/lib/activity.d.ts:41](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/activity.d.ts#L41)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()[Activity](interfaces/botbuilder.activity.md)   |  - |





**Returns:** [ConversationReference](interfaces/botbuilder.conversationreference.md)





___

<a id="ispromised"></a>

###  isPromised

► **isPromised**T(result: *[Promiseable](#promiseable)`T`*): `boolean`



*Defined in [libraries/botbuilder/lib/middleware.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/middleware.d.ts#L19)*



Returns true if a result that can (Optionally) be a Promise looks like a Promise.


**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| result | [Promiseable](#promiseable)`T`   |  The result to test. |





**Returns:** `boolean`





___


