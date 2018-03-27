[Bot Builder SDK](../README.md) > [BotState](../classes/botbuilder.botstate.md)



# Class: BotState


:package: **botbuilder-core-extensions**

Reads and writes state for your bot to storage. When used as middleware the state will automatically be read in before your bots logic runs and then written back out open completion of your bots logic.

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

* [storage](botbuilder.botstate.md#storage)
* [storageKey](botbuilder.botstate.md#storagekey)


### Methods

* [clear](botbuilder.botstate.md#clear)
* [get](botbuilder.botstate.md#get)
* [onProcessRequest](botbuilder.botstate.md#onprocessrequest)
* [read](botbuilder.botstate.md#read)
* [write](botbuilder.botstate.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BotState**(storage: *[Storage](../interfaces/botbuilder.storage.md)*, storageKey: *[StorageKeyFactory](../#storagekeyfactory)*): [BotState](botbuilder.botstate.md)


*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/botState.d.ts#L31)*



Creates a new BotState instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| storage | [Storage](../interfaces/botbuilder.storage.md)   |  Storage provider to persist the state object to. |
| storageKey | [StorageKeyFactory](../#storagekeyfactory)   |  Function called anytime the storage key for a given turn needs to be known. |





**Returns:** [BotState](botbuilder.botstate.md)

---


## Properties
<a id="storage"></a>

### «Protected» storage

**●  storage**:  *[Storage](../interfaces/botbuilder.storage.md)* 

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/botState.d.ts#L29)*





___

<a id="storagekey"></a>

### «Protected» storageKey

**●  storageKey**:  *[StorageKeyFactory](../#storagekeyfactory)* 

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:30](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/botState.d.ts#L30)*





___


## Methods
<a id="clear"></a>

###  clear

► **clear**(context: *[BotContext](botbuilder.botcontext.md)*): `void`



*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/botState.d.ts#L55)*



Clears the current state object for a turn.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  Context for current turn of conversation with the user. |





**Returns:** `void`





___

<a id="get"></a>

###  get

► **get**(context: *[BotContext](botbuilder.botcontext.md)*): `T`⎮`undefined`



*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:60](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/botState.d.ts#L60)*



Returns a cached state object or undefined if not cached.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  Context for current turn of conversation with the user. |





**Returns:** `T`⎮`undefined`





___

<a id="onprocessrequest"></a>

###  onProcessRequest

► **onProcessRequest**(context: *[BotContext](botbuilder.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:38](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/botState.d.ts#L38)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="read"></a>

###  read

► **read**(context: *[BotContext](botbuilder.botcontext.md)*, force?: *`boolean`*): `Promise`.<`T`>



*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:44](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/botState.d.ts#L44)*



Reads in and caches the current state object for a turn.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  Context for current turn of conversation with the user. |
| force | `boolean`   |  (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`. |





**Returns:** `Promise`.<`T`>





___

<a id="write"></a>

###  write

► **write**(context: *[BotContext](botbuilder.botcontext.md)*, force?: *`boolean`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:50](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/botState.d.ts#L50)*



Writes out the state object if it's been changed.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  Context for current turn of conversation with the user. |
| force | `boolean`   |  (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`. |





**Returns:** `Promise`.<`void`>





___


