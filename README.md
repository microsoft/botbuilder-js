# Bot Builder SDK v4

This repository contains code for the JavaScript version of the [Microsoft Bot Builder SDK](https://github.com/Microsoft/BotBuilder). The 4.x version of the SDK is being actively developed and should therefore be used for **EXPERIMENTATION PURPOSES ONLY**. Production bots should continue to be developed using the [v3 SDK](https://github.com/Microsoft/BotBuilder/tree/master/Node).

In addition to the JavaScript SDK, Bot Builder supports creating bots in other popular programming languages:

- The [v4 .Net SDK](https://github.com/Microsoft/botbuilder-dotnet) has a high degree of parity with the JavaScript SDK and lets you build rich bots using C# for the Microsoft Bot Framework.
- The [Python Connector](https://github.com/Microsoft/botbuilder-python) provides basic connectivity to the Microsoft Bot Framework and lets developers build bots using Python. **v4 SDK coming soon**.
- The [Java Connector](https://github.com/Microsoft/botbuilder-java) provides basic connectivity to the Microsoft Bot Framework and lets developers build bots using Java. **v4 SDK coming soon**.

To see our [roadmap](FAQ.md#q-is-there-a-roadmap-for-this-sdk-when-will-this-be-generally-available) for the v4 SDK and other common questions, consult our [FAQ](FAQ.md).

## Getting Started

The v4 SDK consists of a series of [packages](/libraries) which can be installed from NPM using a special `@preview` tag. To get started first initialize the package for your v4 bot:

```bash
md myBot
cd myBot
npm init
```

Next install the preview bits of the SDK and restify from npm:

```bast
npm install --save botbuilder@preview
npm install --save botbuilder-services@preview
npm install --save restify
```

Paste the code below into a file called `app.js`:

```JavaScript
const { Bot } = require('botbuilder');
const { BotFrameworkAdapter } = require('botbuilder-services');
const restify = require('restify');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter and listen to servers '/api/messages' route.
const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});
server.post('/api/messages', adapter.listen());

// Initialize bot by passing it adapter
const bot = new Bot(botFrameworkAdapter);

// Define the bots onReceive message handler
bot.onReceive((context) => {
    if (context.request.type === 'message') {
        context.reply(`Hello World`);
    }
});
```

Now start your bot:

```bash
node app.js
```

To interact with your bot, download the [Bot Framework Emulator](https://emulator.botframework.com/), start it up, connect to your bot, and say "hello".

## Documentation


## Building

In order to build the SDK, ensure that you have [Git](https://git-scm.com/downloads) and [Node.js](https://nodejs.org/en/) installed.

Clone a copy of the repo:

```bash
git clone https://github.com/Microsoft/botbuilder-js.git
```

Change to the SDK's directory:

```bash
cd botbuilder-js
```

Install [Lerna](https://lernajs.io/) and dev dependencies:

```bash
npm install --global typescript
npm install --global mocha
npm install
```

Run lerna bootstrap:

```bash
lerna bootstrap --hoist
```

Run any of the following scripts to build and test:

```
lerna run build       # Build all of the SDK packages.
lerna run clean       # Delete all built files for SDK packages.
lerna run test        # Execute all unit tests for SDK packages.
lerna run build-docs  # Generate all documentation for SDK packages.    
```

The `prep-test.cmd` command is run to install test keys and start the [Azure Storage Emulator](https://docs.microsoft.com/en-us/azure/storage/common/storage-use-emulator) if its installed. Any unit tests needing test keys or the storage emulator are designed to be skipped if their dependencies are missing so most developers won't need to worry about running this command. 

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

Security issues and bugs should be reported privately, via email, to the Microsoft Security
Response Center (MSRC) at [secure@microsoft.com](mailto:secure@microsoft.com). You should
receive a response within 24 hours. If for some reason you do not, please follow up via
email to ensure we received your original message. Further information, including the
[MSRC PGP](https://technet.microsoft.com/en-us/security/dn606155) key, can be found in
the [Security TechCenter](https://technet.microsoft.com/en-us/security/default).

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](https://github.com/Microsoft/vscode/blob/master/LICENSE.txt) License.

