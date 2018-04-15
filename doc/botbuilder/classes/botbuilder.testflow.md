[Bot Builder SDK](../README.md) > [TestFlow](../classes/botbuilder.testflow.md)



# Class: TestFlow


:package: **botbuilder-core-extensions**

Support class for `TestAdapter` that allows for the simple construction of a sequence of tests. Calling `adapter.send()` or `adapter.test()` will create a new test flow which you can chain together additional tests using a fluent syntax.

**Usage Example**

    const { TestAdapter } = require('botbuilder');

    const adapter = new TestAdapter(async (context) => {
       if (context.text === 'hi') {
          await context.sendActivity(`Hello World`);
       } else if (context.text === 'bye') {
          await context.sendActivity(`Goodbye`);
       }
    });

    adapter.test(`hi`, `Hello World`)
           .test(`bye`, `Goodbye`)
           .then(() => done());

## Index

### Constructors

* [constructor](botbuilder.testflow.md#constructor)


### Properties

* [previous](botbuilder.testflow.md#previous)


### Methods

* [assertReply](botbuilder.testflow.md#assertreply)
* [assertReplyOneOf](botbuilder.testflow.md#assertreplyoneof)
* [catch](botbuilder.testflow.md#catch)
* [delay](botbuilder.testflow.md#delay)
* [send](botbuilder.testflow.md#send)
* [test](botbuilder.testflow.md#test)
* [then](botbuilder.testflow.md#then)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new TestFlow**(previous: *`Promise`.<`void`>*, adapter: *[TestAdapter](botbuilder.testadapter.md)*): [TestFlow](botbuilder.testflow.md)


*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:175](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L175)*



INTERNAL: creates a new TestFlow instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| previous | `Promise`.<`void`>   |  Promise chain for the current test sequence. |
| adapter | [TestAdapter](botbuilder.testadapter.md)   |  Adapter under tested. |





**Returns:** [TestFlow](botbuilder.testflow.md)

---


## Properties
<a id="previous"></a>

###  previous

**●  previous**:  *`Promise`.<`void`>* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:174](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L174)*





___


## Methods
<a id="assertreply"></a>

###  assertReply

► **assertReply**(expected: *`string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>⎮[TestActivityInspector](../#testactivityinspector)*, description?: *`string`*, timeout?: *`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:203](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L203)*



Generates an assertion if the bots response doesn't match the expected text/activity.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| expected | `string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>⎮[TestActivityInspector](../#testactivityinspector)   |  Expected text or activity from the bot. Can be a callback to inspect the response using custom logic. |
| description | `string`   |  (Optional) Description of the test case. If not provided one will be generated. |
| timeout | `number`   |  (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`. |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="assertreplyoneof"></a>

###  assertReplyOneOf

► **assertReplyOneOf**(candidates: *`string`[]*, description?: *`string`*, timeout?: *`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:210](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L210)*



Generates an assertion if the bots response is not one of the candidate strings.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| candidates | `string`[]   |  List of candidate responses. |
| description | `string`   |  (Optional) Description of the test case. If not provided one will be generated. |
| timeout | `number`   |  (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`. |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="catch"></a>

###  catch

► **catch**(onRejected?: *`function`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:225](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L225)*



Adds a `catch()` clause to the tests promise chain.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| onRejected | `function`   |  Code to run if the test has thrown an error. |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="delay"></a>

###  delay

► **delay**(ms: *`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:215](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L215)*



Inserts a delay before continuing.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ms | `number`   |  ms to wait |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="send"></a>

###  send

► **send**(userSays: *`string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:196](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L196)*



Sends something to the bot.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userSays | `string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  Text or activity simulating user input. |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="test"></a>

###  test

► **test**(userSays: *`string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*, expected: *`string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>⎮`function`*, description?: *`string`*, timeout?: *`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:191](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L191)*



Send something to the bot and expects the bot to return with a given reply. This is simply a wrapper around calls to `send()` and `assertReply()`. This is such a common pattern that a helper is provided.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userSays | `string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  Text or activity simulating user input. |
| expected | `string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>⎮`function`   |  Expected text or activity of the reply sent by the bot. |
| description | `string`   |  (Optional) Description of the test case. If not provided one will be generated. |
| timeout | `number`   |  (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`. |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="then"></a>

###  then

► **then**(onFulfilled?: *`function`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:220](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L220)*



Adds a `then()` step to the tests promise chain.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| onFulfilled | `function`   |  Code to run if the test is currently passing. |





**Returns:** [TestFlow](botbuilder.testflow.md)





___


