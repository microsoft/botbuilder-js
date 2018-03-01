[Bot Builder SDK](../README.md) > [ConsoleAdapter](../classes/botbuilder.consoleadapter.md)



# Class: ConsoleAdapter


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


### ⊕ **new ConsoleAdapter**(reference?: *`ConversationReference`*): [ConsoleAdapter](botbuilder.consoleadapter.md)


*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder/lib/consoleAdapter.d.ts#L21)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | `ConversationReference`   |  - |





**Returns:** [ConsoleAdapter](botbuilder.consoleadapter.md)

---


## Methods
<a id="createinterface"></a>

### «Protected» createInterface

► **createInterface**(options: *[ReadLineOptions]()*): [ReadLine]()



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder/lib/consoleAdapter.d.ts#L31)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [ReadLineOptions]()   |  - |





**Returns:** [ReadLine]()





___

<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(reference: *[Partial]()`ConversationReference`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:30](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder/lib/consoleAdapter.d.ts#L30)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [Partial]()`ConversationReference`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="listen"></a>

###  listen

► **listen**(logic: *`function`*): `Function`



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder/lib/consoleAdapter.d.ts#L27)*



Begins listening to console input.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| logic | `function`   |  Function which will be called each time a message is input by the user. |





**Returns:** `Function`





___

<a id="sendactivities"></a>

###  sendActivities

► **sendActivities**(activities: *[Partial]()`Activity`[]*): `Promise`.<`ResourceResponse`[]>



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder/lib/consoleAdapter.d.ts#L28)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()`Activity`[]   |  - |





**Returns:** `Promise`.<`ResourceResponse`[]>





___

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(activity: *[Partial]()`Activity`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/f986273/libraries/botbuilder/lib/consoleAdapter.d.ts#L29)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()`Activity`   |  - |





**Returns:** `Promise`.<`void`>





___


