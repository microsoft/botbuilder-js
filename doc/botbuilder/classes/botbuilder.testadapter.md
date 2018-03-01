[Bot Builder SDK](../README.md) > [TestAdapter](../classes/botbuilder.testadapter.md)



# Class: TestAdapter


Test adapter used for unit tests.

<table>

<thead>

<tr>

<th>package</th>

<th style="text-align:center">middleware</th>

</tr>

</thead>

<tbody>

<tr>

<td>botbuilder-core-extensions</td>

<td style="text-align:center">yes</td>

</tr>

</tbody>

</table>

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


### ⊕ **new TestAdapter**(botLogic: *`function`*, template?: *`ConversationReference`*): [TestAdapter](botbuilder.testadapter.md)


*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:24](https://github.com/Microsoft/botbuilder-js/blob/f8c834f/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L24)*



Creates a new instance of the test adapter.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| botLogic | `function`   |  The bots logic that's under test. |
| template | `ConversationReference`   |  (Optional) activity containing default values to assign to all test messages received. |





**Returns:** [TestAdapter](botbuilder.testadapter.md)

---


## Properties
<a id="activitybuffer"></a>

###  activityBuffer

**●  activityBuffer**:  *[Partial]()`Activity`[]* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/f8c834f/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L21)*



INTERNAL: used to drive the promise chain forward when running tests.




___

<a id="deletedactivities"></a>

###  deletedActivities

**●  deletedActivities**:  *[Partial]()`ConversationReference`[]* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:24](https://github.com/Microsoft/botbuilder-js/blob/f8c834f/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L24)*





___

<a id="template"></a>

###  template

**●  template**:  *[Partial]()`Activity`* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:22](https://github.com/Microsoft/botbuilder-js/blob/f8c834f/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L22)*





___

<a id="updatedactivities"></a>

###  updatedActivities

**●  updatedActivities**:  *[Partial]()`Activity`[]* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:23](https://github.com/Microsoft/botbuilder-js/blob/f8c834f/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L23)*





___


## Methods
<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(reference: *[Partial]()`ConversationReference`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/f8c834f/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L33)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [Partial]()`ConversationReference`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="receiveactivity"></a>

###  receiveActivity

► **receiveActivity**(activity: *`string`⎮[Partial]()`Activity`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:38](https://github.com/Microsoft/botbuilder-js/blob/f8c834f/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L38)*



Processes and activity received from the user.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | `string`⎮[Partial]()`Activity`   |  Text or activity from user. |





**Returns:** `Promise`.<`void`>





___

<a id="send"></a>

###  send

► **send**(userSays: *`string`⎮[Partial]()`Activity`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:43](https://github.com/Microsoft/botbuilder-js/blob/f8c834f/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L43)*



Send something to the bot


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userSays | `string`⎮[Partial]()`Activity`   |  text or activity simulating user input |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="sendactivities"></a>

###  sendActivities

► **sendActivities**(activities: *[Partial]()`Activity`[]*): `Promise`.<`ResourceResponse`[]>



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/f8c834f/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L31)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()`Activity`[]   |  - |





**Returns:** `Promise`.<`ResourceResponse`[]>





___

<a id="test"></a>

###  test

► **test**(userSays: *`string`⎮[Partial]()`Activity`*, expected: *`string`⎮[Partial]()`Activity`⎮`function`*, description?: *`undefined`⎮`string`*, timeout?: *`undefined`⎮`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:51](https://github.com/Microsoft/botbuilder-js/blob/f8c834f/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L51)*



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

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(activity: *[Partial]()`Activity`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/f8c834f/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L32)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()`Activity`   |  - |





**Returns:** `Promise`.<`void`>





___


