


#  botbuilder


## Index

### Enumerations

* [ActionTypes](enums/botbuilder.actiontypes.md)
* [ActivityImportance](enums/botbuilder.activityimportance.md)
* [ActivityTypes](enums/botbuilder.activitytypes.md)
* [AttachmentLayoutTypes](enums/botbuilder.attachmentlayouttypes.md)
* [ContactRelationUpdateActionTypes](enums/botbuilder.contactrelationupdateactiontypes.md)
* [EndOfConversationCodes](enums/botbuilder.endofconversationcodes.md)
* [InputHints](enums/botbuilder.inputhints.md)
* [InstallationUpdateActionTypes](enums/botbuilder.installationupdateactiontypes.md)
* [MessageReactionTypes](enums/botbuilder.messagereactiontypes.md)
* [TextFormatTypes](enums/botbuilder.textformattypes.md)


### Classes

* [BatchOutput](classes/botbuilder.batchoutput.md)
* [BotAdapter](classes/botbuilder.botadapter.md)
* [BotContext](classes/botbuilder.botcontext.md)
* [BotFrameworkAdapter](classes/botbuilder.botframeworkadapter.md)
* [BotState](classes/botbuilder.botstate.md)
* [BotStateSet](classes/botbuilder.botstateset.md)
* [BrowserLocalStorage](classes/botbuilder.browserlocalstorage.md)
* [BrowserSessionStorage](classes/botbuilder.browsersessionstorage.md)
* [CardFactory](classes/botbuilder.cardfactory.md)
* [ConsoleAdapter](classes/botbuilder.consoleadapter.md)
* [ConversationState](classes/botbuilder.conversationstate.md)
* [MemoryStorage](classes/botbuilder.memorystorage.md)
* [TestAdapter](classes/botbuilder.testadapter.md)
* [TestFlow](classes/botbuilder.testflow.md)
* [UserState](classes/botbuilder.userstate.md)


### Interfaces

* [Activity](interfaces/botbuilder.activity.md)
* [AnimationCard](interfaces/botbuilder.animationcard.md)
* [Attachment](interfaces/botbuilder.attachment.md)
* [AttachmentData](interfaces/botbuilder.attachmentdata.md)
* [AttachmentInfo](interfaces/botbuilder.attachmentinfo.md)
* [AttachmentView](interfaces/botbuilder.attachmentview.md)
* [AudioCard](interfaces/botbuilder.audiocard.md)
* [BasicCard](interfaces/botbuilder.basiccard.md)
* [BotFrameworkAdapterSettings](interfaces/botbuilder.botframeworkadaptersettings.md)
* [CachedBotState](interfaces/botbuilder.cachedbotstate.md)
* [CardAction](interfaces/botbuilder.cardaction.md)
* [CardImage](interfaces/botbuilder.cardimage.md)
* [ChannelAccount](interfaces/botbuilder.channelaccount.md)
* [ConversationAccount](interfaces/botbuilder.conversationaccount.md)
* [ConversationParameters](interfaces/botbuilder.conversationparameters.md)
* [ConversationReference](interfaces/botbuilder.conversationreference.md)
* [ConversationResourceResponse](interfaces/botbuilder.conversationresourceresponse.md)
* [Entity](interfaces/botbuilder.entity.md)
* [ErrorModel](interfaces/botbuilder.errormodel.md)
* [ErrorResponse](interfaces/botbuilder.errorresponse.md)
* [Fact](interfaces/botbuilder.fact.md)
* [GeoCoordinates](interfaces/botbuilder.geocoordinates.md)
* [Headers](interfaces/botbuilder.headers.md)
* [HeroCard](interfaces/botbuilder.herocard.md)
* [MediaCard](interfaces/botbuilder.mediacard.md)
* [MediaEventValue](interfaces/botbuilder.mediaeventvalue.md)
* [MediaUrl](interfaces/botbuilder.mediaurl.md)
* [Mention](interfaces/botbuilder.mention.md)
* [MessageReaction](interfaces/botbuilder.messagereaction.md)
* [MicrosoftPayMethodData](interfaces/botbuilder.microsoftpaymethoddata.md)
* [PaymentAddress](interfaces/botbuilder.paymentaddress.md)
* [PaymentCurrencyAmount](interfaces/botbuilder.paymentcurrencyamount.md)
* [PaymentDetails](interfaces/botbuilder.paymentdetails.md)
* [PaymentDetailsModifier](interfaces/botbuilder.paymentdetailsmodifier.md)
* [PaymentItem](interfaces/botbuilder.paymentitem.md)
* [PaymentMethodData](interfaces/botbuilder.paymentmethoddata.md)
* [PaymentOptions](interfaces/botbuilder.paymentoptions.md)
* [PaymentRequest](interfaces/botbuilder.paymentrequest.md)
* [PaymentRequestComplete](interfaces/botbuilder.paymentrequestcomplete.md)
* [PaymentRequestCompleteResult](interfaces/botbuilder.paymentrequestcompleteresult.md)
* [PaymentRequestUpdate](interfaces/botbuilder.paymentrequestupdate.md)
* [PaymentRequestUpdateResult](interfaces/botbuilder.paymentrequestupdateresult.md)
* [PaymentResponse](interfaces/botbuilder.paymentresponse.md)
* [PaymentShippingOption](interfaces/botbuilder.paymentshippingoption.md)
* [Place](interfaces/botbuilder.place.md)
* [ReceiptCard](interfaces/botbuilder.receiptcard.md)
* [ReceiptItem](interfaces/botbuilder.receiptitem.md)
* [ResourceResponse](interfaces/botbuilder.resourceresponse.md)
* [SigninCard](interfaces/botbuilder.signincard.md)
* [Storage](interfaces/botbuilder.storage.md)
* [StoreItem](interfaces/botbuilder.storeitem.md)
* [StoreItems](interfaces/botbuilder.storeitems.md)
* [SuggestedActions](interfaces/botbuilder.suggestedactions.md)
* [TextHighlight](interfaces/botbuilder.texthighlight.md)
* [Thing](interfaces/botbuilder.thing.md)
* [ThumbnailCard](interfaces/botbuilder.thumbnailcard.md)
* [ThumbnailUrl](interfaces/botbuilder.thumbnailurl.md)
* [VideoCard](interfaces/botbuilder.videocard.md)
* [WebMiddleware](interfaces/botbuilder.webmiddleware.md)
* [WebRequest](interfaces/botbuilder.webrequest.md)
* [WebResponse](interfaces/botbuilder.webresponse.md)


### Type aliases

* [DeleteActivityHandler](#deleteactivityhandler)
* [SendActivitiesHandler](#sendactivitieshandler)
* [StorageKeyFactory](#storagekeyfactory)
* [TestActivityInspector](#testactivityinspector)
* [UpdateActivityHandler](#updateactivityhandler)


### Functions

* [calculateChangeHash](#calculatechangehash)



---
## Type aliases
<a id="deleteactivityhandler"></a>

###  DeleteActivityHandler

**Τ DeleteActivityHandler**:  *`function`* 

*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core/lib/botContext.d.ts#L28)*



:package: **botbuilder-core**

Signature implemented by functions registered with `context.onDeleteActivity()`.

#### Type declaration
►(reference: *[Partial]()[ConversationReference](interfaces/botbuilder.conversationreference.md)*, next: *`function`*): [Promiseable]()`void`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [Partial]()[ConversationReference](interfaces/botbuilder.conversationreference.md)   |  - |
| next | `function`   |  - |





**Returns:** [Promiseable]()`void`






___

<a id="sendactivitieshandler"></a>

###  SendActivitiesHandler

**Τ SendActivitiesHandler**:  *`function`* 

*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:16](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core/lib/botContext.d.ts#L16)*



:package: **botbuilder-core**

Signature implemented by functions registered with `context.onSendActivities()`.

#### Type declaration
►(activities: *[Partial]()[Activity](interfaces/botbuilder.activity.md)[]*, next: *`function`*): [Promiseable]()[ResourceResponse](interfaces/botbuilder.resourceresponse.md)[]



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()[Activity](interfaces/botbuilder.activity.md)[]   |  - |
| next | `function`   |  - |





**Returns:** [Promiseable]()[ResourceResponse](interfaces/botbuilder.resourceresponse.md)[]






___

<a id="storagekeyfactory"></a>

###  StorageKeyFactory

**Τ StorageKeyFactory**:  *`function`* 

*Defined in [libraries/botbuilder-core-extensions/lib/storage.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core-extensions/lib/storage.d.ts#L15)*



:package: **botbuilder-core-extensions**

Callback to calculate a storage key.

#### Type declaration
►(context: *[BotContext](classes/botbuilder.botcontext.md)*): [Promiseable]()`string`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](classes/botbuilder.botcontext.md)   |  Context for the current turn of conversation with a user. |





**Returns:** [Promiseable]()`string`






___

<a id="testactivityinspector"></a>

###  TestActivityInspector

**Τ TestActivityInspector**:  *`function`* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:14](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L14)*



:package: **botbuilder-core-extensions**

#### Type declaration
►(activity: *[Partial]()[Activity](interfaces/botbuilder.activity.md)*, description: *`string`*): `void`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()[Activity](interfaces/botbuilder.activity.md)   |  - |
| description | `string`   |  - |





**Returns:** `void`






___

<a id="updateactivityhandler"></a>

###  UpdateActivityHandler

**Τ UpdateActivityHandler**:  *`function`* 

*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:22](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core/lib/botContext.d.ts#L22)*



:package: **botbuilder-core**

Signature implemented by functions registered with `context.onUpdateActivity()`.

#### Type declaration
►(activity: *[Partial]()[Activity](interfaces/botbuilder.activity.md)*, next: *`function`*): [Promiseable]()`void`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()[Activity](interfaces/botbuilder.activity.md)   |  - |
| next | `function`   |  - |





**Returns:** [Promiseable]()`void`






___


## Functions
<a id="calculatechangehash"></a>

###  calculateChangeHash

► **calculateChangeHash**(item: *[StoreItem](interfaces/botbuilder.storeitem.md)*): `string`



*Defined in [libraries/botbuilder-core-extensions/lib/storage.d.ts:73](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core-extensions/lib/storage.d.ts#L73)*



Utility function to calculate a change hash for a `StoreItem`.

<table>

<thead>

<tr>

<th>package</th>

</tr>

</thead>

<tbody>

<tr>

<td>botbuilder-core-extensions</td>

</tr>

</tbody>

</table>


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| item | [StoreItem](interfaces/botbuilder.storeitem.md)   |  Item to calculate the change hash for. |





**Returns:** `string`





___


