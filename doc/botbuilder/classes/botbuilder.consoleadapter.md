[Bot Builder SDK](../README.md) > [ConsoleAdapter](../classes/botbuilder.consoleadapter.md)



# Class: ConsoleAdapter


Lets a user communicate with a bot from a console window.

**Usage Example**

<table>

<thead>

<tr>

<th>package</th>

<th style="text-align:center">middleware</th>

</tr>

</thead>

<tbody>

<tr>

<td>botbuilder</td>

<td style="text-align:center">no</td>

</tr>

</tbody>

</table>

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


*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:25](https://github.com/Microsoft/botbuilder-js/blob/d62f5bf/libraries/botbuilder/lib/consoleAdapter.d.ts#L25)*



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



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:35](https://github.com/Microsoft/botbuilder-js/blob/d62f5bf/libraries/botbuilder/lib/consoleAdapter.d.ts#L35)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [ReadLineOptions]()   |  - |





**Returns:** [ReadLine]()





___

<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(reference: *[Partial]()`ConversationReference`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:34](https://github.com/Microsoft/botbuilder-js/blob/d62f5bf/libraries/botbuilder/lib/consoleAdapter.d.ts#L34)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [Partial]()`ConversationReference`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="listen"></a>

###  listen

► **listen**(logic: *`function`*): `Function`



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:31](https://github.com/Microsoft/botbuilder-js/blob/d62f5bf/libraries/botbuilder/lib/consoleAdapter.d.ts#L31)*



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



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/d62f5bf/libraries/botbuilder/lib/consoleAdapter.d.ts#L32)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()`Activity`[]   |  - |





**Returns:** `Promise`.<`ResourceResponse`[]>





___

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(activity: *[Partial]()`Activity`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/consoleAdapter.d.ts:33](https://github.com/Microsoft/botbuilder-js/blob/d62f5bf/libraries/botbuilder/lib/consoleAdapter.d.ts#L33)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()`Activity`   |  - |





**Returns:** `Promise`.<`void`>





___


