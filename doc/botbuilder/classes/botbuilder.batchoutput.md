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


*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:57](https://github.com/Microsoft/botbuilder-js/blob/99f6a4a/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L57)*



Creates a new BatchOutput instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)⎮`undefined`   |  - |





**Returns:** [BatchOutput](botbuilder.batchoutput.md)

---


## Methods
<a id="delay"></a>

###  delay

► **delay**(ms: *`number`*): `this`



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:63](https://github.com/Microsoft/botbuilder-js/blob/99f6a4a/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L63)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ms | `number`   |  - |





**Returns:** `this`





___

<a id="endofconversation"></a>

###  endOfConversation

► **endOfConversation**(code?: *[EndOfConversationCodes](../enums/botbuilder.endofconversationcodes.md)⎮`string`*): `this`



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:64](https://github.com/Microsoft/botbuilder-js/blob/99f6a4a/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L64)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| code | [EndOfConversationCodes](../enums/botbuilder.endofconversationcodes.md)⎮`string`   |  - |





**Returns:** `this`





___

<a id="event"></a>

###  event

► **event**(value?: *`any`*): `this`



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:65](https://github.com/Microsoft/botbuilder-js/blob/99f6a4a/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L65)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| value | `any`   |  - |





**Returns:** `this`





___

<a id="flush"></a>

###  flush

► **flush**(): `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:66](https://github.com/Microsoft/botbuilder-js/blob/99f6a4a/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L66)*





**Returns:** `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>





___

<a id="onprocessrequest"></a>

###  onProcessRequest

► **onProcessRequest**(context: *[BotContext](botbuilder.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:62](https://github.com/Microsoft/botbuilder-js/blob/99f6a4a/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L62)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="reply"></a>

###  reply

► **reply**(textOrActivity: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)*): `this`

► **reply**(textOrActivity: *`string`*, speak?: *`undefined`⎮`string`*, inputHint?: *`undefined`⎮`string`*): `this`



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:67](https://github.com/Microsoft/botbuilder-js/blob/99f6a4a/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L67)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| textOrActivity | [Partial]()[Activity](../interfaces/botbuilder.activity.md)   |  - |





**Returns:** `this`



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/99f6a4a/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L68)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| textOrActivity | `string`   |  - |
| speak | `undefined`⎮`string`   |  - |
| inputHint | `undefined`⎮`string`   |  - |





**Returns:** `this`





___

<a id="typing"></a>

###  typing

► **typing**(): `this`



*Defined in [libraries/botbuilder-core-extensions/lib/batchOutput.d.ts:69](https://github.com/Microsoft/botbuilder-js/blob/99f6a4a/libraries/botbuilder-core-extensions/lib/batchOutput.d.ts#L69)*





**Returns:** `this`





___


