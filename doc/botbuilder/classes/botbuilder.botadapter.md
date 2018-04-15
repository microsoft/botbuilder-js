[Bot Builder SDK](../README.md) > [BotAdapter](../classes/botbuilder.botadapter.md)



# Class: BotAdapter


:package: **botbuilder-core**

Abstract base class for all adapter plugins. Adapters manage the communication between the bot and a user over a specific channel, or set of channels.

## Index

### Methods

* [continueConversation](botbuilder.botadapter.md#continueconversation)
* [deleteActivity](botbuilder.botadapter.md#deleteactivity)
* [runMiddleware](botbuilder.botadapter.md#runmiddleware)
* [sendActivities](botbuilder.botadapter.md#sendactivities)
* [updateActivity](botbuilder.botadapter.md#updateactivity)
* [use](botbuilder.botadapter.md#use)



---
## Methods
<a id="continueconversation"></a>

###  continueConversation

► **continueConversation**(reference: *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*, logic: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:43](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/botAdapter.d.ts#L43)*



Proactively continues an existing conversation.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  Conversation reference of the conversation being continued. |
| logic | `function`   |  Function to execute for performing the bots logic. |





**Returns:** `Promise`.<`void`>





___

<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(context: *[TurnContext](botbuilder.turncontext.md)*, reference: *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:37](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/botAdapter.d.ts#L37)*



Deletes an existing activity.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for the current turn of conversation with the user. |
| reference | `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  Conversation reference of the activity being deleted. |





**Returns:** `Promise`.<`void`>





___

<a id="runmiddleware"></a>

### «Protected» runMiddleware

► **runMiddleware**(context: *[TurnContext](botbuilder.turncontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:59](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/botAdapter.d.ts#L59)*



Called by the parent class to run the adapters middleware set and calls the passed in `next()` handler at the end of the chain. While the context object is passed in from the caller is created by the caller, what gets passed to the `next()` is a wrapped version of the context which will automatically be revoked upon completion of the turn. This causes the bots logic to throw an error if it tries to use the context after the turn completes.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for the current turn of conversation with the user. |
| next | `function`   |  Function to call at the end of the middleware chain. |





**Returns:** `Promise`.<`void`>





___

<a id="sendactivities"></a>

###  sendActivities

► **sendActivities**(context: *[TurnContext](botbuilder.turncontext.md)*, activities: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>[]*): `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:25](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/botAdapter.d.ts#L25)*



Sends a set of activities to the user. An array of responses form the server will be returned.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for the current turn of conversation with the user. |
| activities | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>[]   |  Set of activities being sent. |





**Returns:** `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>





___

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(context: *[TurnContext](botbuilder.turncontext.md)*, activity: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/botAdapter.d.ts#L31)*



Replaces an existing activity.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  Context for the current turn of conversation with the user. |
| activity | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  New replacement activity. The activity should already have it's ID information populated. |





**Returns:** `Promise`.<`void`>





___

<a id="use"></a>

###  use

► **use**(...middleware: *(`function`⎮[Middleware]())[]*): `this`



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:48](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder-core/lib/botAdapter.d.ts#L48)*



Registers middleware handlers(s) with the adapter.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| middleware | (`function`⎮[Middleware]())[]   |  One or more middleware handlers(s) to register. |





**Returns:** `this`





___


