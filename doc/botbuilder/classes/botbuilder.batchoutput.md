[Bot Builder SDK](../README.md) > [BatchOutput](../classes/botbuilder.batchoutput.md)



# Class: BatchOutput


:package: **botbuilder-core-extensions**

A fluent style mechanism for composing a batch of outgoing activities. You can use this class on its own anywhere within your bot and you will just need to ensure that you call [flush()](#flush) before the turn completes:

     return new BatchOutput(context)
         .typing()
         .delay(1000)
         .reply(`Hi... What's your name?`)
         .flush();

The other option is to use this class as a piece of middleware. This will add a new `context.batch` property which you can use to call any of the methods below. It will also automatically flush all queued responses upon completion of the turn, eliminating the need to explicitly call flush:

     adapter.use(new BatchOutput());

     adapter.processRequest(req, res, (context) => {
         context.batch.reply(`Hello World`);
     });

For TypeScript users you can use a custom interface that extends the `BotContext` interface to get full intellisense for the added property:

     interface MyContext extends BotContext {
         readonly batch: BatchOutput;
     }

     adapter.use(new BatchOutput());

     adapter.processRequest(req, res, (context: MyContext) => {
         context.batch.reply(`Hello World`);
     });

The class supports mixed modes of usage so it's fine to both use it as middleware and then create a new instance of the class somewhere else within your bots logic or within other middleware.

## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder.batchoutput.md#constructor)


### Methods

* [delay](botbuilder.batchoutput.md#delay)
* [endOfConversation](botbuilder.batchoutput.md#endofconversation)
* [event](botbuilder.batchoutput.md#event)
* [flush](botbuilder.batchoutput.md#flush)
* [onProcessRequest](botbuilder.batchoutput.md#onprocessrequest)
* [reply](botbuilder.batchoutput.md#reply)
* [typing](botbuilder.batchoutput.md#typing)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BatchOutput**(context?: *[BotContext](botbuilder.botcontext.md)⎮`undefined`*): [BatchOutput](botbuilder.batchoutput.md)


*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:57](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L57)*



Creates a new BatchOutput instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)⎮`undefined`   |  (Optional) context for the current turn of conversation. This can be omitted when creating an instance of the class to use as middleware. |





**Returns:** [BatchOutput](botbuilder.batchoutput.md)

---


## Methods
<a id="delay"></a>

###  delay

► **delay**(ms: *`number`*): `this`



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:75](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L75)*



Adds a delay to the batch. This can be used to pause after sending a typing indicator or after sending a card with image(s).

Most chat clients download any images sent by the bot to a CDN which can delay the showing of the message to the user. If a bot sends a message with only text immediately after sending a message with images, the messages could end up being shown to the user out of order. To help prevent this you can insert a delay of 2 seconds or so in between replies.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ms | `number`   |  Number of milliseconds to pause before delivering the next activity in the batch. |





**Returns:** `this`





___

<a id="endofconversation"></a>

###  endOfConversation

► **endOfConversation**(code?: *[EndOfConversationCodes](../enums/botbuilder.endofconversationcodes.md)⎮`string`*): `this`



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:93](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L93)*



Adds an `endOfConversation` activity to the batch indicating that the bot has completed it's current task or skill. For channels like Cortana this is used to tell Cortana that the skill has completed and the skills window should close.

When used in conjunction with the `ConversationState` middleware, sending an `endOfConversation` activity will cause the bots conversation state to be automatically cleared. If you're building a Cortana skill this helps ensure that the next time your skill is invoked it will be in a clean state given that you won't always get a new conversation ID in between invocations.

Even for non-Cortana bots it's a good practice to send an `endOfConversation` anytime you complete a task with the user as it will give your bot a chance to clear its conversation state and helps avoid your bot getting into a bad state for a conversation.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | [EndOfConversationCodes](../enums/botbuilder.endofconversationcodes.md)⎮`string`   |  (Optional) code to indicate why the bot/skill is ending. Defaults to`EndOfConversationCodes.CompletedSuccessfully`. |





**Returns:** `this`





___

<a id="event"></a>

###  event

► **event**(name: *`string`*, value?: *`any`*): `this`



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:100](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L100)*



Adds an `event` activity to the batch. This is most useful for DirectLine and WebChat channels as a way for the bot to send a custom named event to the client.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| name | `string`   |  Name of the event being sent. |
| value | `any`   |  (Optional) value to include with the event. |





**Returns:** `this`





___

<a id="flush"></a>

###  flush

► **flush**(): `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:104](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L104)*



Flushes the batch causing all activities in the batch to be immediately sent to the user.




**Returns:** `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>





___

<a id="onprocessrequest"></a>

###  onProcessRequest

► **onProcessRequest**(context: *[BotContext](botbuilder.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:64](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L64)*



INTERNAL called by the adapter when used as middleware.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="reply"></a>

###  reply

► **reply**(textOrActivity: *`string`*, speak?: *`undefined`⎮`string`*, inputHint?: *`undefined`⎮`string`*): `this`

► **reply**(textOrActivity: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)*): `this`



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:111](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L111)*



Adds a `message` activity to the batch.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| textOrActivity | `string`   |  Text or activity to add to the batch. If text a new `message` activity will be created. If an activity and missing a `type`, the type will be set to `message`. |
| speak | `undefined`⎮`string`   |  (Optional) SSML to add to the activity. |
| inputHint | `undefined`⎮`string`   |  (Optional) `inputHint` to assign to the activity. |





**Returns:** `this`



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:112](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L112)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| textOrActivity | [Partial]()[Activity](../interfaces/botbuilder.activity.md)   |  - |





**Returns:** `this`





___

<a id="typing"></a>

###  typing

► **typing**(): `this`



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:116](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L116)*



Adds a `typing` activity to the batch.




**Returns:** `this`





___


