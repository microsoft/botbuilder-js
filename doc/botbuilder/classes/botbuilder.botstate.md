[Bot Builder SDK](../README.md) > [BotState](../classes/botbuilder.botstate.md)



# Class: BotState


Reads and writes state for your bot to storage. When used as middleware the state will automatically be read in before your bots logic runs and then written back out open completion of your bots logic.

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

**BotState**

↳  [ConversationState](botbuilder.conversationstate.md)




↳  [UserState](botbuilder.userstate.md)








## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder.botstate.md#constructor)


### Properties

* [cacheKey](botbuilder.botstate.md#cachekey)
* [storage](botbuilder.botstate.md#storage)
* [storageKey](botbuilder.botstate.md#storagekey)


### Methods

* [clear](botbuilder.botstate.md#clear)
* [onProcessRequest](botbuilder.botstate.md#onprocessrequest)
* [read](botbuilder.botstate.md#read)
* [write](botbuilder.botstate.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BotState**(storage: *[Storage](../interfaces/botbuilder.storage.md)*, cacheKey: *`string`*, storageKey: *[StorageKeyFactory](../#storagekeyfactory)*): [BotState](botbuilder.botstate.md)


*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/f1f9b42/libraries/botbuilder-core-extensions/lib/botState.d.ts#L33)*



Creates a new BotState instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| storage | [Storage](../interfaces/botbuilder.storage.md)   |  Storage provider to persist the state object to. |
| cacheKey | `string`   |  Name of the cached entry on the context object. This will be passed to `context.set()` and `context.get()`. |
| storageKey | [StorageKeyFactory](../#storagekeyfactory)   |  Function called anytime the storage key for a given turn needs to be known. |





**Returns:** [BotState](botbuilder.botstate.md)

---


## Properties
<a id="cachekey"></a>

### «Protected» cacheKey

**●  cacheKey**:  *`string`* 

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/f1f9b42/libraries/botbuilder-core-extensions/lib/botState.d.ts#L32)*





___

<a id="storage"></a>

### «Protected» storage

**●  storage**:  *[Storage](../interfaces/botbuilder.storage.md)* 

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/f1f9b42/libraries/botbuilder-core-extensions/lib/botState.d.ts#L31)*





___

<a id="storagekey"></a>

### «Protected» storageKey

**●  storageKey**:  *[StorageKeyFactory](../#storagekeyfactory)* 

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/f1f9b42/libraries/botbuilder-core-extensions/lib/botState.d.ts#L33)*





___


## Methods
<a id="clear"></a>

###  clear

► **clear**(context: *[BotContext](botbuilder.botcontext.md)*): `void`



*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:58](https://github.com/Microsoft/botbuilder-js/blob/f1f9b42/libraries/botbuilder-core-extensions/lib/botState.d.ts#L58)*



Clears the current state object for a turn.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  Context for current turn of conversation with the user. |





**Returns:** `void`





___

<a id="onprocessrequest"></a>

###  onProcessRequest

► **onProcessRequest**(context: *[BotContext](botbuilder.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:41](https://github.com/Microsoft/botbuilder-js/blob/f1f9b42/libraries/botbuilder-core-extensions/lib/botState.d.ts#L41)*



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



*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:47](https://github.com/Microsoft/botbuilder-js/blob/f1f9b42/libraries/botbuilder-core-extensions/lib/botState.d.ts#L47)*



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



*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:53](https://github.com/Microsoft/botbuilder-js/blob/f1f9b42/libraries/botbuilder-core-extensions/lib/botState.d.ts#L53)*



Writes out the state object if it's been changed.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  Context for current turn of conversation with the user. |
| force | `undefined`⎮`true`⎮`false`   |  (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`. |





**Returns:** `Promise`.<`void`>





___


