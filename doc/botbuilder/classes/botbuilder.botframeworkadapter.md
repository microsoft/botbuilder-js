[Bot Builder SDK](../README.md) > [BotFrameworkAdapter](../classes/botbuilder.botframeworkadapter.md)



# Class: BotFrameworkAdapter


:package: **botbuilder-core**

ActivityAdapter class needed to communicate with a Bot Framework channel or the Emulator.

**Usage Example**

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
* [sendActivity](botbuilder.botframeworkadapter.md#sendactivity)
* [startConversation](botbuilder.botframeworkadapter.md#startconversation)
* [updateActivity](botbuilder.botframeworkadapter.md#updateactivity)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BotFrameworkAdapter**(settings?: *`Partial`.<[BotFrameworkAdapterSettings](../interfaces/botbuilder.botframeworkadaptersettings.md)>*): [BotFrameworkAdapter](botbuilder.botframeworkadapter.md)


*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:56](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L56)*



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

*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:54](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L54)*





___

<a id="credentialsprovider"></a>

### «Protected» credentialsProvider

**●  credentialsProvider**:  *`SimpleCredentialProvider`* 

*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:55](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L55)*





___

<a id="settings"></a>

### «Protected» settings

**●  settings**:  *[BotFrameworkAdapterSettings](../interfaces/botbuilder.botframeworkadaptersettings.md)* 

*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:56](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L56)*





___


## Methods
<a id="authenticaterequest"></a>

### «Protected» authenticateRequest

► **authenticateRequest**(request: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*, authHeader: *`string`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:69](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L69)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| request | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  - |
| authHeader | `string`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="continueconversation"></a>

###  continueConversation

► **continueConversation**(reference: *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*, logic: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:63](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L63)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  - |
| logic | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="createconnectorclient"></a>

### «Protected» createConnectorClient

► **createConnectorClient**(serviceUrl: *`string`*): `ConnectorClient`



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:70](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L70)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| serviceUrl | `string`   |  - |





**Returns:** `ConnectorClient`





___

<a id="createcontext"></a>

### «Protected» createContext

► **createContext**(request: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): [BotContext](botbuilder.botcontext.md)



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:71](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L71)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| request | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  - |





**Returns:** [BotContext](botbuilder.botcontext.md)





___

<a id="createconversation"></a>

###  createConversation

► **createConversation**(serviceUrl: *`string`*, parameters: *`Partial`.<[ConversationParameters](../interfaces/botbuilder.conversationparameters.md)>*): `Promise`.<[ConversationResourceResponse](../interfaces/botbuilder.conversationresourceresponse.md)>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:68](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L68)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| serviceUrl | `string`   |  - |
| parameters | `Partial`.<[ConversationParameters](../interfaces/botbuilder.conversationparameters.md)>   |  - |





**Returns:** `Promise`.<[ConversationResourceResponse](../interfaces/botbuilder.conversationresourceresponse.md)>





___

<a id="deleteactivity"></a>

###  deleteActivity

► **deleteActivity**(reference: *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:67](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L67)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="processrequest"></a>

###  processRequest

► **processRequest**(req: *[WebRequest](../interfaces/botbuilder.webrequest.md)*, res: *[WebResponse](../interfaces/botbuilder.webresponse.md)*, logic: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:62](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L62)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| req | [WebRequest](../interfaces/botbuilder.webrequest.md)   |  - |
| res | [WebResponse](../interfaces/botbuilder.webresponse.md)   |  - |
| logic | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="sendactivity"></a>

###  sendActivity

► **sendActivity**(activities: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>[]*): `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:65](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L65)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>[]   |  - |





**Returns:** `Promise`.<[ResourceResponse](../interfaces/botbuilder.resourceresponse.md)[]>





___

<a id="startconversation"></a>

###  startConversation

► **startConversation**(reference: *`Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>*, logic: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:64](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L64)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| reference | `Partial`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)>   |  - |
| logic | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="updateactivity"></a>

###  updateActivity

► **updateActivity**(activity: *`Partial`.<[Activity](../interfaces/botbuilder.activity.md)>*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/botFrameworkAdapter.d.ts:66](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder/lib/botFrameworkAdapter.d.ts#L66)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | `Partial`.<[Activity](../interfaces/botbuilder.activity.md)>   |  - |





**Returns:** `Promise`.<`void`>





___


