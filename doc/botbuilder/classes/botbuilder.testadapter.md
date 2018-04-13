[Bot Builder SDK](../README.md) > [TestAdapter](../classes/botbuilder.testadapter.md)



# Class: TestAdapter


:package: **botbuilder-core-extensions**

Test adapter used for unit tests. This adapter can be used to simulate sending messages from the user to the bot.

**Usage Example**

    const { TestAdapter } = require('botbuilder');

    const adapter = new TestAdapter(async (context) => {
         await context.sendActivity(`Hello World`);
    });

    adapter.test(`hi`, `Hello World`)
           .then(() => done());

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

* [continueConversation](botbuilder.testadapter.md#continueconversation)
* [deleteActivity](botbuilder.testadapter.md#deleteactivity)
* [receiveActivity](botbuilder.testadapter.md#receiveactivity)
* [send](botbuilder.testadapter.md#send)
* [sendActivities](botbuilder.testadapter.md#sendactivities)
* [test](botbuilder.testadapter.md#test)
* [updateActivity](botbuilder.testadapter.md#updateactivity)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new TestAdapter**(logic: *`function`*, template?: *[ConversationReference](../interfaces/botbuilder.conversationreference.md)*): [TestAdapter](botbuilder.testadapter.md)


*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:74](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L74)*



Creates a new TestAdapter instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| logic | `function`   |  The bots logic that's under test. |
| template | [ConversationReference](../interfaces/botbuilder.conversationreference.md)   |  (Optional) activity containing default values to assign to all test messages received. |





**Returns:** [TestAdapter](botbuilder.testadapter.md)

---


## Properties
<a id="activitybuffer"></a>

###  activityBuffer

**●  activityBuffer**:  *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>[]* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L39)*



INTERNAL: used to drive the promise chain forward when running tests.




___

<a id="deletedactivities"></a>

###  deletedActivities

**●  deletedActivities**:  *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>[]* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:74](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L74)*



List of deleted activities passed to the adapter which can be inspected after the current turn completes.

**Usage Example**

    adapter.test('delete', '1 deleted').then(() => {
       assert(adapter.deletedActivities.length === 1);
       assert(adapter.deletedActivities[0].activityId === '12345');
       done();
    });




___

<a id="template"></a>

###  template

**●  template**:  *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:44](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L44)*



`ConversationReference` template that will be merged with all activities sent to the logic under test.




___

<a id="updatedactivities"></a>

###  updatedActivities

**●  updatedActivities**:  *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>[]* 

*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:59](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L59)*



List of updated activities passed to the adapter which can be inspected after the current turn completes.

**Usage Example**

    adapter.test('update', '1 updated').then(() => {
       assert(adapter.updatedActivities.length === 1);
       assert(adapter.updatedActivities[0].id === '12345');
       done();
    });




___


## Methods
<a id="continueconversation"></a>

###  continueConversation

► **continueConversation**(reference: *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*, logic: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:108](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L108)*



The `TestAdapter` doesn't implement `continueConversation()` and will return an error if it's called.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  - |
| logic | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(context: *[TurnContext](botbuilder.turncontext.md)*, reference: *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:103](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L103)*



INTERNAL: called by the logic under test to delete an existing activity. These are simply pushed onto a [deletedActivities](#deletedactivities) array for inspection after the turn completes.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context object for the current turn of conversation with the user. |
| reference | `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  `ConversationReference` for activity being deleted. |





**Returns:** `Promise`.<`void`>





___

<a id="receiveactivity"></a>

###  receiveActivity

► **receiveActivity**(activity: *`string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:114](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L114)*



INTERNAL: called by a `TestFlow` instance to simulate a user sending a message to the bot. This will cause the adapters middleware pipe to be run and it's logic to be called.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | `string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  Text or activity from user. The current conversation reference [template](#template) will be merged the passed in activity to properly address the activity. Fields specified in the activity override fields in the template. |





**Returns:** `Promise`.<`void`>





___

<a id="send"></a>

###  send

► **send**(userSays: *`string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:128](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L128)*



Sends something to the bot. This returns a new `TestFlow` instance which can be used to add additional steps for inspecting the bots reply and then sending additional activities.

**Usage Example**

    adapter.send('hi')
           .assertReply('Hello World')
           .then(() => done());


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userSays | `string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  Text or activity simulating user input. |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="sendactivities"></a>

###  sendActivities

► **sendActivities**(context: *[TurnContext](botbuilder.turncontext.md)*, activities: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>[]*): `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:87](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L87)*



INTERNAL: called by the logic under test to send a set of activities. These will be buffered to the current `TestFlow` instance for comparison against the expected results.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context object for the current turn of conversation with the user. |
| activities | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>[]   |  Set of activities sent by logic under test. |





**Returns:** `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>





___

<a id="test"></a>

###  test

► **test**(userSays: *`string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*, expected: *`string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>⎮`function`*, description?: *`string`*, timeout?: *`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:145](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L145)*



Send something to the bot and expects the bot to return with a given reply. This is simply a wrapper around calls to `send()` and `assertReply()`. This is such a common pattern that a helper is provided.

**Usage Example**

    adapter.test('hi', 'Hello World')
           .then(() => done());


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userSays | `string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  Text or activity simulating user input. |
| expected | `string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>⎮`function`   |  Expected text or activity of the reply sent by the bot. |
| description | `string`   |  (Optional) Description of the test case. If not provided one will be generated. |
| timeout | `number`   |  (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`. |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(context: *[TurnContext](botbuilder.turncontext.md)*, activity: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core-extensions/lib/testAdapter.d.ts:95](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core-extensions/lib/testAdapter.d.ts#L95)*



INTERNAL: called by the logic under test to replace an existing activity. These are simply pushed onto an [updatedActivities](#updatedactivities) array for inspection after the turn completes.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context object for the current turn of conversation with the user. |
| activity | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  Activity being updated. |





**Returns:** `Promise`.<`void`>





___


