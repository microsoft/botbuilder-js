[Bot Builder SDK - Core](../README.md) > [BotStateManager](../classes/botbuilder.botstatemanager.md)



# Class: BotStateManager


Middleware for tracking conversation and user state using the `context.storage` provider.

**Extends BotContext:**

*   context.state.user - User persisted state
*   context.state.conversation - Conversation persisted data

**Depends on:**

*   context.storage - Storage provider for storing and retrieving objects

**Usage Example**

    const bot = new Bot(adapter)
         .use(new MemoryStorage())
         .use(new BotStateManager())
         .onReceive((context) => {
             context.reply(`Hello World`);
         })

## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)

## Index

### Constructors

* [constructor](botbuilder.botstatemanager.md#constructor)


### Methods

* [contextCreated](botbuilder.botstatemanager.md#contextcreated)
* [contextDone](botbuilder.botstatemanager.md#contextdone)
* [postActivity](botbuilder.botstatemanager.md#postactivity)
* [read](botbuilder.botstatemanager.md#read)
* [write](botbuilder.botstatemanager.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BotStateManager**(settings?: *[Partial]()[BotStateManagerSettings](../interfaces/botbuilder.botstatemanagersettings.md)*): [BotStateManager](botbuilder.botstatemanager.md)


*Defined in [libraries/botbuilder/lib/botStateManager.d.ts:41](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botStateManager.d.ts#L41)*



Creates a new instance of the state manager.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [Partial]()[BotStateManagerSettings](../interfaces/botbuilder.botstatemanagersettings.md)   |  (Optional) settings to adjust the behavior of the state manager. |





**Returns:** [BotStateManager](botbuilder.botstatemanager.md)

---


## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botStateManager.d.ts:48](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botStateManager.d.ts#L48)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="contextdone"></a>

###  contextDone

► **contextDone**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botStateManager.d.ts:50](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botStateManager.d.ts#L50)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="postactivity"></a>

###  postActivity

► **postActivity**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, activities: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)[]*, next: *`function`*): `Promise`.<[ConversationResourceResponse](../interfaces/botbuilder.conversationresourceresponse.md)[]>



*Defined in [libraries/botbuilder/lib/botStateManager.d.ts:49](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botStateManager.d.ts#L49)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| activities | [Partial]()[Activity](../interfaces/botbuilder.activity.md)[]   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<[ConversationResourceResponse](../interfaces/botbuilder.conversationresourceresponse.md)[]>





___

<a id="read"></a>

### «Protected» read

► **read**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, keys: *`string`[]*): `Promise`.<[StoreItems](../interfaces/botbuilder.storeitems.md)>



*Defined in [libraries/botbuilder/lib/botStateManager.d.ts:51](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botStateManager.d.ts#L51)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| keys | `string`[]   |  - |





**Returns:** `Promise`.<[StoreItems](../interfaces/botbuilder.storeitems.md)>





___

<a id="write"></a>

### «Protected» write

► **write**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, changes: *[StoreItems](../interfaces/botbuilder.storeitems.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botStateManager.d.ts:52](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botStateManager.d.ts#L52)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| changes | [StoreItems](../interfaces/botbuilder.storeitems.md)   |  - |





**Returns:** `Promise`.<`void`>





___


