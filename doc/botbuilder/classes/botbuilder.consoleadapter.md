[Bot Builder SDK](../README.md) > [ConsoleAdapter](../classes/botbuilder.consoleadapter.md)



# Class: ConsoleAdapter


:package: **botbuilder-core**

Lets a user communicate with a bot from a console window.

**Usage Example**

## Hierarchy


↳  [ConsoleAdapter](botbuilder.consoleadapter.md)

**↳ ConsoleAdapter**

↳  [ConsoleAdapter](botbuilder.consoleadapter.md)










## Index

### Constructors

* [constructor](botbuilder.consoleadapter.md#constructor)


### Methods

* [createInterface](botbuilder.consoleadapter.md#createinterface)
* [deleteActivity](botbuilder.consoleadapter.md#deleteactivity)
* [listen](botbuilder.consoleadapter.md#listen)
* [sendActivities](botbuilder.consoleadapter.md#sendactivities)
* [updateActivity](botbuilder.consoleadapter.md#updateactivity)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new ConsoleAdapter**(reference?: *[ConversationReference](../interfaces/botbuilder.conversationreference.md)*): [ConsoleAdapter](botbuilder.consoleadapter.md)


*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:23](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder/lib/consoleAdapter.d.ts#L23)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [ConversationReference](../interfaces/botbuilder.conversationreference.md)   |  - |





**Returns:** [ConsoleAdapter](botbuilder.consoleadapter.md)

---


## Methods
<a id="createinterface"></a>

### «Protected» createInterface

► **createInterface**(options: *[ReadLineOptions]()*): [ReadLine]()



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder/lib/consoleAdapter.d.ts#L33)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [ReadLineOptions]()   |  - |





**Returns:** [ReadLine]()





___

<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(reference: *[Partial]()[ConversationReference](../interfaces/botbuilder.conversationreference.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder/lib/consoleAdapter.d.ts#L32)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [Partial]()[ConversationReference](../interfaces/botbuilder.conversationreference.md)   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="listen"></a>

###  listen

► **listen**(logic: *`function`*): `Function`



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder/lib/consoleAdapter.d.ts#L29)*



Begins listening to console input.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| logic | `function`   |  Function which will be called each time a message is input by the user. |





**Returns:** `Function`





___

<a id="sendactivities"></a>

###  sendActivities

► **sendActivities**(activities: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)[]*): `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:30](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder/lib/consoleAdapter.d.ts#L30)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()[Activity](../interfaces/botbuilder.activity.md)[]   |  - |





**Returns:** `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>





___

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(activity: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder/lib/consoleAdapter.d.ts#L31)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()[Activity](../interfaces/botbuilder.activity.md)   |  - |





**Returns:** `Promise`.<`void`>





___


