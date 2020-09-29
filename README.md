
# ![Bot Framework SDK v4 for JavaScript](./docs/media/BotFrameworkJavaScript_header.png)

This repository contains code for the JavaScript version of the [Microsoft Bot Framework SDK](https://github.com/Microsoft/botframework-sdk), which is part of the Microsoft Bot Framework - a comprehensive framework for building enterprise-grade conversational AI experiences. 

This SDK enables developers to model conversation and build sophisticated bot applications using JavaScript. SDKs for [.NET](https://github.com/Microsoft/botbuilder-dotnet), [Python](https://github.com/Microsoft/botbuilder-python) and [Java (preview)](https://github.com/Microsoft/botbuilder-java) are also available.

To get started building bots using the SDK, see the [Azure Bot Service Documentation](https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0).  If you are an existing user, then you can also [find out what's new with Bot Framework](https://docs.microsoft.com/en-us/azure/bot-service/what-is-new?view=azure-bot-service-4.0).

For more information jump to a section below.

* [Build status](#build-status)
* [Packages](#packages)
* [Getting started](#getting-started)
* [Getting support and providing feedback](#getting-support-and-providing-feedback)
* [Contributing and our code of conduct](#contributing-and-our-code-of-conduct)
* [Reporting security sssues](#reporting-security-issues)

## Build Status

 | Branch | Description        | Build Status | Coverage Status | Windows Bot Test Status | Linux Bot Test Status |Browser Functional Tests
 |----|---------------|--------------|-----------------|--|--|--|
|Main | 4.11.* Preview Builds |[![Build status](https://fuselabs.visualstudio.com/SDK_v4/_apis/build/status/JS/BotBuilder-JS-master-daily)](https://fuselabs.visualstudio.com/SDK_v4/_build/latest?definitionId=460)|[![Coverage Status](https://coveralls.io/repos/github/microsoft/botbuilder-js/badge.svg?branch=main)](https://coveralls.io/github/microsoft/botbuilder-js?branch=main)|[![Build Status](https://fuselabs.visualstudio.com/SDK_v4/_apis/build/status/JS/Run-JS-Functional-Tests-Windows?branchName=main)](https://fuselabs.visualstudio.com/SDK_v4/_build/latest?definitionId=548&branchName=main)|[![Build Status](https://fuselabs.visualstudio.com/SDK_v4/_apis/build/status/JS/Run-JS-Functional-Tests-Linux?branchName=main)](https://fuselabs.visualstudio.com/SDK_v4/_build/latest?definitionId=549&branchName=main)|[![Build Status](https://fuselabs.visualstudio.com/SDK_v4/_apis/build/status/SDK_v4-CI?branchName=main)](https://fuselabs.visualstudio.com/SDK_v4/_build/latest?definitionId=731&branchName=main)

## Packages

| Name                                  | NPM Package |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| adaptive-expressions                         | [![BotBuilder Badge](https://img.shields.io/npm/dt/adaptive-expressions.svg?logo=npm&label=adaptive-expressions)](https://www.npmjs.com/package/adaptive-expressions/)                                 |
| botbuilder                         | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder.svg?logo=npm&label=botbuilder)](https://www.npmjs.com/package/botbuilder/)                                 |
| botbuilder-ai                      | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-ai.svg?logo=npm&label=botbuilder-ai)](https://www.npmjs.com/package/botbuilder-ai/)                 |
| botbuilder-applicationinsights     | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-applicationinsights.svg?logo=npm&label=botbuilder-applicationinsights)](https://www.npmjs.com/package/botbuilder-applicationinsights/)                 |
| botbuilder-azure                   | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-azure.svg?logo=npm&label=botbuilder-azure)](https://www.npmjs.com/package/botbuilder-azure/)                   |
| botbuilder-core                    | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-core.svg?logo=npm&label=botbuilder-core)](https://www.npmjs.com/package/botbuilder-core/)                     |
| botbuilder-dialogs                 | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-dialogs.svg?logo=npm&label=botbuilder-dialogs)](https://www.npmjs.com/package/botbuilder-dialogs/)                 |
| botbuilder-dialogs-adaptive                 | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-dialogs-adaptive.svg?logo=npm&label=botbuilder-dialogs-adaptive)](https://www.npmjs.com/package/botbuilder-dialogs-adaptive/)                 |
| botbuilder-dialogs-declarative                 | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-dialogs-declarative.svg?logo=npm&label=botbuilder-dialogs-declarative)](https://www.npmjs.com/package/botbuilder-dialogs-declarative/)                 |
| botbuilder-lg                 | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-lg.svg?logo=npm&label=botbuilder-lg)](https://www.npmjs.com/package/botbuilder-lg/)                 |
| botbuilder-testing                 | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-testing.svg?logo=npm&label=botbuilder-testing)](https://www.npmjs.com/package/botbuilder-testing/)                 |
| botframework-config                | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-config.svg?logo=npm&label=botframework-config)](https://www.npmjs.com/package/botframework-config/) |
| botframework-connector             | [![BotBuilder Badge](https://img.shields.io/npm/dt/botframework-connector.svg?logo=npm&label=botframework-connector)](https://www.npmjs.com/package/botframework-connector/)                     |
| botframework-schema                | [![BotBuilder Badge](https://img.shields.io/npm/dt/botframework-schema.svg?logo=npm&label=botframework-schema)](https://www.npmjs.com/package/botframework-schema/)                             |
| botframework-streaming                | [![BotBuilder Badge](https://img.shields.io/npm/dt/botframework-streaming.svg?logo=npm&label=botframework-streaming)](https://www.npmjs.com/package/botframework-streaming/)                             |

To view package interdependencies, see the [dependency graph](https://botbuildersdkblobstorage.blob.core.windows.net/sdk-js-dependency-reports/latest/InterdependencyGraph.html).

## Getting Started
To get started building bots using the SDK, see the [Azure Bot Service Documentation](https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0).

The [Bot Framework Samples](https://github.com/microsoft/botbuilder-samples) includes a rich set of samples repository.

If you want to debug an issue, would like to [contribute](#contributing), or understand how the Bot Builder SDK works, instructions for building and testing the SDK are below.

### Prerequisites
- [Git](https://git-scm.com/downloads) 
- [Node.js](https://nodejs.org/en/)
- [Lerna](https://lernajs.io/)
- [Nyc](https://www.npmjs.com/package/nyc)
- [Mocha](https://www.npmjs.com/package/mocha)
- [TypeScript](https://www.typescriptlang.org/)
- Your favorite code-editor for example [VS Code](https://code.visualstudio.com/)

### Clone
Clone a copy of the repo:

```bash
git clone https://github.com/Microsoft/botbuilder-js.git
```

Change to the SDK's directory:

```bash
cd botbuilder-js
```

### Build and test locally
Install the prerequisites. This will also run the postinstall script (`lerna bootstrap --hoist`).

```bash
npm install
```

Then use the following command to build the SDK.

```bash
npm run build
```

### Running unit tests

Use the following command to run the unit tests.

```bash
npm run test
```

The `prep-test.cmd` command is run to install test keys and start the [Azure Storage Emulator](https://docs.microsoft.com/en-us/azure/storage/common/storage-use-emulator) if its installed. Any unit tests needing test keys or the storage emulator are designed to be skipped if their dependencies are missing so most developers won't need to worry about running this command. 

If you have a need to re-generate the LUIS or connector clients using the latest swagger you'll need to install `autorest` (requires Node 7.10.0 or higher), which you can do with the following command.

```bash
npm install --global autorest
```

## Getting support and providing feedback
Below are the various channels that are available to you for obtaining support and providing feedback. Please pay carful attention to which channel should be used for which type of content. e.g. general "how do I..." questions should be asked on Stack Overflow, Twitter or Gitter, with GitHub issues being for feature requests and bug reports.

### Github issues
[Github issues](https://github.com/Microsoft/botbuilder-python/issues) should be used for bugs and feature requests. 

### Stack overflow
[Stack Overflow](https://stackoverflow.com/questions/tagged/botframework) is a great place for getting high-quality answers. Our support team, as well as many of our community members are already on Stack Overflow providing answers to 'how-to' questions.

### Azure Support 
If you issues relates to [Azure Bot Service](https://azure.microsoft.com/en-gb/services/bot-service/), you can take advantage of the available [Azure support options](https://azure.microsoft.com/en-us/support/options/).

### Twitter
We use the [@botframework](https://twitter.com/botframework) account on twitter for announcements and members from the development team watch for tweets for @botframework.

### Gitter Chat Room
The [Gitter Channel](https://gitter.im/Microsoft/BotBuilder) provides a place where the Community can get together and collaborate.

## Contributing and our code of conduct
We welcome contributions and suggestions. Please see our [contributing guidelines](./contributing.md) for more information.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). 
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact
 [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Reporting Security Issues
Security issues and bugs should be reported privately, via email, to the Microsoft Security Response Center (MSRC) 
at [secure@microsoft.com](mailto:secure@microsoft.com).  You should receive a response within 24 hours.  If for some
 reason you do not, please follow up via email to ensure we received your original message. Further information, 
 including the [MSRC PGP](https://technet.microsoft.com/en-us/security/dn606155) key, can be found in the 
[Security TechCenter](https://technet.microsoft.com/en-us/security/default).

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](./LICENSE.md) License.
