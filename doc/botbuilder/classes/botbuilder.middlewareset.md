[Bot Builder SDK - Core](../README.md) > [MiddlewareSet](../classes/botbuilder.middlewareset.md)



# Class: MiddlewareSet


A set of `Middleware` plugins. The set itself is middleware so you can easily package up a set of middleware that can be composed into a bot with a single `bot.use(mySet)` call or even into another middleware set using `set.use(mySet)`.

## Hierarchy

**MiddlewareSet**

↳  [Bot](botbuilder.bot.md)








## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)

## Index

### Properties

* [middleware](botbuilder.middlewareset.md#middleware)


### Methods

* [contextCreated](botbuilder.middlewareset.md#contextcreated)
* [postActivity](botbuilder.middlewareset.md#postactivity)
* [receiveActivity](botbuilder.middlewareset.md#receiveactivity)
* [use](botbuilder.middlewareset.md#use)



---
## Properties
<a id="middleware"></a>

###  middleware

**●  middleware**:  *[Middleware](../interfaces/botbuilder.middleware.md)[]* 

*Defined in [libraries/botbuilder/lib/middlewareSet.d.ts:20](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/middlewareSet.d.ts#L20)*



Returns the underlying array of middleware.




___


## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/middlewareSet.d.ts:27](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/middlewareSet.d.ts#L27)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="postactivity"></a>

###  postActivity

► **postActivity**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, activities: *[Partial]()[Activity](../interfaces/botbuilder.activity.md)[]*, next: *`function`*): `Promise`.<[ConversationResourceResponse](../interfaces/botbuilder.conversationresourceresponse.md)[]>



*Defined in [libraries/botbuilder/lib/middlewareSet.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/middlewareSet.d.ts#L29)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| activities | [Partial]()[Activity](../interfaces/botbuilder.activity.md)[]   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<[ConversationResourceResponse](../interfaces/botbuilder.conversationresourceresponse.md)[]>





___

<a id="receiveactivity"></a>

###  receiveActivity

► **receiveActivity**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/middlewareSet.d.ts:28](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/middlewareSet.d.ts#L28)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___

<a id="use"></a>

###  use

► **use**(...middleware: *[Middleware](../interfaces/botbuilder.middleware.md)[]*): `this`



*Defined in [libraries/botbuilder/lib/middlewareSet.d.ts:26](https://github.com/Microsoft/botbuilder-js/blob/5422076/libraries/botbuilder/lib/middlewareSet.d.ts#L26)*



Registers middleware plugin(s) with the bot or set.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| middleware | [Middleware](../interfaces/botbuilder.middleware.md)[]   |  One or more middleware plugin(s) to register. |





**Returns:** `this`





___


