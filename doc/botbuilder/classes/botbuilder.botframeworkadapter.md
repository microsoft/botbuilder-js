[Bot Builder SDK](../README.md) > [BotFrameworkAdapter](../classes/botbuilder.botframeworkadapter.md)



# Class: BotFrameworkAdapter


:package: **botbuilder**

ActivityAdapter class needed to communicate with a Bot Framework channel or the Emulator.

**Usage Example**

    const { BotFrameworkAdapter } = require('botbuilder');

    const adapter = new BotFrameworkAdapter({
       appId: process.env.MICROSOFT_APP_ID,
       appPassword: process.env.MICROSOFT_APP_PASSWORD
    });

## Hierarchy


↳  [BotFrameworkAdapter](botbuilder.botframeworkadapter.md)

**↳ BotFrameworkAdapter**

↳  [BotFrameworkAdapter](botbuilder.botframeworkadapter.md)










## Index

### Constructors

* [constructor](botbuilder.botframeworkadapter.md#constructor)


### Properties

* [credentials](botbuilder.botframeworkadapter.md#credentials)
* [credentialsProvider](botbuilder.botframeworkadapter.md#credentialsprovider)
* [settings](botbuilder.botframeworkadapter.md#settings)


### Methods

* [authenticateRequest](botbuilder.botframeworkadapter.md#authenticaterequest)
* [continueConversation](botbuilder.botframeworkadapter.md#continueconversation)
* [createConnectorClient](botbuilder.botframeworkadapter.md#createconnectorclient)
* [createContext](botbuilder.botframeworkadapter.md#createcontext)
* [createConversation](botbuilder.botframeworkadapter.md#createconversation)
* [deleteActivity](botbuilder.botframeworkadapter.md#deleteactivity)
* [processActivity](botbuilder.botframeworkadapter.md#processactivity)
* [sendActivities](botbuilder.botframeworkadapter.md#sendactivities)
* [updateActivity](botbuilder.botframeworkadapter.md#updateactivity)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BotFrameworkAdapter**(settings?: *`Partial`.<[BotFrameworkAdapterSettings](../interfaces/botbuilder.botframeworkadaptersettings.md)>*): [BotFrameworkAdapter](botbuilder.botframeworkadapter.md)


*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:66](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L66)*



Creates a new BotFrameworkAdapter instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | `Partial`.<[BotFrameworkAdapterSettings](../interfaces/botbuilder.botframeworkadaptersettings.md)>   |  (optional) configuration settings for the adapter. |





**Returns:** [BotFrameworkAdapter](botbuilder.botframeworkadapter.md)

---


## Properties
<a id="credentials"></a>

### «Protected» credentials

**●  credentials**:  *`MicrosoftAppCredentials`* 

*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:64](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L64)*





___

<a id="credentialsprovider"></a>

### «Protected» credentialsProvider

**●  credentialsProvider**:  *`SimpleCredentialProvider`* 

*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:65](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L65)*





___

<a id="settings"></a>

### «Protected» settings

**●  settings**:  *[BotFrameworkAdapterSettings](../interfaces/botbuilder.botframeworkadaptersettings.md)* 

*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:66](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L66)*





___


## Methods
<a id="authenticaterequest"></a>

### «Protected» authenticateRequest

► **authenticateRequest**(request: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*, authHeader: *`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:220](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L220)*



Allows for the overriding of authentication in unit tests.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| request | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  Received request. |
| authHeader | `string`   |  Received authentication header. |





**Returns:** `Promise`.<`void`>





___

<a id="continueconversation"></a>

###  continueConversation

► **continueConversation**(reference: *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*, logic: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:152](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L152)*



Continues a conversation with a user. This is often referred to as the bots "Proactive Messaging" flow as its lets the bot proactively send messages to a conversation or user that its already communicated with. Scenarios like sending notifications or coupons to a user are enabled by this method.

The processing steps for this method are very similar to [processActivity()](#processactivity) in that a `TurnContext` will be created which is then routed through the adapters middleware before calling the passed in logic handler. The key difference being that since an activity wasn't actually received it has to be created. The created activity will have its address related fields populated but will have a `context.activity.type === undefined`.

**Usage Example**

    server.post('/api/notifyUser', async (req, res) => {
       // Lookup previously saved conversation reference
       const reference = await findReference(req.body.refId);

       // Proactively notify the user
       if (reference) {
          await adapter.continueConversation(reference, async (context) => {
             await context.sendActivity(req.body.message);
          });
          res.send(200);
       } else {
          res.send(404);
       }
    });


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  A `ConversationReference` saved during a previous message from a user. This can be calculated for any incoming activity using `TurnContext.getConversationReference(context.activity)`. |
| logic | `function`   |  A function handler that will be called to perform the bots logic after the the adapters middleware has been run. |





**Returns:** `Promise`.<`void`>





___

<a id="createconnectorclient"></a>

### «Protected» createConnectorClient

► **createConnectorClient**(serviceUrl: *`string`*): `ConnectorClient`



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:225](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L225)*



Allows for mocking of the connector client in unit tests.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| serviceUrl | `string`   |  Clients service url. |





**Returns:** `ConnectorClient`





___

<a id="createcontext"></a>

### «Protected» createContext

► **createContext**(request: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): [TurnContext](botbuilder.turncontext.md)



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:230](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L230)*



Allows for the overriding of the context object in unit tests and derived adapters.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| request | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  Received request. |





**Returns:** [TurnContext](botbuilder.turncontext.md)





___

<a id="createconversation"></a>

###  createConversation

► **createConversation**(reference: *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*, logic: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:177](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L177)*



Starts a new conversation with a user. This is typically used to Direct Message (DM) a member of a group.

The processing steps for this method are very similar to [processActivity()](#processactivity) in that a `TurnContext` will be created which is then routed through the adapters middleware before calling the passed in logic handler. The key difference being that since an activity wasn't actually received it has to be created. The created activity will have its address related fields populated but will have a `context.activity.type === undefined`.

**Usage Example**

    // Get group members conversation reference
    const reference = TurnContext.getConversationReference(context.activity);

    // Start a new conversation with the user
    await adapter.createConversation(reference, async (ctx) => {
       await ctx.sendActivity(`Hi (in private)`);
    });


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  A `ConversationReference` of the user to start a new conversation with. This can be calculated for any incoming activity using `TurnContext.getConversationReference(context.activity)`. |
| logic | `function`   |  A function handler that will be called to perform the bots logic after the the adapters middleware has been run. |





**Returns:** `Promise`.<`void`>





___

<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(context: *[TurnContext](botbuilder.turncontext.md)*, reference: *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:214](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L214)*



Deletes an activity that was previously sent to a channel. It should be noted that not all channels support this feature.

Calling `TurnContext.deleteActivity()` is the preferred way of deleting activities as that will ensure that any interested middleware has been notified.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for the current turn of conversation with the user. |
| reference | `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  Conversation reference information for the activity being deleted. |





**Returns:** `Promise`.<`void`>





___

<a id="processactivity"></a>

###  processActivity

► **processActivity**(req: *[WebRequest](../interfaces/botbuilder.webrequest.md)*, res: *[WebResponse](../interfaces/botbuilder.webresponse.md)*, logic: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:118](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L118)*



Processes an activity received by the bots web server. This includes any messages sent from a user and is the method that drives what's often referred to as the bots "Reactive Messaging" flow.

The following steps will be taken to process the activity:

*   The identity of the sender will be verified to be either the Emulator or a valid Microsoft server. The bots `appId` and `appPassword` will be used during this process and the request will be rejected if the senders identity can't be verified.
*   The activity will be parsed from the body of the incoming request. An error will be returned if the activity can't be parsed.
*   A `TurnContext` instance will be created for the received activity and wrapped with a [Revocable Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable).
*   The context will be routed through any middleware registered with the adapter using [use()](#use). Middleware is executed in the order in which it's added and any middleware can intercept or prevent further routing of the context by simply not calling the passed in `next()` function. This is called the "Leading Edge" of the request and middleware will get a second chance to run on the "Trailing Edge" of the request after the bots logic has run.
*   Assuming the context hasn't been intercepted by a piece of middleware, the context will be passed to the logic handler passed in. The bot may perform an additional routing or processing at this time. Returning a promise (or providing an `async` handler) will cause the adapter to wait for any asynchronous operations to complete.
*   Once the bots logic completes the promise chain setup by the middleware stack will be resolved giving middleware a second chance to run on the "Trailing Edge" of the request.
*   After the middleware stacks promise chain has been fully resolved the context object will be `revoked()` and any future calls to the context will result in a `TypeError: Cannot perform 'set' on a proxy that has been revoked` being thrown.

**Usage Example**

    server.post('/api/messages', (req, res) => {
       // Route received request to adapter for processing
       adapter.processActivity(req, res, async (context) => {
           // Process any messages received
           if (context.activity.type === 'message') {
               await context.sendActivity(`Hello World`);
           }
       });
    });


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| req | [WebRequest](../interfaces/botbuilder.webrequest.md)   |  An Express or Restify style Request object. |
| res | [WebResponse](../interfaces/botbuilder.webresponse.md)   |  An Express or Restify style Response object. |
| logic | `function`   |  A function handler that will be called to perform the bots logic after the received activity has been pre-processed by the adapter and routed through any middleware for processing. |





**Returns:** `Promise`.<`void`>





___

<a id="sendactivities"></a>

###  sendActivities

► **sendActivities**(context: *[TurnContext](botbuilder.turncontext.md)*, activities: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>[]*): `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:194](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L194)*



Sends a set of activities to a channels server(s). The activities will be sent one after another in the order in which they're received. A response object will be returned for each sent activity. For `message` activities this will contain the ID of the delivered message.

Calling `TurnContext.sendActivities()` or `TurnContext.sendActivity()` is the preferred way of sending activities as that will ensure that outgoing activities have been properly addressed and that any interested middleware has been notified.

The primary scenario for calling this method directly is when you want to explicitly bypass going through any middleware. For instance, periodically sending a `typing` activity might be a good reason to call this method directly as it would avoid any false signals from being logged.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for the current turn of conversation with the user. |
| activities | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>[]   |  List of activities to send. |





**Returns:** `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>





___

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(context: *[TurnContext](botbuilder.turncontext.md)*, activity: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:204](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L204)*



Replaces an activity that was previously sent to a channel. It should be noted that not all channels support this feature.

Calling `TurnContext.updateActivity()` is the preferred way of updating activities as that will ensure that any interested middleware has been notified.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for the current turn of conversation with the user. |
| activity | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  New activity to replace a current activity with. |





**Returns:** `Promise`.<`void`>





___


