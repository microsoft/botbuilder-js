[Bot Builder SDK - Core](../README.md) > [Middleware](../interfaces/botbuilder.middleware.md)



# Interface: Middleware


Implemented by middleware plugins. Plugins have four separate methods they can implement to tap into the life cycle of a request. When an activity is received from a user, middleware plugins will have their methods invoked in the following sequence:

> > [contextCreated()](#contextcreated) -> [receiveActivity()](#receiveactivity) -> (bots logic) -> [postActivity()](#postactivity) -> [contextDone()](#contextdone)

## Implemented by

* [AttachmentRecognizer](../classes/botbuilder.attachmentrecognizer.md)
* [Bot](../classes/botbuilder.bot.md)
* [BotService](../classes/botbuilder.botservice.md)
* [BotStateManager](../classes/botbuilder.botstatemanager.md)
* [BrowserLocalStorage](../classes/botbuilder.browserlocalstorage.md)
* [BrowserSessionStorage](../classes/botbuilder.browsersessionstorage.md)
* [DictionaryRenderer](../classes/botbuilder.dictionaryrenderer.md)
* [IntentRecognizer](../classes/botbuilder.intentrecognizer.md)
* [IntentRecognizerSet](../classes/botbuilder.intentrecognizerset.md)
* [JsonTemplates](../classes/botbuilder.jsontemplates.md)
* [MemoryStorage](../classes/botbuilder.memorystorage.md)
* [MiddlewareSet](../classes/botbuilder.middlewareset.md)
* [RegExpRecognizer](../classes/botbuilder.regexprecognizer.md)
* [StorageMiddleware](../classes/botbuilder.storagemiddleware.md)
* [TemplateManager](../classes/botbuilder.templatemanager.md)


## Methods
<a id="contextcreated"></a>

### «Optional» contextCreated

► **contextCreated**(context: *[BotContext](botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/middleware.d.ts:39](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/middleware.d.ts#L39)*



(Optional) called when a new context object has been created. Plugins can extend the context object in this call.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.__global.botcontext.md)   |  Context for the current turn of the conversation. |
| next | `function`   |  Function you should call to continue execution of the middleware pipe. |





**Returns:** `Promise`.<`void`>





___

<a id="postactivity"></a>

### «Optional» postActivity

► **postActivity**(context: *[BotContext](botbuilder.__global.botcontext.md)*, activities: *[Partial]()[Activity]()[]*, next: *`function`*): `Promise`.<[ResourceResponse]()[]>



*Defined in [libraries/botbuilder/lib/middleware.d.ts:57](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/middleware.d.ts#L57)*



(Optional) called anytime an outgoing set of activities are being sent. Plugins can implement logic to either transform the outgoing activities or to persist some state prior to delivery of the activities.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.__global.botcontext.md)   |  Context for the current turn of the conversation. |
| activities | [Partial]()[Activity]()[]   |  - |
| next | `function`   |  Function you should call to continue execution of the middleware pipe. |





**Returns:** `Promise`.<[ResourceResponse]()[]>





___

<a id="receiveactivity"></a>

### «Optional» receiveActivity

► **receiveActivity**(context: *[BotContext](botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder/lib/middleware.d.ts:48](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/middleware.d.ts#L48)*



(Optional) called after [contextCreated](#contextCreated) to route a received activity. Plugins can return `{ handled: true }` to indicate that they have successfully routed the activity. This will prevent further calls to `receiveActivity()`.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](botbuilder.__global.botcontext.md)   |  Context for the current turn of the conversation. |
| next | `function`   |  Function you should call to continue execution of the middleware pipe. |





**Returns:** `Promise`.<`void`>





___


