[Bot Builder SDK](../README.md) > [UserState](../classes/botbuilder.userstate.md)



# Class: UserState


:package: **botbuilder-core-extensions**

Reads and writes user state for your bot to storage. Each user your bot communicates with will have its own isolated storage object that can be used to persist information about the user across all of the conversation you have with that user.

Since the `UserState` class derives from `BotState` it can be used as middleware to automatically read and write the bots user state for each turn. And it also means it can be passed to a `BotStateSet` middleware instance to be managed in parallel with other state providers.

**Usage Example**

    const { UserState, MemoryStorage } = require('botbuilder');

    const userState = new UserState(new MemoryStorage());
    adapter.use(userState);

    server.post('/api/messages', (req, res) => {
       adapter.processActivity(req, res, async (context) => {
          // Get loaded user state
          const user = userState.get(context);

          // ... route activity ...

       });
    });

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
* [onTurn](botbuilder.userstate.md#onturn)
* [read](botbuilder.userstate.md#read)
* [write](botbuilder.userstate.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new UserState**(storage: *[Storage](../interfaces/botbuilder.storage.md)*, namespace?: *`string`*): [UserState](botbuilder.userstate.md)


*Overrides [BotState](botbuilder.botstate.md).[constructor](botbuilder.botstate.md#constructor)*

*Defined in [libraries/botbuilder-core-extensions/lib/userState.d.ts:42](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/userState.d.ts#L42)*



Creates a new UserState instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| storage | [Storage](../interfaces/botbuilder.storage.md)   |  Storage provider to persist user state to. |
| namespace | `string`   |  (Optional) namespace to append to storage keys. Defaults to an empty string. |





**Returns:** [UserState](botbuilder.userstate.md)

---


## Properties
<a id="storage"></a>

### «Protected» storage

**●  storage**:  *[Storage](../interfaces/botbuilder.storage.md)* 

*Inherited from [BotState](botbuilder.botstate.md).[storage](botbuilder.botstate.md#storage)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:53](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botState.d.ts#L53)*





___

<a id="storagekey"></a>

### «Protected» storageKey

**●  storageKey**:  *[StorageKeyFactory](../#storagekeyfactory)* 

*Inherited from [BotState](botbuilder.botstate.md).[storageKey](botbuilder.botstate.md#storagekey)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:54](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botState.d.ts#L54)*





___


## Methods
<a id="clear"></a>

###  clear

► **clear**(context: *[TurnContext](botbuilder.turncontext.md)*): `void`



*Inherited from [BotState](botbuilder.botstate.md).[clear](botbuilder.botstate.md#clear)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:101](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botState.d.ts#L101)*



Clears the current state object for a turn.

**Usage Example**

    botState.clear(context);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for current turn of conversation with the user. |





**Returns:** `void`





___

<a id="get"></a>

###  get

► **get**(context: *[TurnContext](botbuilder.turncontext.md)*): `T`⎮`undefined`



*Inherited from [BotState](botbuilder.botstate.md).[get](botbuilder.botstate.md#get)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:112](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botState.d.ts#L112)*



Returns a cached state object or undefined if not cached.

**Usage Example**

    const state botState.get(context);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for current turn of conversation with the user. |





**Returns:** `T`⎮`undefined`





___

<a id="getstoragekey"></a>

###  getStorageKey

► **getStorageKey**(context: *[TurnContext](botbuilder.turncontext.md)*): `string`⎮`undefined`



*Defined in [libraries/botbuilder-core-extensions/lib/userState.d.ts:53](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/userState.d.ts#L53)*



Returns the storage key for the current user state.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for current turn of conversation with the user. |





**Returns:** `string`⎮`undefined`





___

<a id="onturn"></a>

###  onTurn

► **onTurn**(context: *[TurnContext](botbuilder.turncontext.md)*, next: *`function`*): `Promise`.<`void`>



*Inherited from [BotState](botbuilder.botstate.md).[onTurn](botbuilder.botstate.md#onturn)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:62](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botState.d.ts#L62)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="read"></a>

###  read

► **read**(context: *[TurnContext](botbuilder.turncontext.md)*, force?: *`boolean`*): `Promise`.<`T`>



*Inherited from [BotState](botbuilder.botstate.md).[read](botbuilder.botstate.md#read)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:76](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botState.d.ts#L76)*



Reads in and caches the current state object for a turn. Subsequent reads will return the cached object unless the `force` flag is passed in which will force the state object to be re-read.

**Usage Example**

    const state = await botState.read(context);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for current turn of conversation with the user. |
| force | `boolean`   |  (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`. |





**Returns:** `Promise`.<`T`>





___

<a id="write"></a>

###  write

► **write**(context: *[TurnContext](botbuilder.turncontext.md)*, force?: *`boolean`*): `Promise`.<`void`>



*Inherited from [BotState](botbuilder.botstate.md).[write](botbuilder.botstate.md#write)*

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:90](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botState.d.ts#L90)*



Save the cached state object if it's been changed. If the `force` flag is passed in the cached state object will be saved regardless of whether its been changed and if no object has been a cached an empty object will created and saved.

**Usage Example**

    await botState.write(context);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for current turn of conversation with the user. |
| force | `boolean`   |  (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`. |





**Returns:** `Promise`.<`void`>





___


