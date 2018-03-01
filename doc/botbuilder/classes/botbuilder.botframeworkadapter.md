[Bot Builder SDK](../README.md) > [BotFrameworkAdapter](../classes/botbuilder.botframeworkadapter.md)



# Class: BotFrameworkAdapter


ActivityAdapter class needed to communicate with a Bot Framework channel or the Emulator.

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
* [processRequest](botbuilder.botframeworkadapter.md#processrequest)
* [sendActivities](botbuilder.botframeworkadapter.md#sendactivities)
* [startConversation](botbuilder.botframeworkadapter.md#startconversation)
* [updateActivity](botbuilder.botframeworkadapter.md#updateactivity)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BotFrameworkAdapter**(settings?: *[Partial]()[BotFrameworkAdapterSettings](../interfaces/botbuilder.botframeworkadaptersettings.md)*): [BotFrameworkAdapter](botbuilder.botframeworkadapter.md)


*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L55)*



Creates a new BotFrameworkAdapter instance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [Partial]()[BotFrameworkAdapterSettings](../interfaces/botbuilder.botframeworkadaptersettings.md)   |  (optional) configuration settings for the adapter. |





**Returns:** [BotFrameworkAdapter](botbuilder.botframeworkadapter.md)

---


## Properties
<a id="credentials"></a>

### «Protected» credentials

**●  credentials**:  *`MicrosoftAppCredentials`* 

*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:53](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L53)*





___

<a id="credentialsprovider"></a>

### «Protected» credentialsProvider

**●  credentialsProvider**:  *`SimpleCredentialProvider`* 

*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:54](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L54)*





___

<a id="settings"></a>

### «Protected» settings

**●  settings**:  *[BotFrameworkAdapterSettings](../interfaces/botbuilder.botframeworkadaptersettings.md)* 

*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L55)*





___


## Methods
<a id="authenticaterequest"></a>

### «Protected» authenticateRequest

► **authenticateRequest**(request: *[Partial]()`Activity`*, authHeader: *`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L68)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| request | [Partial]()`Activity`   |  - |
| authHeader | `string`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="continueconversation"></a>

###  continueConversation

► **continueConversation**(reference: *[Partial]()`ConversationReference`*, logic: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:62](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L62)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [Partial]()`ConversationReference`   |  - |
| logic | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="createconnectorclient"></a>

### «Protected» createConnectorClient

► **createConnectorClient**(serviceUrl: *`string`*): `ConnectorClient`



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:69](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L69)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| serviceUrl | `string`   |  - |





**Returns:** `ConnectorClient`





___

<a id="createcontext"></a>

### «Protected» createContext

► **createContext**(request: *[Partial]()`Activity`*): [BotContext](botbuilder.botcontext.md)



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:70](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L70)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| request | [Partial]()`Activity`   |  - |





**Returns:** [BotContext](botbuilder.botcontext.md)





___

<a id="createconversation"></a>

###  createConversation

► **createConversation**(serviceUrl: *`string`*, parameters: *[Partial]()`ConversationParameters`*): `Promise`.<`ConversationResourceResponse`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:67](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L67)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| serviceUrl | `string`   |  - |
| parameters | [Partial]()`ConversationParameters`   |  - |





**Returns:** `Promise`.<`ConversationResourceResponse`>





___

<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(reference: *[Partial]()`ConversationReference`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:66](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L66)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [Partial]()`ConversationReference`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="processrequest"></a>

###  processRequest

► **processRequest**(req: *[WebRequest](../interfaces/botbuilder.webrequest.md)*, res: *[WebResponse](../interfaces/botbuilder.webresponse.md)*, logic: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:61](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L61)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| req | [WebRequest](../interfaces/botbuilder.webrequest.md)   |  - |
| res | [WebResponse](../interfaces/botbuilder.webresponse.md)   |  - |
| logic | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="sendactivities"></a>

###  sendActivities

► **sendActivities**(activities: *[Partial]()`Activity`[]*): `Promise`.<`ResourceResponse`[]>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:64](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L64)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()`Activity`[]   |  - |





**Returns:** `Promise`.<`ResourceResponse`[]>





___

<a id="startconversation"></a>

###  startConversation

► **startConversation**(reference: *[Partial]()`ConversationReference`*, logic: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:63](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L63)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | [Partial]()`ConversationReference`   |  - |
| logic | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(activity: *[Partial]()`Activity`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:65](https://github.com/Microsoft/botbuilder-js/blob/2ba4064/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L65)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()`Activity`   |  - |





**Returns:** `Promise`.<`void`>





___


