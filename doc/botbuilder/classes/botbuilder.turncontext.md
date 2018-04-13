[Bot Builder SDK](../README.md) > [TurnContext](../classes/botbuilder.turncontext.md)



# Class: TurnContext


:package: **botbuilder-core**

Context object containing information cached for a single turn of conversation with a user. This will typically be created by the adapter you're using and then passed to middleware and your bots logic.

For TypeScript developers the `TurnContext` is also exposed as an interface which you can derive from to better describe the actual shape of the context object being passed around. Middleware can potentially extend the context object with additional members so in order to get intellisense for those added members you'll need to define them on an interface that extends TurnContext:

    interface MyContext extends TurnContext {
         // Added by UserState middleware.
         readonly userState: MyUserState;

         // Added by ConversationState middleware.
         readonly conversationState: MyConversationState;
    }

    adapter.processActivity(req, res, (context: MyContext) => {
         const state = context.conversationState;
    });

## Index

### Constructors

* [constructor](botbuilder.turncontext.md#constructor)


### Properties

* [activity](botbuilder.turncontext.md#activity)
* [adapter](botbuilder.turncontext.md#adapter)
* [responded](botbuilder.turncontext.md#responded)
* [services](botbuilder.turncontext.md#services)


### Methods

* [copyTo](botbuilder.turncontext.md#copyto)
* [deleteActivity](botbuilder.turncontext.md#deleteactivity)
* [onDeleteActivity](botbuilder.turncontext.md#ondeleteactivity)
* [onSendActivities](botbuilder.turncontext.md#onsendactivities)
* [onUpdateActivity](botbuilder.turncontext.md#onupdateactivity)
* [sendActivities](botbuilder.turncontext.md#sendactivities)
* [sendActivity](botbuilder.turncontext.md#sendactivity)
* [updateActivity](botbuilder.turncontext.md#updateactivity)
* [applyConversationReference](botbuilder.turncontext.md#applyconversationreference)
* [getConversationReference](botbuilder.turncontext.md#getconversationreference)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new TurnContext**(adapterOrContext: *[BotAdapter](botbuilder.botadapter.md)*, request: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): [TurnContext](botbuilder.turncontext.md)


### ⊕ **new TurnContext**(adapterOrContext: *[TurnContext](botbuilder.turncontext.md)*): [TurnContext](botbuilder.turncontext.md)


*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:64](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L64)*



Creates a new TurnContext instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| adapterOrContext | [BotAdapter](botbuilder.botadapter.md)   |  Adapter that constructed the context or a context object to clone. |
| request | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  Request being processed. |





**Returns:** [TurnContext](botbuilder.turncontext.md)

*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:70](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L70)*



Creates a new TurnContext instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| adapterOrContext | [TurnContext](botbuilder.turncontext.md)   |  Adapter that constructed the context or a context object to clone. |





**Returns:** [TurnContext](botbuilder.turncontext.md)

---


## Properties
<a id="activity"></a>

###  activity

**●  activity**:  *[Activity](../interfaces/botbuilder.activity.md)* 

*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:100](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L100)*



The received activity.

**Usage Example**

    const utterance = (context.activity.text || '').trim();




___

<a id="adapter"></a>

###  adapter

**●  adapter**:  *[BotAdapter](botbuilder.botadapter.md)* 

*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:90](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L90)*



The adapter for this context.

**Usage Example**

    // Send a typing indicator without going through an middleware listeners.
    const reference = TurnContext.getConversationReference(context.request);
    const activity = TurnContext.applyConversationReference({ type: 'typing' }, reference);
    await context.adapter.sendActivities([activity]);




___

<a id="responded"></a>

###  responded

**●  responded**:  *`boolean`* 

*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:114](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L114)*



If `true` at least one response has been sent for the current turn of conversation. This is primarily useful for determining if a bot should run fallback routing logic.

**Usage Example**

    await routeActivity(context);
    if (!context.responded) {
       await context.sendActivity(`I'm sorry. I didn't understand.`);
    }




___

<a id="services"></a>

###  services

**●  services**:  *`Map`.<`any`>,.<`any`>* 

*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:132](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L132)*



Map of services and other values cached for the lifetime of the turn. Middleware, other components, and services will typically use this to cache information that could be asked for by a bot multiple times during a turn. The bots logic is free to use this to pass information between its own components.

> NOTE: For middleware and third party components, consider using a `Symbol()` for your cache key to avoid potential naming collisions with the bots caching and other components.

**Usage Example**

    const cart = await loadUsersShoppingCart(context);
    context.services.set('cart', cart);




___


## Methods
<a id="copyto"></a>

### «Protected» copyTo

► **copyTo**(context: *[TurnContext](botbuilder.turncontext.md)*): `void`



*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:77](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L77)*



Called when this TurnContext instance is passed into the constructor of a new TurnContext instance. Can be overridden in derived classes.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  The context object to copy private members to. Everything should be copied by reference. |





**Returns:** `void`





___

<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(idOrReference: *`string`⎮`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:202](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L202)*



Deletes an existing activity.

The `ConversationReference` for the activity being deleted will be routed through any registered [onDeleteActivity](#ondeleteactivity) handlers before being passed to `adapter.deleteActivity()`.

**Usage Example**

    const matched = /approve (.*)/i.exec(context.text);
    if (matched) {
       const savedId = await approveExpenseReport(matched[1]);
       await context.deleteActivity(savedId);
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| idOrReference | `string`⎮`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  ID or conversation of the activity being deleted. If an ID is specified the conversation reference information from the current request will be used to delete the activity. |





**Returns:** `Promise`.<`void`>





___

<a id="ondeleteactivity"></a>

###  onDeleteActivity

► **onDeleteActivity**(handler: *[DeleteActivityHandler](../#deleteactivityhandler)*): `this`



*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:253](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L253)*



Registers a handler to be notified of and potentially intercept an activity being deleted.

**Usage Example**

    context.onDeleteActivities(await (ctx, reference, next) => {
       // Delete activity
       await next();

       // Log delete
       logDelete(activity);
    });


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| handler | [DeleteActivityHandler](../#deleteactivityhandler)   |  A function that will be called anytime [deleteActivity()](#deleteactivity) is called. The handler should call `next()` to continue deletion of the activity. |





**Returns:** `this`





___

<a id="onsendactivities"></a>

###  onSendActivities

► **onSendActivities**(handler: *[SendActivitiesHandler](../#sendactivitieshandler)*): `this`



*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:219](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L219)*



Registers a handler to be notified of and potentially intercept the sending of activities.

**Usage Example**

    context.onSendActivities(await (ctx, activities, next) => {
       // Deliver activities
       await next();

       // Log sent messages
       activities.filter(a => a.type === 'message').forEach(a => logSend(a));
    });


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| handler | [SendActivitiesHandler](../#sendactivitieshandler)   |  A function that will be called anytime [sendActivity()](#sendactivity) is called. The handler should call `next()` to continue sending of the activities. |





**Returns:** `this`





___

<a id="onupdateactivity"></a>

###  onUpdateActivity

► **onUpdateActivity**(handler: *[UpdateActivityHandler](../#updateactivityhandler)*): `this`



*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:236](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L236)*



Registers a handler to be notified of and potentially intercept an activity being updated.

**Usage Example**

    context.onUpdateActivities(await (ctx, activity, next) => {
       // Replace activity
       await next();

       // Log update
       logUpdate(activity);
    });


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| handler | [UpdateActivityHandler](../#updateactivityhandler)   |  A function that will be called anytime [updateActivity()](#updateactivity) is called. The handler should call `next()` to continue sending of the replacement activity. |





**Returns:** `this`





___

<a id="sendactivities"></a>

###  sendActivities

► **sendActivities**(activities: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>[]*): `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>



*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:166](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L166)*



Sends a set of activities to the user. An array of responses form the server will be returned.

Prior to delivery, the activities will be updated with information from the `ConversationReference` for the contexts [activity](#activity) and if an activities `type` field hasn't been set it will be set to a type of `message`. The array of activities will then be routed through any [onSendActivities()](#onsendactivities) handlers and then passed to `adapter.sendActivities()`.

**Usage Example**

    await context.sendActivities([
       { type: 'typing' },
       { type: 'delay', value: 2000 },
       { type: 'message', text: 'Hello... How are you?' }
    ]);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>[]   |  One or more activities to send to the user. |





**Returns:** `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>





___

<a id="sendactivity"></a>

###  sendActivity

► **sendActivity**(activityOrText: *`string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*, speak?: *`string`*, inputHint?: *`string`*): `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)⎮`undefined`>



*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:146](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L146)*



Sends a single activity or message to the user. This ultimately calls [sendActivities()](#sendactivites) and is provided as a convenience to make formating and sending individual activities easier.

**Usage Example**

    await context.sendActivity(`Hello World`);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activityOrText | `string`⎮`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  Activity or text of a message to send the user. |
| speak | `string`   |  (Optional) SSML that should be spoken to the user for the message. |
| inputHint | `string`   |  (Optional) `InputHint` for the message sent to the user. |





**Returns:** `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)⎮`undefined`>





___

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(activity: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:184](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L184)*



Replaces an existing activity.

The activity will be routed through any registered [onUpdateActivity](#onupdateactivity) handlers before being passed to `adapter.updateActivity()`.

**Usage Example**

    const matched = /approve (.*)/i.exec(context.text);
    if (matched) {
       const update = await approveExpenseReport(matched[1]);
       await context.updateActivity(update);
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  New replacement activity. The activity should already have it's ID information populated. |





**Returns:** `Promise`.<`void`>





___

<a id="applyconversationreference"></a>

### «Static» applyConversationReference

► **applyConversationReference**(activity: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*, reference: *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*, isIncoming?: *`boolean`*): `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>



*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:284](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L284)*



Updates an activity with the delivery information from a conversation reference. Calling this after [getConversationReference()](#getconversationreference) on an incoming activity will properly address the reply to a received activity.

**Usage Example**

    // Send a typing indicator without going through an middleware listeners.
    const reference = TurnContext.getConversationReference(context.request);
    const activity = TurnContext.applyConversationReference({ type: 'typing' }, reference);
    await context.adapter.sendActivities([activity]);


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



*Defined in [libraries/botbuilder-core/lib/turnContext.d.ts:266](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/turnContext.d.ts#L266)*



Returns the conversation reference for an activity. This can be saved as a plain old JSON object and then later used to message the user proactively.

**Usage Example**

    const reference = TurnContext.getConversationReference(context.request);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  The activity to copy the conversation reference from |





**Returns:** `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>





___


