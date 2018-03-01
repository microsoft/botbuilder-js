[Bot Builder SDK](../README.md) > [BotAdapter](../classes/botbuilder.botadapter.md)



# Class: BotAdapter


Manages all communication between the bot and a user.

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

► **deleteActivity**(reference: *[Partial]()`ConversationReference`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:36](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botAdapter.d.ts#L36)*



Deletes an existing activity.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [Partial]()`ConversationReference`   |  Conversation reference of the activity being deleted. |





**Returns:** `Promise`.<`void`>





___

<a id="runmiddleware"></a>

### «Protected» runMiddleware

► **runMiddleware**(context: *[BotContext](botbuilder.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:52](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botAdapter.d.ts#L52)*



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

► **sendActivities**(activities: *[Partial]()`Activity`[]*): `Promise`.<`ResourceResponse`[]>



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:26](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botAdapter.d.ts#L26)*



Sends a set of activities to the user. An array of responses form the server will be returned.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()`Activity`[]   |  Set of activities being sent. |





**Returns:** `Promise`.<`ResourceResponse`[]>





___

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(activity: *[Partial]()`Activity`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botAdapter.d.ts#L31)*



Replaces an existing activity.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()`Activity`   |  New replacement activity. The activity should already have it's ID information populated. |





**Returns:** `Promise`.<`void`>





___

<a id="use"></a>

###  use

► **use**(...middleware: *(`function`⎮[Middleware]())[]*): `this`



*Defined in [libraries/botbuilder-core/lib/botAdapter.d.ts:41](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder-core/lib/botAdapter.d.ts#L41)*



Registers middleware handlers(s) with the adapter.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| middleware | (`function`⎮[Middleware]())[]   |  One or more middleware handlers(s) to register. |





**Returns:** `this`





___


