[Bot Builder SDK](../README.md) > [BotContext](../classes/botbuilder.botcontext.md)



# Class: BotContext


:package: **botbuilder-core**

Context object containing information cached for a single turn of conversation with a user. This will typically be created by the adapter you're using and then passed to middleware and your bots logic.

For TypeScript developers the `BotContext` is also exposed as an interface which you can derive from to better describe the actual shape of the context object being passed around. Middleware can potentially extend the context object with additional members so in order to get intellisense for those added members you'll need to define them on an interface that extends BotContext:

    interface MyContext extends BotContext {
         // Added by UserState middleware.
         readonly userState: MyUserState;

         // Added by ConversationState middleware.
         readonly conversationState: MyConversationState;
    }

    adapter.processRequest(req, res, (context: MyContext) => {
         const state = context.conversationState;
    });

## Index

### Constructors

* [constructor](botbuilder.botcontext.md#constructor)


### Properties

* [adapter](botbuilder.botcontext.md#adapter)
* [request](botbuilder.botcontext.md#request)
* [responded](botbuilder.botcontext.md#responded)


### Methods

* [copyTo](botbuilder.botcontext.md#copyto)
* [deleteActivity](botbuilder.botcontext.md#deleteactivity)
* [get](botbuilder.botcontext.md#get)
* [has](botbuilder.botcontext.md#has)
* [onDeleteActivity](botbuilder.botcontext.md#ondeleteactivity)
* [onSendActivity](botbuilder.botcontext.md#onsendactivity)
* [onUpdateActivity](botbuilder.botcontext.md#onupdateactivity)
* [sendActivity](botbuilder.botcontext.md#sendactivity)
* [set](botbuilder.botcontext.md#set)
* [updateActivity](botbuilder.botcontext.md#updateactivity)
* [applyConversationReference](botbuilder.botcontext.md#applyconversationreference)
* [getConversationReference](botbuilder.botcontext.md#getconversationreference)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BotContext**(adapterOrContext: *[BotAdapter](botbuilder.botadapter.md)*, request: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): [BotContext](botbuilder.botcontext.md)


### ⊕ **new BotContext**(adapterOrContext: *[BotContext](botbuilder.botcontext.md)*): [BotContext](botbuilder.botcontext.md)


*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:64](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L64)*



Creates a new BotContext instance for a turn of conversation.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| adapterOrContext | [BotAdapter](botbuilder.botadapter.md)   |  Adapter that constructed the context or a context object to clone. |
| request | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  Request being processed. |





**Returns:** [BotContext](botbuilder.botcontext.md)

*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:70](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L70)*



Creates a new BotContext instance for a turn of conversation.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| adapterOrContext | [BotContext](botbuilder.botcontext.md)   |  Adapter that constructed the context or a context object to clone. |





**Returns:** [BotContext](botbuilder.botcontext.md)

---


## Properties
<a id="adapter"></a>

###  adapter

**●  adapter**:  *[BotAdapter](botbuilder.botadapter.md)* 

*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:79](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L79)*



The adapter for this context.




___

<a id="request"></a>

###  request

**●  request**:  *[Activity](../interfaces/botbuilder.activity.md)* 

*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:81](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L81)*



The received activity.




___

<a id="responded"></a>

###  responded

**●  responded**:  *`boolean`* 

*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:83](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L83)*



If `true` at least one response has been sent for the current turn of conversation.




___


## Methods
<a id="copyto"></a>

### «Protected» copyTo

► **copyTo**(context: *[BotContext](botbuilder.botcontext.md)*): `void`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:77](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L77)*



Called when this BotContext instance is passed into the constructor of a new BotContext instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  The context object to copy private members to. Everything should be copied by reference. |





**Returns:** `void`





___

<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(idOrReference: *`string`⎮`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:116](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L116)*



Deletes an existing activity.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| idOrReference | `string`⎮`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  ID or conversation of the activity being deleted. If an ID is specified the conversation reference information from the current request will be used to delete the activity. |





**Returns:** `Promise`.<`void`>





___

<a id="get"></a>

###  get

► **get**T(key: *`any`*): `T`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:89](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L89)*



Gets a value previously cached on the context.


**Type parameters:**

#### T 

(Optional) type of value being returned.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| key | `any`   |  The key to lookup in the cache. |





**Returns:** `T`





___

<a id="has"></a>

###  has

► **has**(key: *`any`*): `boolean`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:94](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L94)*



Returns `true` if [set()](#set) has been called for a key. The cached value may be `undefined`.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| key | `any`   |  The key to lookup in the cache. |





**Returns:** `boolean`





___

<a id="ondeleteactivity"></a>

###  onDeleteActivity

► **onDeleteActivity**(handler: *[DeleteActivityHandler](../#deleteactivityhandler)*): `this`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:131](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L131)*



Registers a handler to be notified of and potentially intercept an activity being deleted.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| handler | [DeleteActivityHandler](../#deleteactivityhandler)   |  A function that will be called anytime [deleteActivity()](#deleteactivity) is called. The handler should call `next()` to continue deletion of the activity. |





**Returns:** `this`





___

<a id="onsendactivity"></a>

###  onSendActivity

► **onSendActivity**(handler: *[SendActivityHandler](../#sendactivityhandler)*): `this`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:121](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L121)*



Registers a handler to be notified of and potentially intercept the sending of activities.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| handler | [SendActivityHandler](../#sendactivityhandler)   |  A function that will be called anytime [sendActivity()](#sendactivity) is called. The handler should call `next()` to continue sending of the activities. |





**Returns:** `this`





___

<a id="onupdateactivity"></a>

###  onUpdateActivity

► **onUpdateActivity**(handler: *[UpdateActivityHandler](../#updateactivityhandler)*): `this`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:126](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L126)*



Registers a handler to be notified of and potentially intercept an activity being updated.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| handler | [UpdateActivityHandler](../#updateactivityhandler)   |  A function that will be called anytime [updateActivity()](#updateactivity) is called. The handler should call `next()` to continue sending of the replacement activity. |





**Returns:** `this`





___

<a id="sendactivity"></a>

###  sendActivity

► **sendActivity**(...activityOrText: *`any`[]*): `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:106](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L106)*



Sends a set of activities to the user. An array of responses form the server will be returned.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activityOrText | `any`[]   |  One or more activities or messages to send to the user. If a `string` is provided it will be sent to the user as a `message` activity. |





**Returns:** `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>





___

<a id="set"></a>

###  set

► **set**(key: *`any`*, value: *`any`*): `this`



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:100](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L100)*



Caches a value for the lifetime of the current turn.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| key | `any`   |  The key of the value being cached. |
| value | `any`   |  The value to cache. |





**Returns:** `this`





___

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(activity: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:111](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L111)*



Replaces an existing activity.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  New replacement activity. The activity should already have it's ID information populated. |





**Returns:** `Promise`.<`void`>





___

<a id="applyconversationreference"></a>

### «Static» applyConversationReference

► **applyConversationReference**(activity: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*, reference: *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*, isIncoming?: *`boolean`*): `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:162](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L162)*



Updates an activity with the delivery information from a conversation reference. Calling this after [getConversationReference()](#getconversationreference) on an incoming activity will properly address the reply to a received activity.

**Usage Example**

    // Send a typing indicator without calling any handlers
    const reference = TurnContext.getConversationReference(context.request);
    const activity = TurnContext.applyConversationReference({ type: 'typing' }, reference);
    return context.adapter.sendActivity(activity);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  Activity to copy delivery information to. |
| reference | `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  Conversation reference containing delivery information. |
| isIncoming | `boolean`   |  (Optional) flag indicating whether the activity is an incoming or outgoing activity. Defaults to `false` indicating the activity is outgoing. |





**Returns:** `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>





___

<a id="getconversationreference"></a>

### «Static» getConversationReference

► **getConversationReference**(activity: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>



*Defined in [libraries/botbuilder-core/lib/botContext.d.ts:144](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-core/lib/botContext.d.ts#L144)*



Returns the conversation reference for an activity. This can be saved as a plain old JSON object and then later used to message the user proactively.

**Usage Example**

    const reference = TurnContext.getConversationReference(context.request);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  The activity to copy the conversation reference from |





**Returns:** `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>





___


