[Bot Builder SDK - Azure](../README.md) > [botbuilder](../modules/botbuilder.md) > [ConsoleLogger](../classes/botbuilder.consolelogger.md)



# Class: ConsoleLogger


Middleware for logging activity to the console.

**Extends BotContext:**

*   context.logger - Logs activity and analytics within the bot.

**Usage Example**

    const bot = new Bot(adapter)
         .use(new ConsoleLogger())
         .onReceive((context) => {
             context.reply(`Hello World`);
         })

## Implements

* [Middleware](../interfaces/botbuilder.middleware.md)

## Index

### Methods

* [contextCreated](botbuilder.consolelogger.md#contextcreated)



---
## Methods
<a id="contextcreated"></a>

###  contextCreated

► **contextCreated**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, next: *`function`*): `Promise`.<`void`>



*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/consoleLogger.d.ts:23*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___


