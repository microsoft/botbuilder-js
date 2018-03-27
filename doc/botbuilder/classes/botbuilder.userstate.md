[Bot Builder SDK](../README.md) > [UserState](../classes/botbuilder.userstate.md)



# Class: UserState


:package: **botbuilder-core-extensions**

Reads and writes user state for your bot to storage. When used as middleware the state will automatically be read in before your bots logic runs and then written back out open completion of your bots logic.

## Type parameters
#### T :  [StoreItem](../interfaces/botbuilder.storeitem.md)
## Hierarchy


 [BotState](botbuilder.botstate.md)`T`

**↳ UserState**







## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder.userstate.md#constructor)


### Properties

* [storage](botbuilder.userstate.md#storage)
* [storageKey](botbuilder.userstate.md#storagekey)


### Methods

* [clear](botbuilder.userstate.md#clear)
* [get](botbuilder.userstate.md#get)
* [getStorageKey](botbuilder.userstate.md#getstoragekey)
* [onProcessRequest](botbuilder.userstate.md#onprocessrequest)
* [read](botbuilder.userstate.md#read)
* [write](botbuilder.userstate.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new UserState**(storage: *[Storage](../interfaces/botbuilder.storage.md)*): [UserState](botbuilder.userstate.md)


*Overrides [BotState](botbuilder.botstate.md).[constructor](botbuilder.botstate.md#constructor)*

*Defined in [libraries/botbuilder-core-extensions/lib/userState.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/userState.d.ts#L18)*



Creates a new UserState instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| storage | [Storage](../interfaces/botbuilder.storage.md)   |  Storage provider to persist user state to. |





**Returns:** [UserState](botbuilder.userstate.md)

---


## Properties
<a id="storage"></a>

### «Protected» storage

**●  storage**:  *[Storage](../interfaces/botbuilder.storage.md)* 

*Inherited from [BotState](botbuilder.botstate.md).[storage](botbuilder.botstate.md#storage)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/botState.d.ts#L29)*





___

<a id="storagekey"></a>

### «Protected» storageKey

**●  storageKey**:  *[StorageKeyFactory](../#storagekeyfactory)* 

*Inherited from [BotState](botbuilder.botstate.md).[storageKey](botbuilder.botstate.md#storagekey)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:30](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/botState.d.ts#L30)*





___


## Methods
<a id="clear"></a>

###  clear

► **clear**(context: *[BotContext](botbuilder.botcontext.md)*): `void`



*Inherited from [BotState](botbuilder.botstate.md).[clear](botbuilder.botstate.md#clear)*

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



*Inherited from [BotState](botbuilder.botstate.md).[get](botbuilder.botstate.md#get)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:60](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/botState.d.ts#L60)*



Returns a cached state object or undefined if not cached.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  Context for current turn of conversation with the user. |





**Returns:** `T`⎮`undefined`





___

<a id="getstoragekey"></a>

###  getStorageKey

► **getStorageKey**(context: *[BotContext](botbuilder.botcontext.md)*): `string`⎮`undefined`



*Defined in [libraries/botbuilder-core-extensions/lib/userState.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/userState.d.ts#L28)*



Returns the storage key for the current user state.


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



*Inherited from [BotState](botbuilder.botstate.md).[read](botbuilder.botstate.md#read)*

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



*Inherited from [BotState](botbuilder.botstate.md).[write](botbuilder.botstate.md#write)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:50](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/botState.d.ts#L50)*



Writes out the state object if it's been changed.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  Context for current turn of conversation with the user. |
| force | `boolean`   |  (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`. |





**Returns:** `Promise`.<`void`>





___


