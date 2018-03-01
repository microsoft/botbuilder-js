


#  botbuilder


## Index

### Classes

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

* [BotFrameworkAdapterSettings](interfaces/botbuilder.botframeworkadaptersettings.md)
* [CachedBotState](interfaces/botbuilder.cachedbotstate.md)
* [Headers](interfaces/botbuilder.headers.md)
* [Storage](interfaces/botbuilder.storage.md)
* [StoreItem](interfaces/botbuilder.storeitem.md)
* [StoreItems](interfaces/botbuilder.storeitems.md)
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

*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:13](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L13)*


#### Type declaration
►(reference: *[Partial]()`ConversationReference`*, next: *`function`*): [Promiseable]()`void`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [Partial]()`ConversationReference`   |  - |
| next | `function`   |  - |





**Returns:** [Promiseable]()`void`






___

<a id="sendactivitieshandler"></a>

###  SendActivitiesHandler

**Τ SendActivitiesHandler**:  *`function`* 

*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:11](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L11)*


#### Type declaration
►(activities: *[Partial]()`Activity`[]*, next: *`function`*): [Promiseable]()`ResourceResponse`[]



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()`Activity`[]   |  - |
| next | `function`   |  - |





**Returns:** [Promiseable]()`ResourceResponse`[]






___

<a id="storagekeyfactory"></a>

###  StorageKeyFactory

**Τ StorageKeyFactory**:  *`function`* 

*Defined in [libraries/botbuilder-core-extensions/lib/storage.d.ts:13](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core-extensions/lib/storage.d.ts#L13)*



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

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:9](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L9)*


#### Type declaration
►(activity: *[Partial]()`Activity`*, description: *`string`*): `void`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()`Activity`   |  - |
| description | `string`   |  - |





**Returns:** `void`






___

<a id="updateactivityhandler"></a>

###  UpdateActivityHandler

**Τ UpdateActivityHandler**:  *`function`* 

*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:12](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L12)*


#### Type declaration
►(activity: *[Partial]()`Activity`*, next: *`function`*): [Promiseable]()`void`



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()`Activity`   |  - |
| next | `function`   |  - |





**Returns:** [Promiseable]()`void`






___


## Functions
<a id="calculatechangehash"></a>

###  calculateChangeHash

► **calculateChangeHash**(item: *[StoreItem](interfaces/botbuilder.storeitem.md)*): `string`



*Defined in [libraries/botbuilder-core-extensions/lib/storage.d.ts:46](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core-extensions/lib/storage.d.ts#L46)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| item | [StoreItem](interfaces/botbuilder.storeitem.md)   |  - |





**Returns:** `string`





___


