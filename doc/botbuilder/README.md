


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
* [ConsoleLogger](classes/botbuilder.consolelogger.md)
* [EntityRecognizers](classes/botbuilder.entityrecognizers.md)
* [IntentRecognizer](classes/botbuilder.intentrecognizer.md)
* [IntentRecognizerSet](classes/botbuilder.intentrecognizerset.md)
* [MemoryStorage](classes/botbuilder.memorystorage.md)
* [MessageStyler](classes/botbuilder.messagestyler.md)
* [MiddlewareSet](classes/botbuilder.middlewareset.md)
* [RegExpRecognizer](classes/botbuilder.regexprecognizer.md)
* [StorageMiddleware](classes/botbuilder.storagemiddleware.md)
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
* [Choice](interfaces/botbuilder.choice.md)
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
* [RecognizeChoicesOptions](interfaces/botbuilder.recognizechoicesoptions.md)
* [RecognizeNumbersOptions](interfaces/botbuilder.recognizenumbersoptions.md)
* [RecognizeValuesOptions](interfaces/botbuilder.recognizevaluesoptions.md)
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
* [ThumbnailCard](interfaces/botbuilder.thumbnailcard.md)
* [ThumbnailUrl](interfaces/botbuilder.thumbnailurl.md)
* [VideoCard](interfaces/botbuilder.videocard.md)


### Type aliases

* [Promiseable](#promiseable)


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

*Defined in [libraries/botbuilder/lib/middleware.d.ts:11](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/middleware.d.ts#L11)*



Type signature for a return value that can (Optionally) return its value asynchronously using a Promise.
*__param__*: (Optional) type of value being returned. This defaults to `void`.





___


## Variables
<a id="activitytypes"></a>

###  ActivityTypes

**●  ActivityTypes**:  *`object`* 

*Defined in [libraries/botbuilder/lib/activity.d.ts:8](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/activity.d.ts#L8)*



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

*Defined in [libraries/botbuilder/lib/activity.d.ts:24](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/activity.d.ts#L24)*



Desired layout style for a list of attachments sent to a user.

#### Type declaration




 carousel: `string`






 list: `string`







___

<a id="endofconversationcodes"></a>

###  EndOfConversationCodes

**●  EndOfConversationCodes**:  *`object`* 

*Defined in [libraries/botbuilder/lib/activity.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/activity.d.ts#L29)*



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

*Defined in [libraries/botbuilder/lib/entityRecognizers.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/entityRecognizers.d.ts#L18)*



Well known entity types.




___

<a id="textformats"></a>

###  TextFormats

**●  TextFormats**:  *`object`* 

*Defined in [libraries/botbuilder/lib/activity.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/activity.d.ts#L19)*



Desired text format for a message being sent to a user.

#### Type declaration




 markdown: `string`






 plain: `string`







___


## Functions
<a id="applyconversationreference"></a>

###  applyConversationReference

► **applyConversationReference**(activity: *[Partial]()[Activity](interfaces/botbuilder.activity.md)*, reference: *[ConversationReference](interfaces/botbuilder.conversationreference.md)*): `void`



*Defined in [libraries/botbuilder/lib/activity.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/activity.d.ts#L39)*



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



*Defined in [libraries/botbuilder/lib/activity.d.ts:38](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/activity.d.ts#L38)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()[Activity](interfaces/botbuilder.activity.md)   |  - |





**Returns:** [ConversationReference](interfaces/botbuilder.conversationreference.md)





___

<a id="ispromised"></a>

###  isPromised

► **isPromised**T(result: *[Promiseable](#promiseable)`T`*): `boolean`



*Defined in [libraries/botbuilder/lib/middleware.d.ts:16](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/middleware.d.ts#L16)*



Returns true if a result that can (Optionally) be a Promise looks like a Promise.


**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| result | [Promiseable](#promiseable)`T`   |  The result to test. |





**Returns:** `boolean`





___


