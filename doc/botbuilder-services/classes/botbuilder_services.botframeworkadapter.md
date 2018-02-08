[Bot Builder SDK - Services](../README.md) > [BotFrameworkAdapter](../classes/botbuilder_services.botframeworkadapter.md)



# Class: BotFrameworkAdapter


ActivityAdapter class needed to communicate with a Bot Framework channel or the Emulator.

**Usage Example**

    import { Bot } from 'botbuilder-core';
    import { BotFrameworkAdapter } from 'botbuilder-services';
    import * as restify from 'restify';

    // Create server
    let server = restify.createServer();
    server.listen(process.env.port || process.env.PORT || 3978, function () {
        console.log('%s listening to %s', server.name, server.url);
    });

    // Create activity adapter and listen to our servers '/api/messages' route.
    const activityAdapter = new BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD});
    server.post('/api/messages', activityAdapter.listen() as any);

    // Initialize bot by passing it a activity Adapter
    const bot = new Bot(activityAdapter)
        .onReceive((context) => {
            context.reply(`Hello World`);
        });

## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder_services.botframeworkadapter.md#constructor)


### Properties

* [onReceive](botbuilder_services.botframeworkadapter.md#onreceive)


### Methods

* [createConversation](botbuilder_services.botframeworkadapter.md#createconversation)
* [delete](botbuilder_services.botframeworkadapter.md#delete)
* [listen](botbuilder_services.botframeworkadapter.md#listen)
* [post](botbuilder_services.botframeworkadapter.md#post)
* [update](botbuilder_services.botframeworkadapter.md#update)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new BotFrameworkAdapter**(settings?: *[BotAdapterSettings](../interfaces/botbuilder_services.botadaptersettings.md)*): [BotFrameworkAdapter](botbuilder_services.botframeworkadapter.md)


*Defined in [libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts:62](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts#L62)*



Creates a new instance of the activity adapter.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [BotAdapterSettings](../interfaces/botbuilder_services.botadaptersettings.md)   |  (optional) settings object |





**Returns:** [BotFrameworkAdapter](botbuilder_services.botframeworkadapter.md)

---


## Properties
<a id="onreceive"></a>

###  onReceive

**●  onReceive**:  *`function`* 

*Defined in [libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts:69](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts#L69)*


#### Type declaration
►(activity: *[Partial]()`Activity`*): `Promise`.<`void`>



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()`Activity`   |  - |





**Returns:** `Promise`.<`void`>






___


## Methods
<a id="createconversation"></a>

###  createConversation

► **createConversation**(conversationParameters: *`ConversationParameters`*, conversationReference: *`ConversationReference`*): `Promise`.<`ConversationResourceResponse`>



*Defined in [libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts:77](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts#L77)*



Creates a new conversation


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| conversationParameters | `ConversationParameters`   |  - |
| conversationReference | `ConversationReference`   |  - |





**Returns:** `Promise`.<`ConversationResourceResponse`>







___

<a id="delete"></a>

###  delete

► **delete**(activity: *[Partial]()`Activity`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts:79](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts#L79)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()`Activity`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="listen"></a>

###  listen

► **listen**(): [WebMiddleware](../interfaces/botbuilder_services.webmiddleware.md)



*Defined in [libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts:84](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts#L84)*



Listens for incoming activities off a Restify or Express.js POST route.




**Returns:** [WebMiddleware](../interfaces/botbuilder_services.webmiddleware.md)





___

<a id="post"></a>

###  post

► **post**(activities: *[Partial]()`Activity`[]*): `Promise`.<`ConversationResourceResponse`[]>



*Defined in [libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts:80](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts#L80)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activities | [Partial]()`Activity`[]   |  - |





**Returns:** `Promise`.<`ConversationResourceResponse`[]>





___

<a id="update"></a>

###  update

► **update**(activity: *[Partial]()`Activity`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts:78](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder-services/lib/botFrameworkAdapter.d.ts#L78)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Partial]()`Activity`   |  - |





**Returns:** `Promise`.<`void`>





___


