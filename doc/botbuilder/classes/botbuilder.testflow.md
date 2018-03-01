[Bot Builder SDK](../README.md) > [TestFlow](../classes/botbuilder.testflow.md)



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


*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:56](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L56)*



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

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L55)*





___


## Methods
<a id="assertreply"></a>

###  assertReply

► **assertReply**(expected: *`string`⎮[Partial]()`Activity`⎮[TestActivityInspector](../#testactivityinspector)*, description?: *`undefined`⎮`string`*, timeout?: *`undefined`⎮`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:77](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L77)*



Throws if the bot's response doesn't match the expected text/activity


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| expected | `string`⎮[Partial]()`Activity`⎮[TestActivityInspector](../#testactivityinspector)   |  expected text or activity from the bot, or callback to inspect object |
| description | `undefined`⎮`string`   |  description of test case |
| timeout | `undefined`⎮`number`   |  (default 3000ms) time to wait for response from bot |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="assertreplyoneof"></a>

###  assertReplyOneOf

► **assertReplyOneOf**(candidates: *`string`[]*, description?: *`undefined`⎮`string`*, timeout?: *`undefined`⎮`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:84](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L84)*



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



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:91](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L91)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| onRejected | `undefined`⎮`function`   |  - |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="delay"></a>

###  delay

► **delay**(ms: *`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:89](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L89)*



Insert delay before continuing


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ms | `number`   |  ms to wait |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="send"></a>

###  send

► **send**(userSays: *`string`⎮[Partial]()`Activity`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:70](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L70)*



Send something to the bot


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userSays | `string`⎮[Partial]()`Activity`   |  text or activity simulating user input |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="test"></a>

###  test

► **test**(userSays: *`string`⎮[Partial]()`Activity`*, expected: *`string`⎮[Partial]()`Activity`⎮`function`*, description?: *`undefined`⎮`string`*, timeout?: *`undefined`⎮`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:65](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L65)*



Send something to the bot and expect the bot to reply


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userSays | `string`⎮[Partial]()`Activity`   |  text or activity simulating user input |
| expected | `string`⎮[Partial]()`Activity`⎮`function`   |  expected text or activity from the bot |
| description | `undefined`⎮`string`   |  description of test case |
| timeout | `undefined`⎮`number`   |  (default 3000ms) time to wait for response from bot |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="then"></a>

###  then

► **then**(onFulfilled?: *`undefined`⎮`function`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:90](https://github.com/Microsoft/botbuilder-js/blob/b68a82a/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L90)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| onFulfilled | `undefined`⎮`function`   |  - |





**Returns:** [TestFlow](botbuilder.testflow.md)





___


