[Bot Builder SDK](../README.md) > [TestFlow](../classes/botbuilder.testflow.md)



# Class: TestFlow


:package: **botbuilder-core-extensions**

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


*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:63](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L63)*



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

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:62](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L62)*





___


## Methods
<a id="assertreply"></a>

###  assertReply

► **assertReply**(expected: *`string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>⎮[TestActivityInspector](../#testactivityinspector)*, description?: *`string`*, timeout?: *`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:84](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L84)*



Throws if the bot's response doesn't match the expected text/activity


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| expected | `string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>⎮[TestActivityInspector](../#testactivityinspector)   |  expected text or activity from the bot, or callback to inspect object |
| description | `string`   |  description of test case |
| timeout | `number`   |  (default 3000ms) time to wait for response from bot |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="assertreplyoneof"></a>

###  assertReplyOneOf

► **assertReplyOneOf**(candidates: *`string`[]*, description?: *`string`*, timeout?: *`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:91](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L91)*



throws if the bot's response is not one of the candidate strings


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| candidates | `string`[]   |  candidate responses |
| description | `string`   |  description of test case |
| timeout | `number`   |  (default 3000ms) time to wait for response from bot |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="catch"></a>

###  catch

► **catch**(onRejected?: *`function`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:98](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L98)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| onRejected | `function`   |  - |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="delay"></a>

###  delay

► **delay**(ms: *`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:96](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L96)*



Insert delay before continuing


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ms | `number`   |  ms to wait |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="send"></a>

###  send

► **send**(userSays: *`string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:77](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L77)*



Send something to the bot


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userSays | `string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  text or activity simulating user input |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="test"></a>

###  test

► **test**(userSays: *`string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*, expected: *`string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>⎮`function`*, description?: *`string`*, timeout?: *`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:72](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L72)*



Send something to the bot and expect the bot to reply


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userSays | `string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  text or activity simulating user input |
| expected | `string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>⎮`function`   |  expected text or activity from the bot |
| description | `string`   |  description of test case |
| timeout | `number`   |  (default 3000ms) time to wait for response from bot |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="then"></a>

###  then

► **then**(onFulfilled?: *`function`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:97](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L97)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| onFulfilled | `function`   |  - |





**Returns:** [TestFlow](botbuilder.testflow.md)





___


