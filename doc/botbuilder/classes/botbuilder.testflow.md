[Bot Builder SDK - Core](../README.md) > [TestFlow](../classes/botbuilder.testflow.md)



# Class: TestFlow


INTERNAL support class for `TestAdapter`.

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


*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:80](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/testAdapter.d.ts#L80)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| previous | `Promise`.<`void`>   |  - |
| adapter | [TestAdapter](botbuilder.testadapter.md)   |  - |





**Returns:** [TestFlow](botbuilder.testflow.md)

---


## Properties
<a id="previous"></a>

###  previous

**●  previous**:  *`Promise`.<`void`>* 

*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:79](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/testAdapter.d.ts#L79)*





___


## Methods
<a id="assertreply"></a>

###  assertReply

► **assertReply**(expected: *`string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)⎮`function`*, description?: *`undefined`⎮`string`*, timeout?: *`undefined`⎮`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:101](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/testAdapter.d.ts#L101)*



Throws if the bot's response doesn't match the expected text/activity


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| expected | `string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)⎮`function`   |  expected text or activity from the bot, or callback to inspect object |
| description | `undefined`⎮`string`   |  description of test case |
| timeout | `undefined`⎮`number`   |  (default 3000ms) time to wait for response from bot |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="assertreplyoneof"></a>

###  assertReplyOneOf

► **assertReplyOneOf**(candidates: *`string`[]*, description?: *`undefined`⎮`string`*, timeout?: *`undefined`⎮`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:108](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/testAdapter.d.ts#L108)*



throws if the bot's response is not one of the candidate strings


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| candidates | `string`[]   |  candidate responses |
| description | `undefined`⎮`string`   |  description of test case |
| timeout | `undefined`⎮`number`   |  (default 3000ms) time to wait for response from bot |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="catch"></a>

###  catch

► **catch**(onRejected?: *`undefined`⎮`function`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:116](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/testAdapter.d.ts#L116)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| onRejected | `undefined`⎮`function`   |  - |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="delay"></a>

###  delay

► **delay**(ms: *`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:113](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/testAdapter.d.ts#L113)*



Insert delay before continuing


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ms | `number`   |  ms to wait |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="send"></a>

###  send

► **send**(userSays: *`string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:94](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/testAdapter.d.ts#L94)*



Send something to the bot


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userSays | `string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)   |  text or activity simulating user input |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="test"></a>

###  test

► **test**(userSays: *`string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)*, expected: *`string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)⎮`function`*, description?: *`undefined`⎮`string`*, timeout?: *`undefined`⎮`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:89](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/testAdapter.d.ts#L89)*



Send something to the bot and expect the bot to reply


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userSays | `string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)   |  text or activity simulating user input |
| expected | `string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)⎮`function`   |  expected text or activity from the bot |
| description | `undefined`⎮`string`   |  description of test case |
| timeout | `undefined`⎮`number`   |  (default 3000ms) time to wait for response from bot |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="then"></a>

###  then

► **then**(onFulfilled?: *`undefined`⎮`function`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:115](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/testAdapter.d.ts#L115)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| onFulfilled | `undefined`⎮`function`   |  - |





**Returns:** [TestFlow](botbuilder.testflow.md)





___


