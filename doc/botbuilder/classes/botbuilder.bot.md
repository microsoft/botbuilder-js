[Bot Builder SDK - Core](../README.md) > [Bot](../classes/botbuilder.bot.md)



# Class: Bot


Manages all communication between the bot and a user.

**Usage Example**

    import { Bot } from 'botbuilder-core'; // typescript

    const bot = new Bot(adapter); // init bot and bind to adapter

    bot.onReceive((context) => { // define the bot's onReceive handler
      context.reply(`Hello World`); // send message to user
    });

## Hierarchy


 [MiddlewareSet](botbuilder.middlewareset.md)

**↳ Bot**







## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)

## Index

### Constructors

* [constructor](botbuilder.bot.md#constructor)


### Properties

* [adapter](botbuilder.bot.md#adapter)
* [middleware](botbuilder.bot.md#middleware)


### Methods

* [contextCreated](botbuilder.bot.md#contextcreated)
* [createContext](botbuilder.bot.md#createcontext)
* [onReceive](botbuilder.bot.md#onreceive)
* [post](botbuilder.bot.md#post)
* [postActivity](botbuilder.bot.md#postactivity)
* [receive](botbuilder.bot.md#receive)
* [receiveActivity](botbuilder.bot.md#receiveactivity)
* [removeAll](botbuilder.bot.md#removeall)
* [use](botbuilder.bot.md#use)
* [useTemplateRenderer](botbuilder.bot.md#usetemplaterenderer)
* [useTemplates](botbuilder.bot.md#usetemplates)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new Bot**(adapter: *[ActivityAdapter](../interfaces/botbuilder.activityadapter.md)*): [Bot](botbuilder.bot.md)


*Defined in [libraries/botbuilder/lib/bot.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/bot.d.ts#L28)*



Creates a new instance of a bot


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| adapter | [ActivityAdapter](../interfaces/botbuilder.activityadapter.md)   |  Connector used to link the bot to the user communication wise. |





**Returns:** [Bot](botbuilder.bot.md)

---


## Properties
<a id="adapter"></a>

###  adapter

**●  adapter**:  *[ActivityAdapter](../interfaces/botbuilder.activityadapter.md)* 

*Defined in [libraries/botbuilder/lib/bot.d.ts:37](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/bot.d.ts#L37)*



Changes the bots adapter. The previous adapter will first be disconnected from.




___

<a id="middleware"></a>

###  middleware

**●  middleware**:  *[Middleware](../interfaces/botbuilder.middleware.md)[]* 

*Inherited from [MiddlewareSet](botbuilder.middlewareset.md).[middleware](botbuilder.middlewareset.md#middleware)*

*Defined in [libraries/botbuilder/lib/middlewareSet.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/middlewareSet.d.ts#L21)*



Returns the underlying array of middleware.




___


## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Inherited from [MiddlewareSet](botbuilder.middlewareset.md).[contextCreated](botbuilder.middlewareset.md#contextcreated)*

*Defined in [libraries/botbuilder/lib/middlewareSet.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/middlewareSet.d.ts#L28)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="createcontext"></a>

###  createContext

► **createContext**(activityOrReference: *[Activity](../interfaces/botbuilder.activity.md)⎮[ConversationReference](../interfaces/botbuilder.conversationreference.md)*, onReady: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/bot.d.ts:57](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/bot.d.ts#L57)*



Creates a new context object given an activity or conversation reference. The context object will be disposed of automatically once the callback completes or the promise it returns completes.

**Usage Example**

    subscribers.forEach((subscriber) => {
         bot.createContext(subscriber.savedReference, (context) => {
             context.reply(`Hi ${subscriber.name}... Here's what's new with us.`)
                    .reply(newsFlash);
         });
    });


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activityOrReference | [Activity](../interfaces/botbuilder.activity.md)⎮[ConversationReference](../interfaces/botbuilder.conversationreference.md)   |  Activity or ConversationReference to initialize the context object with. |
| onReady | `function`   |  Function that will use the created context object. |





**Returns:** `Promise`.<`void`>





___

<a id="onreceive"></a>

###  onReceive

► **onReceive**(...receivers: *`function`[]*): `this`



*Defined in [libraries/botbuilder/lib/bot.d.ts:74](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/bot.d.ts#L74)*



Registers a new receiver with the bot. All incoming activities are routed to receivers in the order they're registered. The first receiver to return `{ handled: true }` prevents the receivers after it from being called.

**Usage Example**

    const bot = new Bot(adapter)
         .onReceive((context) => {
            context.reply(`Hello World`);
         });


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| receivers | `function`[]   |  One or more receivers to register. |





**Returns:** `this`





___

<a id="post"></a>

###  post

► **post**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, ...activities: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)[]*): `Promise`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)[]>



*Defined in [libraries/botbuilder/lib/bot.d.ts:92](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/bot.d.ts#L92)*



INTERNAL sends an outgoing set of activities to the user. Calling `context.sendResponses()` achieves the same effect and is the preferred way of sending activities to the user.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  Context for the current turn of the conversation. |
| activities | [Partial]()[Activity](../interfaces/botbuilder.activity.md)[]   |  Set of activities to send. |





**Returns:** `Promise`.<[ConversationReference](../interfaces/botbuilder.conversationreference.md)[]>





___

<a id="postactivity"></a>

###  postActivity

► **postActivity**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, activities: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)[]*, next: *`function`*): `Promise`.<[ConversationResourceResponse](../interfaces/botbuilder.conversationresourceresponse.md)[]>



*Inherited from [MiddlewareSet](botbuilder.middlewareset.md).[postActivity](botbuilder.middlewareset.md#postactivity)*

*Defined in [libraries/botbuilder/lib/middlewareSet.d.ts:30](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/middlewareSet.d.ts#L30)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| activities | [Partial]()[Activity](../interfaces/botbuilder.activity.md)[]   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<[ConversationResourceResponse](../interfaces/botbuilder.conversationresourceresponse.md)[]>





___

<a id="receive"></a>

###  receive

► **receive**(activity: *[Activity](../interfaces/botbuilder.activity.md)*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/bot.d.ts:100](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/bot.d.ts#L100)*



Dispatches an incoming set of activities. This method can be used to dispatch an activity to the bot as if a user had sent it which is sometimes useful.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| activity | [Activity](../interfaces/botbuilder.activity.md)   |  The activity that was received. |





**Returns:** `Promise`.<`void`>
`{ handled: true }` if the activity was handled by a middleware plugin or one of the bots receivers.






___

<a id="receiveactivity"></a>

###  receiveActivity

► **receiveActivity**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Inherited from [MiddlewareSet](botbuilder.middlewareset.md).[receiveActivity](botbuilder.middlewareset.md#receiveactivity)*

*Defined in [libraries/botbuilder/lib/middlewareSet.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/middlewareSet.d.ts#L29)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="removeall"></a>

###  removeAll

► **removeAll**(): `this`



*Inherited from [MiddlewareSet](botbuilder.middlewareset.md).[removeAll](botbuilder.middlewareset.md#removeall)*

*Defined in [libraries/botbuilder/lib/middlewareSet.d.ts:17](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/middlewareSet.d.ts#L17)*



Removes all registered middleware from the set. This can be useful for unit testing.




**Returns:** `this`





___

<a id="use"></a>

###  use

► **use**(...middleware: *[Middleware](../interfaces/botbuilder.middleware.md)[]*): `this`



*Inherited from [MiddlewareSet](botbuilder.middlewareset.md).[use](botbuilder.middlewareset.md#use)*

*Defined in [libraries/botbuilder/lib/middlewareSet.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/middlewareSet.d.ts#L27)*



Registers middleware plugin(s) with the bot or set.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| middleware | [Middleware](../interfaces/botbuilder.middleware.md)[]   |  One or more middleware plugin(s) to register. |





**Returns:** `this`





___

<a id="usetemplaterenderer"></a>

###  useTemplateRenderer

► **useTemplateRenderer**(templateRenderer: *[TemplateRenderer]()*): [Bot](botbuilder.bot.md)



*Defined in [libraries/botbuilder/lib/bot.d.ts:79](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/bot.d.ts#L79)*



Register template renderer as middleware


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| templateRenderer | [TemplateRenderer]()   |  templateRenderer |





**Returns:** [Bot](botbuilder.bot.md)





___

<a id="usetemplates"></a>

###  useTemplates

► **useTemplates**(templates: *[TemplateDictionary]()*): [Bot](botbuilder.bot.md)



*Defined in [libraries/botbuilder/lib/bot.d.ts:84](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/bot.d.ts#L84)*



Register TemplateDictionary as templates


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| templates | [TemplateDictionary]()   |  templateDictionary to register |





**Returns:** [Bot](botbuilder.bot.md)





___


