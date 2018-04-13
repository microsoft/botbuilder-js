[Bot Builder SDK](../README.md) > [BotState](../classes/botbuilder.botstate.md)



# Class: BotState


:package: **botbuilder-core-extensions**

Reads and writes state for your bot to storage. The state object will be automatically cached on the context object for the lifetime of the turn and will only be written to storage if they have been modified.

When a `BotState` instance is used as middleware its state object will be automatically read in before your bots logic runs and then intelligently written back out upon completion of your bots logic. Multiple instances can be read and written in parallel using the `BotStateSet` middleware.

**Usage Example**

    const { BotState, MemoryStorage } = require('botbuilder');

    const storage = new MemoryStorage();
    const botState = new BotState(storage, (context) => 'botState');
    adapter.use(botState);

    server.post('/api/messages', (req, res) => {
       adapter.processActivity(req, res, async (context) => {
          // Track up time
          const state = botState.get(context);
          if (!('startTime' in state)) { state.startTime = new Date().getTime() }
          state.upTime = new Date().getTime() - state.stateTime;

          // ... route activity ...

       });
    });

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
* [onTurn](botbuilder.botstate.md#onturn)
* [read](botbuilder.botstate.md#read)
* [write](botbuilder.botstate.md#write)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BotState**(storage: *[Storage](../interfaces/botbuilder.storage.md)*, storageKey: *[StorageKeyFactory](../#storagekeyfactory)*): [BotState](botbuilder.botstate.md)


*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botState.d.ts#L55)*



Creates a new BotState instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| storage | [Storage](../interfaces/botbuilder.storage.md)   |  Storage provider to persist the state object to. |
| storageKey | [StorageKeyFactory](../#storagekeyfactory)   |  Function called anytime the storage key for a given turn needs to be calculated. |





**Returns:** [BotState](botbuilder.botstate.md)

---


## Properties
<a id="storage"></a>

### «Protected» storage

**●  storage**:  *[Storage](../interfaces/botbuilder.storage.md)* 

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:53](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botState.d.ts#L53)*





___

<a id="storagekey"></a>

### «Protected» storageKey

**●  storageKey**:  *[StorageKeyFactory](../#storagekeyfactory)* 

*Defined in [libraries/botbuilder-core-extensions/lib/botState.d.ts:54](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botState.d.ts#L54)*





___


## Methods
<a id="clear"></a>

###  clear

► **clear**(context: *[TurnContext](botbuilder.turncontext.md)*): `void`



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

<a id="onturn"></a>

###  onTurn

► **onTurn**(context: *[TurnContext](botbuilder.turncontext.md)*, next: *`function`*): `Promise`.<`void`>



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


