[Bot Builder SDK](../README.md) > [BotContext](../classes/botbuilder.botcontext.md)



# Class: BotContext

## Index

### Constructors

* [constructor](botbuilder.botcontext.md#constructor)


### Properties

* [adapter](botbuilder.botcontext.md#adapter)
* [request](botbuilder.botcontext.md#request)
* [responded](botbuilder.botcontext.md#responded)


### Methods

* [deleteActivity](botbuilder.botcontext.md#deleteactivity)
* [get](botbuilder.botcontext.md#get)
* [has](botbuilder.botcontext.md#has)
* [onDeleteActivity](botbuilder.botcontext.md#ondeleteactivity)
* [onSendActivities](botbuilder.botcontext.md#onsendactivities)
* [onUpdateActivity](botbuilder.botcontext.md#onupdateactivity)
* [sendActivities](botbuilder.botcontext.md#sendactivities)
* [set](botbuilder.botcontext.md#set)
* [updateActivity](botbuilder.botcontext.md#updateactivity)
* [applyConversationReference](botbuilder.botcontext.md#applyconversationreference)
* [getConversationReference](botbuilder.botcontext.md#getconversationreference)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BotContext**(adapter: *[BotAdapter](botbuilder.botadapter.md)*, request: *[Partial]()`Activity`*): [BotContext](botbuilder.botcontext.md)


*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:23](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L23)*



Creates a new turn context instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| adapter | [BotAdapter](botbuilder.botadapter.md)   |  Adapter that constructed the context. |
| request | [Partial]()`Activity`   |  Request being processed. |





**Returns:** [BotContext](botbuilder.botcontext.md)

---


## Properties
<a id="adapter"></a>

###  adapter

**●  adapter**:  *[BotAdapter](botbuilder.botadapter.md)* 

*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L31)*



The adapter for this context.




___

<a id="request"></a>

###  request

**●  request**:  *`Activity`* 

*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L33)*



The received activity.




___

<a id="responded"></a>

###  responded

**●  responded**:  *`boolean`* 

*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:35](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L35)*



If `true` at least one response has been sent for the current turn of conversation.




___


## Methods
<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(idOrReference: *`string`⎮[Partial]()`ConversationReference`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L68)*



Deletes an existing activity.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| idOrReference | `string`⎮[Partial]()`ConversationReference`   |  ID or conversation of the activity being deleted. If an ID is specified the conversation reference information from the current request will be used to delete the activity. |





**Returns:** `Promise`.<`void`>





___

<a id="get"></a>

###  get

► **get**T(key: *`string`*): `T`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:41](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L41)*



Gets a value previously cached on the context.


**Type parameters:**

#### T 

(Optional) type of value being returned.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| key | `string`   |  The key to lookup in the cache. |





**Returns:** `T`





___

<a id="has"></a>

###  has

► **has**(key: *`string`*): `boolean`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:46](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L46)*



Returns `true` if [set()](#set) has been called for a key. The cached value may be `undefined`.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| key | `string`   |  The key to lookup in the cache. |





**Returns:** `boolean`





___

<a id="ondeleteactivity"></a>

###  onDeleteActivity

► **onDeleteActivity**(handler: *[DeleteActivityHandler](../#deleteactivityhandler)*): `this`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:83](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L83)*



Registers a handler to be notified of and potentially intercept an activity being deleted.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| handler | [DeleteActivityHandler](../#deleteactivityhandler)   |  A function that will be called anytime [deleteActivity()](#deleteactivity) is called. The handler should call `next()` to continue deletion of the activity. |





**Returns:** `this`





___

<a id="onsendactivities"></a>

###  onSendActivities

► **onSendActivities**(handler: *[SendActivitiesHandler](../#sendactivitieshandler)*): `this`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:73](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L73)*



Registers a handler to be notified of and potentially intercept the sending of activities.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| handler | [SendActivitiesHandler](../#sendactivitieshandler)   |  A function that will be called anytime [sendActivities()](#sendactivities) is called. The handler should call `next()` to continue sending of the activities. |





**Returns:** `this`





___

<a id="onupdateactivity"></a>

###  onUpdateActivity

► **onUpdateActivity**(handler: *[UpdateActivityHandler](../#updateactivityhandler)*): `this`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:78](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L78)*



Registers a handler to be notified of and potentially intercept an activity being updated.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| handler | [UpdateActivityHandler](../#updateactivityhandler)   |  A function that will be called anytime [updateActivity()](#updateactivity) is called. The handler should call `next()` to continue sending of the replacement activity. |





**Returns:** `this`





___

<a id="sendactivities"></a>

###  sendActivities

► **sendActivities**(...activities: *[Partial]()`Activity`[]*): `Promise`.<`ResourceResponse`[]>



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:58](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L58)*



Sends a set of activities to the user. An array of responses form the server will be returned.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()`Activity`[]   |  One or more activities to send to the user. |





**Returns:** `Promise`.<`ResourceResponse`[]>





___

<a id="set"></a>

###  set

► **set**(key: *`string`*, value: *`any`*): `this`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:52](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L52)*



Caches a value for the lifetime of the current turn.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| key | `string`   |  The key of the value being cached. |
| value | `any`   |  The value to cache. |





**Returns:** `this`





___

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(activity: *[Partial]()`Activity`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:63](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L63)*



Replaces an existing activity.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()`Activity`   |  New replacement activity. The activity should already have it's ID information populated. |





**Returns:** `Promise`.<`void`>





___

<a id="applyconversationreference"></a>

### «Static» applyConversationReference

► **applyConversationReference**(activity: *[Partial]()`Activity`*, reference: *[Partial]()`ConversationReference`*, isIncoming?: *`undefined`⎮`true`⎮`false`*): [Partial]()`Activity`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:114](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L114)*



Updates an activity with the delivery information from a conversation reference. Calling this after [getConversationReference()](#getconversationreference) on an incoming activity will properly address the reply to a received activity.

**Usage Example**

    // Send a typing indicator without calling any handlers
    const reference = TurnContext.getConversationReference(context.request);
    const activity = TurnContext.applyConversationReference({ type: 'typing' }, reference);
    return context.adapter.sendActivities([activity]);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()`Activity`   |  Activity to copy delivery information to. |
| reference | [Partial]()`ConversationReference`   |  Conversation reference containing delivery information. |
| isIncoming | `undefined`⎮`true`⎮`false`   |  (Optional) flag indicating whether the activity is an incoming or outgoing activity. Defaults to `false` indicating the activity is outgoing. |





**Returns:** [Partial]()`Activity`





___

<a id="getconversationreference"></a>

### «Static» getConversationReference

► **getConversationReference**(activity: *[Partial]()`Activity`*): [Partial]()`ConversationReference`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:96](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botContext.d.ts#L96)*



Returns the conversation reference for an activity. This can be saved as a plain old JSON object and then later used to message the user proactively.

**Usage Example**

    const reference = TurnContext.getConversationReference(context.request);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()`Activity`   |  The activity to copy the conversation reference from |





**Returns:** [Partial]()`ConversationReference`





___


