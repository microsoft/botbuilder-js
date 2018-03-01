[Bot Builder SDK](../README.md) > [TestAdapter](../classes/botbuilder.testadapter.md)



# Class: TestAdapter


:package: **botbuilder-core-extensions**

Test adapter used for unit tests.

## Hierarchy


↳  [TestAdapter](botbuilder.testadapter.md)

**↳ TestAdapter**

↳  [TestAdapter](botbuilder.testadapter.md)










## Index

### Constructors

* [constructor](botbuilder.testadapter.md#constructor)


### Properties

* [activityBuffer](botbuilder.testadapter.md#activitybuffer)
* [deletedActivities](botbuilder.testadapter.md#deletedactivities)
* [template](botbuilder.testadapter.md#template)
* [updatedActivities](botbuilder.testadapter.md#updatedactivities)


### Methods

* [deleteActivity](botbuilder.testadapter.md#deleteactivity)
* [receiveActivity](botbuilder.testadapter.md#receiveactivity)
* [send](botbuilder.testadapter.md#send)
* [sendActivities](botbuilder.testadapter.md#sendactivities)
* [test](botbuilder.testadapter.md#test)
* [updateActivity](botbuilder.testadapter.md#updateactivity)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new TestAdapter**(botLogic: *`function`*, template?: *[ConversationReference](../interfaces/botbuilder.conversationreference.md)*): [TestAdapter](botbuilder.testadapter.md)


*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/57c9ba8/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L27)*



Creates a new instance of the test adapter.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| botLogic | `function`   |  The bots logic that's under test. |
| template | [ConversationReference](../interfaces/botbuilder.conversationreference.md)   |  (Optional) activity containing default values to assign to all test messages received. |





**Returns:** [TestAdapter](botbuilder.testadapter.md)

---


## Properties
<a id="activitybuffer"></a>

###  activityBuffer

**●  activityBuffer**:  *[Partial]()[Activity](../interfaces/botbuilder.activity.md)[]* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:24](https://github.com/Microsoft/botbuilder-js/blob/57c9ba8/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L24)*



INTERNAL: used to drive the promise chain forward when running tests.




___

<a id="deletedactivities"></a>

###  deletedActivities

**●  deletedActivities**:  *[Partial]()[ConversationReference](../interfaces/botbuilder.conversationreference.md)[]* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/57c9ba8/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L27)*





___

<a id="template"></a>

###  template

**●  template**:  *[Partial]()[Activity](../interfaces/botbuilder.activity.md)* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:25](https://github.com/Microsoft/botbuilder-js/blob/57c9ba8/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L25)*





___

<a id="updatedactivities"></a>

###  updatedActivities

**●  updatedActivities**:  *[Partial]()[Activity](../interfaces/botbuilder.activity.md)[]* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:26](https://github.com/Microsoft/botbuilder-js/blob/57c9ba8/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L26)*





___


## Methods
<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(reference: *[Partial]()[ConversationReference](../interfaces/botbuilder.conversationreference.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:36](https://github.com/Microsoft/botbuilder-js/blob/57c9ba8/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L36)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [Partial]()[ConversationReference](../interfaces/botbuilder.conversationreference.md)   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="receiveactivity"></a>

###  receiveActivity

► **receiveActivity**(activity: *`string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:41](https://github.com/Microsoft/botbuilder-js/blob/57c9ba8/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L41)*



Processes and activity received from the user.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | `string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)   |  Text or activity from user. |





**Returns:** `Promise`.<`void`>





___

<a id="send"></a>

###  send

► **send**(userSays: *`string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:46](https://github.com/Microsoft/botbuilder-js/blob/57c9ba8/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L46)*



Send something to the bot


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userSays | `string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)   |  text or activity simulating user input |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="sendactivities"></a>

###  sendActivities

► **sendActivities**(activities: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)[]*): `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:34](https://github.com/Microsoft/botbuilder-js/blob/57c9ba8/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L34)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()[Activity](../interfaces/botbuilder.activity.md)[]   |  - |





**Returns:** `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>





___

<a id="test"></a>

###  test

► **test**(userSays: *`string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)*, expected: *`string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)⎮`function`*, description?: *`undefined`⎮`string`*, timeout?: *`undefined`⎮`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:54](https://github.com/Microsoft/botbuilder-js/blob/57c9ba8/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L54)*



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

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(activity: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:35](https://github.com/Microsoft/botbuilder-js/blob/57c9ba8/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L35)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()[Activity](../interfaces/botbuilder.activity.md)   |  - |





**Returns:** `Promise`.<`void`>





___


