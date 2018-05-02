# Bot Builder tools
This repository contains code for Bot Builder tools. Bot Builder tools are designed to cover end-to-end bot development workflow and include the following tools - 
- [![npm version](https://badge.fury.io/js/chatdown.svg)](https://badge.fury.io/js/chatdown) [Chatdown](https://github.com/Microsoft/botbuilder-tools/tree/master/Chatdown): Create mockups of bot conversation transcripts
- [![npm version](https://badge.fury.io/js/msbot.svg)](https://badge.fury.io/js/msbot) [MSBot](https://github.com/Microsoft/botbuilder-tools/tree/master/MSBot): Create and manage your bot configuration file
- [![npm version](https://badge.fury.io/js/ludown.svg)](https://badge.fury.io/js/ludown) [LUDown](https://github.com/Microsoft/botbuilder-tools/tree/master/Ludown): Bootstrap language understanding using markdown files
- [![npm version](https://badge.fury.io/js/luis-apis.svg)](https://badge.fury.io/js/luis-apis) [LUIS](https://github.com/Microsoft/botbuilder-tools/tree/master/LUIS): Create and manage your [LUIS.ai](http://luis.ai) application
- [![npm version](https://badge.fury.io/js/qnamaker.svg)](https://badge.fury.io/js/qnamaker) [QnAMaker](https://github.com/Microsoft/botbuilder-tools/tree/master/QnAMaker): Create and manage [QnAMaker.ai](http://qnamaker.ai) Knowledge Base.
- [![npm version](https://badge.fury.io/js/botdispatch.svg)](https://badge.fury.io/js/botdispatch) [Dispatch](https://github.com/Microsoft/botbuilder-tools/tree/master/Dispatch): Bring disparate language understanding models to work together for your bot
- [![npm version](https://badge.fury.io/js/luisgen.svg)](https://badge.fury.io/js/botdispatch) [LUISGen](https://github.xom/Microsoft/botbuilder-tools/tree/master/LUISGen): Generate C# class or Typescript interface over a LUIS model.

To install all CLI tools, 

```
npm install -g chatdown msbot ludown luis-apis qnamaker botdispatch luisgen
```
Please see [here](https://aka.ms/BotBuilderOverview) for an overview of the end-to-end development workflow. 
Please see [here](https://aka.ms/BotBuilderLocalDev) for an example end to end development workflow using Bot Builder tools.

Before writing code, review the [bot design guidelines](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-design-principles) for best practices and identify the needs for your bot: will a basic bot be enough or more sophisticated capabilities, such as speech, language understanding, QnA, or the ability to extract knowledge from different sources, and provide intelligent answers. This is also the phase where you might want to create mockup of conversations between the user and bot for the specific scenarios your bot will support. [Chatdown](https://github.com/Microsoft/botbuilder-tools/tree/master/Chatdown) is the tool custom built for this purpose. You can simply author .chat files that mockup conversations and use chatdown CLI to convert them into rich transcripts. 

As you are building your bot, you also need to build and integrate AI services like [LUIS.ai](http://luis.ai) for language understanding, [QnAMaker.ai](http://qnamaker.ai) for your bot to respond to simple question-answers and more. You can start bootstrapping language understanding for your bot using [LUDown](https://github.com/Microsoft/botbuilder-tools/tree/master/ludown). The tools are designed to work together; you can then use [LUIS](https://github.com/Microsoft/botbuilder-tools/tree/master/LUIS) CLI and/ or the [QnAMaker](https://github.com/Microsoft/botbuilder-tools/tree/master/QnAMaker) CLI tools to create your LUIS.ai model(s) and QnAMaker knowledge base. As your bot grows in sophistication, [Dispatch](https://github.com/Microsoft/botbuilder-tools/tree/master/Dispatch) CLI can help create and evaluate LUIS model used to dispatch intent across multiple bot modules such as LUIS model(s), QnA knowledge base(s) and others (added to dispatch as a file type).
Throughout your Build phase, you can use [MSBot](https://github.com/Microsoft/botbuilder-tools/tree/master/MSBot) CLI to create and keep your bot configuration file updated with all relevant service references.

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Reporting Security Issues
Security issues and bugs should be reported privately, via email, to the Microsoft Security Response Center (MSRC) at [secure@microsoft.com](mailto:secure@microsoft.com). You should receive a response within 24 hours. If for some reason you do not, please follow up via email to ensure we received your original message. Further information, including the [MSRC PGP](https://technet.microsoft.com/en-us/security/dn606155) key, can be found in the [Security TechCenter](https://technet.microsoft.com/en-us/security/default).

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](https://github.com/Microsoft/vscode/blob/master/LICENSE.txt) License.
