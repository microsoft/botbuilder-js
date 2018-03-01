[Bot Builder SDK](../README.md) > [ConversationState](../classes/botbuilder.conversationstate.md)



# Class: ConversationState


Reads and writes conversation state for your bot to storage. When used as middleware the state will automatically be read in before your bots logic runs and then written back out open completion of your bots logic.

<table>

<thead>

<tr>

<th>package</th>

<th style="text-align:center">middleware</th>

</tr>

</thead>

<tbody>

<tr>

<td>botbuilder-core-extensions</td>

<td style="text-align:center">yes</td>

</tr>

</tbody>

</table>

## Type parameters
#### T :  [StoreItem](../interfaces/botbuilder.storeitem.md)
## Hierarchy


 [BotState](botbuilder.botstate.md)`T`

**↳ ConversationState**







## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder.conversationstate.md#constructor)


### Properties

* [cacheKey](botbuilder.conversationstate.md#cachekey)
* [storage](botbuilder.conversationstate.md#storage)
* [storageKey](botbuilder.conversationstate.md#storagekey)


### Methods

* [clear](botbuilder.conversationstate.md#clear)
* [getStorageKey](botbuilder.conversationstate.md#getstoragekey)
* [onProcessRequest](botbuilder.conversationstate.md#onprocessrequest)
* [read](botbuilder.conversationstate.md#read)
* [write](botbuilder.conversationstate.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new ConversationState**(storage: *[Storage](../interfaces/botbuilder.storage.md)*, cacheKey?: *`undefined`⎮`string`*): [ConversationState](botbuilder.conversationstate.md)


*Overrides [BotState](botbuilder.botstate.md).[constructor](botbuilder.botstate.md#constructor)*

*Defined in [libraries/botbuilder-core-extensions/lib/conversationState.d.ts:20](https://github.com/Microsoft/botbuilder-js/blob/3840892/libraries/botbuilder-core-extensions/lib/conversationState.d.ts#L20)*



Creates a new ConversationState instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| storage | [Storage](../interfaces/botbuilder.storage.md)   |  Storage provider to persist conversation state to. |
| cacheKey | `undefined`⎮`string`   |  (Optional) name of the cached entry on the context object. A property accessor with this name will also be added to the context object. The default value is 'conversationState'. |





**Returns:** [ConversationState](botbuilder.conversationstate.md)

---


## Properties
<a id="cachekey"></a>

### «Protected» cacheKey

**●  cacheKey**:  *`string`* 

*Inherited from [BotState](botbuilder.botstate.md).[cacheKey](botbuilder.botstate.md#cachekey)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/3840892/libraries/botbuilder-core-extensions/lib/botState.d.ts#L32)*





___

<a id="storage"></a>

### «Protected» storage

**●  storage**:  *[Storage](../interfaces/botbuilder.storage.md)* 

*Inherited from [BotState](botbuilder.botstate.md).[storage](botbuilder.botstate.md#storage)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/3840892/libraries/botbuilder-core-extensions/lib/botState.d.ts#L31)*





___

<a id="storagekey"></a>

### «Protected» storageKey

**●  storageKey**:  *[StorageKeyFactory](../#storagekeyfactory)* 

*Inherited from [BotState](botbuilder.botstate.md).[storageKey](botbuilder.botstate.md#storagekey)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/3840892/libraries/botbuilder-core-extensions/lib/botState.d.ts#L33)*





___


## Methods
<a id="clear"></a>

###  clear

► **clear**(context: *[BotContext](botbuilder.botcontext.md)*): `void`



*Inherited from [BotState](botbuilder.botstate.md).[clear](botbuilder.botstate.md#clear)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:58](https://github.com/Microsoft/botbuilder-js/blob/3840892/libraries/botbuilder-core-extensions/lib/botState.d.ts#L58)*



Clears the current state object for a turn.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  Context for current turn of conversation with the user. |





**Returns:** `void`





___

<a id="getstoragekey"></a>

###  getStorageKey

► **getStorageKey**(context: *[BotContext](botbuilder.botcontext.md)*): `string`⎮`undefined`



*Defined in [libraries/botbuilder-core-extensions/lib/conversationState.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/3840892/libraries/botbuilder-core-extensions/lib/conversationState.d.ts#L31)*



Returns the storage key for the current conversation state.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  Context for current turn of conversation with the user. |





**Returns:** `string`⎮`undefined`





___

<a id="onprocessrequest"></a>

###  onProcessRequest

► **onProcessRequest**(context: *[BotContext](botbuilder.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Inherited from [BotState](botbuilder.botstate.md).[onProcessRequest](botbuilder.botstate.md#onprocessrequest)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:41](https://github.com/Microsoft/botbuilder-js/blob/3840892/libraries/botbuilder-core-extensions/lib/botState.d.ts#L41)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="read"></a>

###  read

► **read**(context: *[BotContext](botbuilder.botcontext.md)*, force?: *`undefined`⎮`true`⎮`false`*): `Promise`.<`T`>



*Inherited from [BotState](botbuilder.botstate.md).[read](botbuilder.botstate.md#read)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:47](https://github.com/Microsoft/botbuilder-js/blob/3840892/libraries/botbuilder-core-extensions/lib/botState.d.ts#L47)*



Reads in and caches the current state object for a turn.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  Context for current turn of conversation with the user. |
| force | `undefined`⎮`true`⎮`false`   |  (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`. |





**Returns:** `Promise`.<`T`>





___

<a id="write"></a>

###  write

► **write**(context: *[BotContext](botbuilder.botcontext.md)*, force?: *`undefined`⎮`true`⎮`false`*): `Promise`.<`void`>



*Inherited from [BotState](botbuilder.botstate.md).[write](botbuilder.botstate.md#write)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:53](https://github.com/Microsoft/botbuilder-js/blob/3840892/libraries/botbuilder-core-extensions/lib/botState.d.ts#L53)*



Writes out the state object if it's been changed.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  Context for current turn of conversation with the user. |
| force | `undefined`⎮`true`⎮`false`   |  (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`. |





**Returns:** `Promise`.<`void`>





___


