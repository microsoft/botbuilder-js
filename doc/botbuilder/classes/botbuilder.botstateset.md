[Bot Builder SDK](../README.md) > [BotStateSet](../classes/botbuilder.botstateset.md)



# Class: BotStateSet


:package: **botbuilder-core-extensions**

Middleware that will call `read()` and `write()` in parallel on multiple `BotState` instances.

**Usage Example**

    const { BotStateSet, ConversationState, UserState, MemoryStorage } = require('botbuilder');

    const storage = new MemoryStorage();
    const conversationState = new ConversationState(storage);
    const userState = new UserState(storage);
    adapter.use(new BotStateSet(conversationState, userState));

    server.post('/api/messages', (req, res) => {
       adapter.processActivity(req, res, async (context) => {
          // Get state
          const convo = conversationState.get(context);
          const user = userState.get(context);

          // ... route activity ...

       });
    });

## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder.botstateset.md#constructor)


### Methods

* [onTurn](botbuilder.botstateset.md#onturn)
* [readAll](botbuilder.botstateset.md#readall)
* [use](botbuilder.botstateset.md#use)
* [writeAll](botbuilder.botstateset.md#writeall)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BotStateSet**(...middleware: *[BotState](botbuilder.botstate.md)[]*): [BotStateSet](botbuilder.botstateset.md)


*Defined in [libraries/botbuilder-core-extensions/lib/botStateSet.d.ts:40](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botStateSet.d.ts#L40)*



Creates a new BotStateSet instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| middleware | [BotState](botbuilder.botstate.md)[]   |  Zero or more BotState plugins to register. |





**Returns:** [BotStateSet](botbuilder.botstateset.md)

---


## Methods
<a id="onturn"></a>

###  onTurn

► **onTurn**(context: *[TurnContext](botbuilder.turncontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/botStateSet.d.ts:46](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botStateSet.d.ts#L46)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="readall"></a>

###  readAll

► **readAll**(context: *[TurnContext](botbuilder.turncontext.md)*, force?: *`boolean`*): `Promise`.<[StoreItem](../interfaces/botbuilder.storeitem.md)[]>



*Defined in [libraries/botbuilder-core-extensions/lib/botStateSet.d.ts:81](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botStateSet.d.ts#L81)*



Calls `BotState.read()` on all of the BotState plugins in the set. This will trigger all of the plugins to read in their state in parallel.

**Usage Example**

    await stateSet.readAll(context);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for current turn of conversation with the user. |
| force | `boolean`   |  (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`. |





**Returns:** `Promise`.<[StoreItem](../interfaces/botbuilder.storeitem.md)[]>





___

<a id="use"></a>

###  use

► **use**(...middleware: *[BotState](botbuilder.botstate.md)[]*): `this`



*Defined in [libraries/botbuilder-core-extensions/lib/botStateSet.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botStateSet.d.ts#L68)*



Registers `BotState` middleware plugins with the set.

**Usage Example**

    const stateSet = new BotStateSet();

    // Add conversation state
    const conversationState = new ConversationState();
    stateSet.use(conversationState);

    // Add user state
    const userState = new UserState();
    stateSet.use(userState);

    // Register middleware
    adapter.use(stateSet);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| middleware | [BotState](botbuilder.botstate.md)[]   |  One or more BotState plugins to register. |





**Returns:** `this`





___

<a id="writeall"></a>

###  writeAll

► **writeAll**(context: *[TurnContext](botbuilder.turncontext.md)*, force?: *`boolean`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/botStateSet.d.ts:94](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/botStateSet.d.ts#L94)*



Calls `BotState.write()` on all of the BotState plugins in the set. This will trigger all of the plugins to write out their state in parallel.

**Usage Example**

    await stateSet.writeAll(context);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for current turn of conversation with the user. |
| force | `boolean`   |  (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`. |





**Returns:** `Promise`.<`void`>





___


