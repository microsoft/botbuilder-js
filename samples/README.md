# BotBuilder-JS Samples:

Here you can find samples that implement different concepts that are core to developing great bots using the Microsoft Bot Framework. For developers new to Bot Framework, we recommend going through the below ["List of Samples"](#List-of-samples) in order.


## List of Samples
1. [echobot-console-es6](#echobot-console-es6)
2. [conversation-update-es6](#conversation-update-es6)
3. [echobot-es6](#echobot-es6)
4. [single-prompt-bot-es6](#single-prompt-bot-es6)
5. [multiple-prompts-bot-es6](#multiple-prompts-bot-es6)
6. [rich-cards-es6](#rich-cards-es6)
7. [qna-maker-bot-es6](#qna-maker-bot-es6)
8. [luis-bot-es6](#luis-bot-es6)
9. [dispatch-es6](#dispatch-es6)
10. [echobot-es6-botframework-webchat](#echobot-es6-botframework-webchat)
11. [simple-prompt-bot-es6](#simple-prompt-bot-es6)
12. [card-actions-es6](#card-actions-es6)
13. [helpandcancel-es6](#helpandcancel-es6)


___

### [echobot-console-es6](./echobot-console-es6)

Simple bot that echos a user's message back to the user.

- Introduces the concept of Adapters

### [conversation-update-es6](./conversation-update-es6)
Simple bot that handles conversation updates.

- Introduces the concept of Activities and their different types

### [echobot-es6](./echobot-es6)

Simple echo bot that echoes a user's message back across _different channels_. 

- Discusses the concept of BotState, speficically UserState and ConversationState 
- These classes are exposed in [`botbuilder`](https://github.com/Microsoft/botbuilder-js/tree/master/libraries/botbuilder), but the source code can be found in [`botbuilder-core`](https://github.com/Microsoft/botbuilder-js/tree/master/libraries/botbuilder-core)

### [single-prompt-bot-es6](./single-prompt-bot-es6)

Shows how to gather information from a user.

- Introduces [prompts](https://github.com/Microsoft/botbuilder-js/tree/master/doc/botbuilder-prompts) via the [`botbuilder-prompts`](https://github.com/Microsoft/botbuilder-js/tree/master/libraries/botbuilder-prompts) library

### [multiple-prompts-bot-es6](./multiple-prompts-bot-es6)

Shows how to gather user information using multiple prompts with a dialog.

- Introduces [dialogs](https://github.com/Microsoft/botbuilder-js/tree/master/doc/botbuilder-dialogs) via the [`botbuilder-dialogs`](https://github.com/Microsoft/botbuilder-js/tree/master/libraries/botbuilder-dialogs) library
- `botbuilder-dialogs` also exposes `botbuilder-prompts` related interfaces for TypeScript developers

### [rich-cards-es6](./rich-cards-es6)

Displays how to create and use Rich Cards using `CardFactory`.

- Introduces Rich Cards and its factory which can be found in [`botbuilder-cores`](https://github.com/Microsoft/botbuilder-js/tree/master/libraries/botbuilder-core) and is available in `botbuilder`

### [qna-maker-bot-es6](./qna-maker-bot-es6)

Shows how to integrate QnA Maker with a bot.

- Introduces the [`botbuilder-ai`](https://github.com/Microsoft/botbuilder-js/tree/master/libraries/botbuilder-ai) library and the [`QnAMaker`](https://github.com/Microsoft/botbuilder-js/blob/master/doc/botbuilder-ai/classes/botbuilder_ai.qnamaker.md) class

### [luis-bot-es6](./luis-bot-es6)

Shows how to integrate LUIS with a bot.

- Introduces the [`LuisRecognizer`](https://github.com/Microsoft/botbuilder-js/blob/master/doc/botbuilder-ai/classes/botbuilder_ai.luisrecognizer.md)  class, also found in [`botbuilder-ai`](https://github.com/Microsoft/botbuilder-js/tree/master/libraries/botbuilder-ai)

### [dispatch-es6](./dispatch-es6)

Demonstrates how to use the Dispatch tool from [BotBuilder-Tools](https://github.com/Microsoft/botbuilder-tools) to create a bot that uses LUIS to dispatch user messages across different NLU services.

- Introduces [`botdispatch`](https://github.com/Microsoft/botbuilder-tools/tree/master/Dispatch), and [BotBuilder-Tools](https://github.com/Microsoft/botbuilder-tools)

### [echobot-es6-botframework-webchat](./echobot-es6-botframework-webchat)

Demonstrates how to create a bot that lives in the browser using a custom adapter. Also introduces the alternative storage middleware that can be used to store state, such as `CosmosDbStorage`, and `BlobStorage`.


- Introduces creating a [custom adapter](https://github.com/Microsoft/botbuilder-js/blob/master/samples/echobot-es6-botframework-webchat/src/webChatAdapter.js) using [BotFramework-WebChat](https://github.com/Microsoft/BotFramework-WebChat/).
- Introduces [`CosmosDbStorage`](https://github.com/Microsoft/botbuilder-js/blob/master/doc/botbuilder-azure/classes/botbuilder_azure.cosmosdbstorage.md), and [`BlobStorage`](https://github.com/Microsoft/botbuilder-js/blob/master/doc/botbuilder-azure/classes/botbuilder_azure.blobstorage.md) which are found in the [`botbuilder-azure`](https://github.com/Microsoft/botbuilder-js/tree/master/libraries/botbuilder-azure) library.

### [simple-prompt-bot-es6](./simple-prompt-bot-es6)

Demonstrates how to use prompts to get (and validate) information.

- Introduces [prompts](https://github.com/Microsoft/botbuilder-js/tree/master/doc/botbuilder-prompts) via the [`botbuilder-prompts`](https://github.com/Microsoft/botbuilder-js/tree/master/libraries/botbuilder-prompts) library

### [card-actions-es6](./card-actions-es6)

Demonstrates how to use CardActions to enhance the user experience.

- Introduces to [CardActions](https://github.com/Microsoft/botbuilder-js/blob/master/doc/botbuilder/interfaces/botbuilder.cardaction.md) and [SuggestedActions](https://github.com/Microsoft/botbuilder-js/blob/master/doc/botbuilder/interfaces/botbuilder.suggestedactions.md).

### [helpandcancel-es6](./helpandcancel-es6)

Demonstrates how to route messages through your bot code.