[Bot Builder SDK - Core](../README.md) > [TestAdapter](../classes/botbuilder.testadapter.md)



# Class: TestAdapter


Test adapter used for unit tests.
*__example__*:     
    const adapter = new TestAdapater();
    const bot = new Bot(adapter)
         .use(new MemoryStorage())
         .use(new BotStateManage())
         .onReceive((context) => {
             const cnt = context.state.conversation.next || 1;
             context.reply(`reply: ${cnt}`);
             context.state.conversation.next = cnt + 1;
         });
    adapter.test('inc', 'reply: 1')
             .test('inc', 'reply: 2')
             .test('inc', 'reply: 3')
             .then(() => done());


## Implements

* [ActivityAdapter](../interfaces/botbuilder.activityadapter.md)

## Index

### Constructors

* [constructor](botbuilder.testadapter.md#constructor)


### Properties

* [botReplies](botbuilder.testadapter.md#botreplies)
* [onReceive](botbuilder.testadapter.md#onreceive)
* [reference](botbuilder.testadapter.md#reference)


### Methods

* [_sendActivityToBot](botbuilder.testadapter.md#_sendactivitytobot)
* [assertReply](botbuilder.testadapter.md#assertreply)
* [assertReplyOneOf](botbuilder.testadapter.md#assertreplyoneof)
* [delay](botbuilder.testadapter.md#delay)
* [post](botbuilder.testadapter.md#post)
* [send](botbuilder.testadapter.md#send)
* [test](botbuilder.testadapter.md#test)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new TestAdapter**(reference?: *[ConversationReference](../interfaces/botbuilder.conversationreference.md)*): [TestAdapter](botbuilder.testadapter.md)


*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:34](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/testAdapter.d.ts#L34)*



Creates a new instance of the test adapter.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [ConversationReference](../interfaces/botbuilder.conversationreference.md)   |  (Optional) conversation reference that lets you customize the addressinformation for messages sent during a test. |





**Returns:** [TestAdapter](botbuilder.testadapter.md)

---


## Properties
<a id="botreplies"></a>

###  botReplies

**●  botReplies**:  *[Activity](../interfaces/botbuilder.activity.md)[]* 

*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/testAdapter.d.ts#L32)*





___

<a id="onreceive"></a>

###  onReceive

**●  onReceive**:  *`function`* 

*Implementation of [ActivityAdapter](../interfaces/botbuilder.activityadapter.md).[onReceive](../interfaces/botbuilder.activityadapter.md#onreceive)*

*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:34](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/testAdapter.d.ts#L34)*



INTERNAL implementation of `Adapter.onReceive`.

#### Type declaration
►(activity: *[Activity](../interfaces/botbuilder.activity.md)*): `Promise`.<`void`>



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Activity](../interfaces/botbuilder.activity.md)   |  - |





**Returns:** `Promise`.<`void`>






___

<a id="reference"></a>

###  reference

**●  reference**:  *[ConversationReference](../interfaces/botbuilder.conversationreference.md)* 

*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/testAdapter.d.ts#L31)*





___


## Methods
<a id="_sendactivitytobot"></a>

###  _sendActivityToBot

► **_sendActivityToBot**(userSays: *`string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:43](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/testAdapter.d.ts#L43)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| userSays | `string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="assertreply"></a>

###  assertReply

► **assertReply**(expected: *`string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)⎮`function`*, description?: *`undefined`⎮`string`*, timeout?: *`undefined`⎮`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/testAdapter.d.ts#L68)*



Throws if the bot's response doesn't match the expected text/activity


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| expected | `string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)⎮`function`   |  expected text or activity from the bot |
| description | `undefined`⎮`string`   |  description of test case |
| timeout | `undefined`⎮`number`   |  (default 3000ms) time to wait for response from bot |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="assertreplyoneof"></a>

###  assertReplyOneOf

► **assertReplyOneOf**(candidates: *`string`[]*, description?: *`undefined`⎮`string`*, timeout?: *`undefined`⎮`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:75](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/testAdapter.d.ts#L75)*



throws if the bot's response is not one of the candidate strings


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| candidates | `string`[]   |  candidate responses |
| description | `undefined`⎮`string`   |  description of test case |
| timeout | `undefined`⎮`number`   |  (default 3000ms) time to wait for response from bot |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="delay"></a>

###  delay

► **delay**(ms: *`number`*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:53](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/testAdapter.d.ts#L53)*



wait for time period to pass before continuing


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| ms | `number`   |  ms to wait for |





**Returns:** [TestFlow](botbuilder.testflow.md)





___

<a id="post"></a>

###  post

► **post**(activities: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)[]*): `Promise`.<`undefined`>



*Implementation of [ActivityAdapter](../interfaces/botbuilder.activityadapter.md).[post](../interfaces/botbuilder.activityadapter.md#post)*

*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:42](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/testAdapter.d.ts#L42)*



INTERNAL implementation of `Adapter.post()`.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()[Activity](../interfaces/botbuilder.activity.md)[]   |  - |





**Returns:** `Promise`.<`undefined`>





___

<a id="send"></a>

###  send

► **send**(userSays: *`string`⎮[Partial]()[Activity](../interfaces/botbuilder.activity.md)*): [TestFlow](botbuilder.testflow.md)



*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:48](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/testAdapter.d.ts#L48)*



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



*Defined in [libraries/botbuilder/lib/testAdapter.d.ts:61](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/testAdapter.d.ts#L61)*



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


