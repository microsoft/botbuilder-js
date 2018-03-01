[Bot Builder SDK](../README.md) > [BotAdapter](../classes/botbuilder.botadapter.md)



# Class: BotAdapter


:package: **botbuilder-core**

Abstract base class for all adapter plugins. Adapters manage the communication between the bot and a user over a specific channel, or set of channels.

**Usage Example**

## Index

### Methods

* [deleteActivity](botbuilder.botadapter.md#deleteactivity)
* [runMiddleware](botbuilder.botadapter.md#runmiddleware)
* [sendActivities](botbuilder.botadapter.md#sendactivities)
* [updateActivity](botbuilder.botadapter.md#updateactivity)
* [use](botbuilder.botadapter.md#use)



---
## Methods
<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(reference: *[Partial]()[ConversationReference](../interfaces/botbuilder.conversationreference.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/8495ddc/libraries/botbuilder-core/lib/botAdapter.d.ts#L39)*



Deletes an existing activity.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [Partial]()[ConversationReference](../interfaces/botbuilder.conversationreference.md)   |  Conversation reference of the activity being deleted. |





**Returns:** `Promise`.<`void`>





___

<a id="runmiddleware"></a>

### «Protected» runMiddleware

► **runMiddleware**(context: *[BotContext](botbuilder.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/8495ddc/libraries/botbuilder-core/lib/botAdapter.d.ts#L55)*



Called by the parent class to run the adapters middleware set and calls the passed in `next()` handler at the end of the chain. While the context object is passed in from the caller is created by the caller, what gets passed to the `next()` is a wrapped version of the context which will automatically be revoked upon completion of the turn. This causes the bots logic to throw an error if it tries to use the context after the turn completes.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.botcontext.md)   |  Context for the current turn of conversation with the user. |
| next | `function`   |  Function to call at the end of the middleware chain. |





**Returns:** `Promise`.<`void`>





___

<a id="sendactivities"></a>

###  sendActivities

► **sendActivities**(activities: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)[]*): `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/8495ddc/libraries/botbuilder-core/lib/botAdapter.d.ts#L29)*



Sends a set of activities to the user. An array of responses form the server will be returned.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()[Activity](../interfaces/botbuilder.activity.md)[]   |  Set of activities being sent. |





**Returns:** `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>





___

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(activity: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:34](https://github.com/Microsoft/botbuilder-js/blob/8495ddc/libraries/botbuilder-core/lib/botAdapter.d.ts#L34)*



Replaces an existing activity.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()[Activity](../interfaces/botbuilder.activity.md)   |  New replacement activity. The activity should already have it's ID information populated. |





**Returns:** `Promise`.<`void`>





___

<a id="use"></a>

###  use

► **use**(...middleware: *(`function`⎮[Middleware]())[]*): `this`



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:44](https://github.com/Microsoft/botbuilder-js/blob/8495ddc/libraries/botbuilder-core/lib/botAdapter.d.ts#L44)*



Registers middleware handlers(s) with the adapter.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| middleware | (`function`⎮[Middleware]())[]   |  One or more middleware handlers(s) to register. |





**Returns:** `this`





___


