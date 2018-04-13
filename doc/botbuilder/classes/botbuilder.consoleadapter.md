[Bot Builder SDK](../README.md) > [ConsoleAdapter](../classes/botbuilder.consoleadapter.md)



# Class: ConsoleAdapter


:package: **botbuilder**

Lets a user communicate with a bot from a console window.

**Usage Example**

    const { ConsoleAdapter } = require('botbuilder');

    const adapter = new ConsoleAdapter();
    const closeFn = adapter.listen(async (context) => {
       await context.sendActivity(`Hello World`);
    });

## Hierarchy


↳  [ConsoleAdapter](botbuilder.consoleadapter.md)

**↳ ConsoleAdapter**

↳  [ConsoleAdapter](botbuilder.consoleadapter.md)










## Index

### Constructors

* [constructor](botbuilder.consoleadapter.md#constructor)


### Methods

* [continueConversation](botbuilder.consoleadapter.md#continueconversation)
* [createInterface](botbuilder.consoleadapter.md#createinterface)
* [deleteActivity](botbuilder.consoleadapter.md#deleteactivity)
* [listen](botbuilder.consoleadapter.md#listen)
* [print](botbuilder.consoleadapter.md#print)
* [printError](botbuilder.consoleadapter.md#printerror)
* [sendActivities](botbuilder.consoleadapter.md#sendactivities)
* [updateActivity](botbuilder.consoleadapter.md#updateactivity)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new ConsoleAdapter**(reference?: *[ConversationReference](../interfaces/botbuilder.conversationreference.md)*): [ConsoleAdapter](botbuilder.consoleadapter.md)


*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/consoleAdapter.d.ts#L29)*



Creates a new ConsoleAdapter instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [ConversationReference](../interfaces/botbuilder.conversationreference.md)   |  (Optional) reference used to customize the address information of activites sent from the adapter. |





**Returns:** [ConsoleAdapter](botbuilder.consoleadapter.md)

---


## Methods
<a id="continueconversation"></a>

###  continueConversation

► **continueConversation**(reference: *[ConversationReference](../interfaces/botbuilder.conversationreference.md)*, logic: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:89](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/consoleAdapter.d.ts#L89)*



Lets a bot proactively message the user.

The processing steps for this method are very similar to [listen()](#listen) in that a `TurnContext` will be created which is then routed through the adapters middleware before calling the passed in logic handler. The key difference being that since an activity wasn't actually received it has to be created. The created activity will have its address related fields populated but will have a `context.activity.type === undefined`.

**Usage Example**

    function delayedNotify(context, message, delay) {
       const reference = TurnContext.getConversationReference(context.activity);
       setTimeout(() => {
          adapter.continueConversation(reference, async (ctx) => {
             await ctx.sendActivity(message);
          });
       }, delay);
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [ConversationReference](../interfaces/botbuilder.conversationreference.md)   |  A `ConversationReference` saved during a previous message from a user. This can be calculated for any incoming activity using `TurnContext.getConversationReference(context.activity)`. |
| logic | `function`   |  A function handler that will be called to perform the bots logic after the the adapters middleware has been run. |





**Returns:** `Promise`.<`void`>





___

<a id="createinterface"></a>

### «Protected» createInterface

► **createInterface**(options: *[ReadLineOptions]()*): [ReadLine]()



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:114](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/consoleAdapter.d.ts#L114)*



Allows for mocking of the console interface in unit tests.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [ReadLineOptions]()   |  Console interface options. |





**Returns:** [ReadLine]()





___

<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(context: *[TurnContext](botbuilder.turncontext.md)*, reference: *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:109](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/consoleAdapter.d.ts#L109)*



Not supported for the ConsoleAdapter. Calling this method or `TurnContext.deleteActivity()` will result an error being returned.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  - |
| reference | `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="listen"></a>

###  listen

► **listen**(logic: *`function`*): `Function`



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:64](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/consoleAdapter.d.ts#L64)*



Begins listening to console input. A function will be returned that can be used to stop the bot listening and therefore end the process.

Upon receiving input from the console the flow is as follows:

*   An 'message' activity will be created containing the users input text.
*   A revokable `TurnContext` will be created for the activity.
*   The context will be routed through any middleware registered with [use()](#use).
*   The bots logic handler that was passed in will be executed.
*   The promise chain setup by the middleware stack will be resolved.
*   The context object will be revoked and any future calls to its members will result in a `TypeError` being thrown.

**Usage Example**

    const closeFn = adapter.listen(async (context) => {
       const utterance = context.activity.text.toLowerCase();
       if (utterance.includes('goodbye')) {
          await context.sendActivity(`Ok... Goodbye`);
          closeFn();
       } else {
          await context.sendActivity(`Hello World`);
       }
    });


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| logic | `function`   |  Function which will be called each time a message is input by the user. |





**Returns:** `Function`





___

<a id="print"></a>

### «Protected» print

► **print**(line: *`string`*): `void`



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:119](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/consoleAdapter.d.ts#L119)*



Logs text to the console.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| line | `string`   |  Text to print. |





**Returns:** `void`





___

<a id="printerror"></a>

### «Protected» printError

► **printError**(line: *`string`*): `void`



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:124](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/consoleAdapter.d.ts#L124)*



Logs an error to the console.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| line | `string`   |  Error text to print. |





**Returns:** `void`





___

<a id="sendactivities"></a>

###  sendActivities

► **sendActivities**(context: *[TurnContext](botbuilder.turncontext.md)*, activities: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>[]*): `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:99](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/consoleAdapter.d.ts#L99)*



Logs a set of activities to the console.

Calling `TurnContext.sendActivities()` or `TurnContext.sendActivity()` is the preferred way of sending activities as that will ensure that outgoing activities have been properly addressed and that any interested middleware has been notified.


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



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:104](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botbuilder/lib/consoleAdapter.d.ts#L104)*



Not supported for the ConsoleAdapter. Calling this method or `TurnContext.updateActivity()` will result an error being returned.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [TurnContext](botbuilder.turncontext.md)   |  - |
| activity | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  - |





**Returns:** `Promise`.<`void`>





___


