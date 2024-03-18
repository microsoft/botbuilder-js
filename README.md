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

| Branch    | Description  | Test Status                                                                                                                                                                    | Coverage Status                                                                                                                                                           | Windows Bot Test Status                                                                                                                                                                                                       | Linux Bot Test Status                                                                                                                                                                                                     | Browser Functional Tests
|-----------|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| main      | 4.15.x Tests | [![Test Status](https://github.com/microsoft/botbuilder-js/actions/workflows/tests.yml/badge.svg)](https://github.com/microsoft/botbuilder-js/actions/workflows/tests.yml)     | [![Coverage Status](https://coveralls.io/repos/github/microsoft/botbuilder-js/badge.svg?branch=main)](https://coveralls.io/github/microsoft/botbuilder-js?branch=main)    | [![Build Status](https://fuselabs.visualstudio.com/SDK_v4/_apis/build/status/js/run-js-functional-tests-windows?branchName=main)](https://fuselabs.visualstudio.com/SDK_v4/_build/latest?definitionId=548&branchName=main)    | [![Build Status](https://fuselabs.visualstudio.com/SDK_v4/_apis/build/status/js/run-js-functional-tests-linux?branchName=main)](https://fuselabs.visualstudio.com/SDK_v4/_build/latest?definitionId=549&branchName=main)  | [![Build Status](https://fuselabs.visualstudio.com/SDK_v4/_apis/build/status/SDK_v4-CI?branchName=main)](https://fuselabs.visualstudio.com/SDK_v4/_build/latest?definitionId=731&branchName=main) |

## Packages

| Name                                                              | NPM Package                                                                                                                                                                                                                                                                                               |
|-------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| adaptive-expressions                                              | [![BotBuilder Badge](https://img.shields.io/npm/dt/adaptive-expressions.svg?logo=npm&label=adaptive-expressions)](https://www.npmjs.com/package/adaptive-expressions/)                                                                                                                                    |
| adaptive-expressions-ie11                                         | [![BotBuilder Badge](https://img.shields.io/npm/dt/adaptive-expressions-ie11.svg?logo=npm&label=adaptive-expressions-ie11)](https://www.npmjs.com/package/adaptive-expressions-ie11/)                                                                                                                          |
| botbuilder                                                        | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder.svg?logo=npm&label=botbuilder)](https://www.npmjs.com/package/botbuilder/)                                                                                                                                                                  |
| botbuilder-ai                                                     | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-ai.svg?logo=npm&label=botbuilder-ai)](https://www.npmjs.com/package/botbuilder-ai/)                                                                                                                                                         |
| botbuilder-ai-orchestrator                                        | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-ai-orchestrator.svg?logo=npm&label=botbuilder-ai-orchestrator)](https://www.npmjs.com/package/botbuilder-ai-orchestrator/)                                                                                                                  |
| botbuilder-ai-luis                                                | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-ai-luis.svg?logo=npm&label=botbuilder-ai-luis)](https://www.npmjs.com/package/botbuilder-ai-luis/)                                                                                                                                          |
| botbuilder-ai-qna                                                 | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-ai-qna.svg?logo=npm&label=botbuilder-ai-qna)](https://www.npmjs.com/package/botbuilder-ai-qna/)                                                                                                                                             |
| botbuilder-applicationinsights                                    | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-applicationinsights.svg?logo=npm&label=botbuilder-applicationinsights)](https://www.npmjs.com/package/botbuilder-applicationinsights/)                                                                                                      |
| botbuilder-azure                                                  | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-azure.svg?logo=npm&label=botbuilder-azure)](https://www.npmjs.com/package/botbuilder-azure/)                                                                                                                                                |
| botbuilder-azure-blobs                                            | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-azure-blobs.svg?logo=npm&label=botbuilder-azure-blobs)](https://www.npmjs.com/package/botbuilder-azure-blobs/)                                                                                                                              |
| botbuilder-azure-queues                                           | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-azure-queues.svg?logo=npm&label=botbuilder-azure-queues)](https://www.npmjs.com/package/botbuilder-azure-queues/)                                                                                                                           |
| botbuilder-core                                                   | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-core.svg?logo=npm&label=botbuilder-core)](https://www.npmjs.com/package/botbuilder-core/)                                                                                                                                                   |
| botbuilder-dialogs                                                | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-dialogs.svg?logo=npm&label=botbuilder-dialogs)](https://www.npmjs.com/package/botbuilder-dialogs/)                                                                                                                                          |
| botbuilder-dialogs-adaptive                                       | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-dialogs-adaptive.svg?logo=npm&label=botbuilder-dialogs-adaptive)](https://www.npmjs.com/package/botbuilder-dialogs-adaptive/)                                                                                                               |
| botbuilder-dialogs-adaptive-runtime                               | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-dialogs-adaptive-runtime.svg?logo=npm&label=botbuilder-dialogs-adaptive-runtime)](https://www.npmjs.com/package/botbuilder-dialogs-adaptive-runtime/)                                                                                       |
| botbuilder-dialogs-adaptive-runtime-core                          | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-dialogs-adaptive-runtime-core.svg?logo=npm&label=botbuilder-dialogs-adaptive-runtime-core)](https://www.npmjs.com/package/botbuilder-dialogs-adaptive-runtime-core/)                                                                        |
| botbuilder-dialogs-adaptive-runtime-integration-express           | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-dialogs-adaptive-runtime-integration-express.svg?logo=npm&label=botbuilder-dialogs-adaptive-runtime-integration-express)](https://www.npmjs.com/package/botbuilder-dialogs-adaptive-runtime-integration-express/)                           |
| botbuilder-dialogs-adaptive-runtime-integration-azure-functions   | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-dialogs-adaptive-runtime-integration-azure-functions.svg?logo=npm&label=botbuilder-dialogs-adaptive-runtime-integration-azure-functions)](https://www.npmjs.com/package/botbuilder-dialogs-adaptive-runtime-integration-azure-functions/)   |
| botbuilder-dialogs-adaptive-runtime-integration-restify           | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-dialogs-adaptive-runtime-integration-restify.svg?logo=npm&label=botbuilder-dialogs-adaptive-runtime-integration-restify)](https://www.npmjs.com/package/botbuilder-dialogs-adaptive-runtime-integration-restify/)                           |
| botbuilder-dialogs-adaptive-testing                               | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-dialogs-adaptive-testing.svg?logo=npm&label=botbuilder-dialogs-adaptive-testing)](https://www.npmjs.com/package/botbuilder-dialogs-adaptive-testing/)                                                                                       |
| botbuilder-dialogs-declarative                                    | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-dialogs-declarative.svg?logo=npm&label=botbuilder-dialogs-declarative)](https://www.npmjs.com/package/botbuilder-dialogs-declarative/)                                                                                                      |
| botbuilder-lg                                                     | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-lg.svg?logo=npm&label=botbuilder-lg)](https://www.npmjs.com/package/botbuilder-lg/)                                                                                                                                                         |
| botbuilder-stdlib                                                 | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-stdlib.svg?logo=npm&label=botbuilder-stdlib)](https://www.npmjs.com/package/botbuilder-stdlib/)                                                                                                                                             |
| botbuilder-testing                                                | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-testing.svg?logo=npm&label=botbuilder-testing)](https://www.npmjs.com/package/botbuilder-testing/)                                                                                                                                          |
| botframework-config                                               | [![BotBuilder Badge](https://img.shields.io/npm/dt/botbuilder-config.svg?logo=npm&label=botframework-config)](https://www.npmjs.com/package/botframework-config/)                                                                                                                                         |
| botframework-connector                                            | [![BotBuilder Badge](https://img.shields.io/npm/dt/botframework-connector.svg?logo=npm&label=botframework-connector)](https://www.npmjs.com/package/botframework-connector/)                                                                                                                              |
| botframework-schema                                               | [![BotBuilder Badge](https://img.shields.io/npm/dt/botframework-schema.svg?logo=npm&label=botframework-schema)](https://www.npmjs.com/package/botframework-schema/)                                                                                                                                       |
| botframework-streaming                                            | [![BotBuilder Badge](https://img.shields.io/npm/dt/botframework-streaming.svg?logo=npm&label=botframework-streaming)](https://www.npmjs.com/package/botframework-streaming/)                                                                                                                              |

To view package interdependencies, see the [dependency graph](https://botbuildersdkblobstorag2.blob.core.windows.net/sdk-js-dependency-reports/latest/InterdependencyGraph.html).

## Getting Started

To get started building bots using the SDK, see the [Azure Bot Service Documentation](https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0).

The [Bot Framework Samples](https://github.com/microsoft/botbuilder-samples) includes a rich set of samples repository.

If you want to debug an issue, would like to [contribute](#Contributing-and-our-code-of-conduct), or understand how the Bot Builder SDK works, instructions for building and testing the SDK are below.

### Prerequisites
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/)
- [Yarn 1.x](https://classic.yarnpkg.com/)
- [TypeScript](https://www.typescriptlang.org/) version >= 3.8
- Your favorite code-editor for example [VS Code](https://code.visualstudio.com/)

### Clone

Clone a copy of the repo:

```bash
git clone https://github.com/microsoft/botbuilder-js.git
```

Change to the SDK's directory:

```bash
cd botbuilder-js
```

### Build and test locally

Install the prerequisites.

```bash
yarn
```

Then use the following command to build the SDK.

```bash
yarn build
```

### Running unit tests

Use the following command to run the unit tests.

```bash
yarn test
```

The `prep-test.cmd` command is run to install test keys and start the [Azure Storage Emulator](https://docs.microsoft.com/en-us/azure/storage/common/storage-use-emulator) if its installed. Any unit tests needing test keys or the storage emulator are designed to be skipped if their dependencies are missing so most developers won't need to worry about running this command.

If you have a need to re-generate the LUIS or connector clients using the latest swagger you'll need to install `autorest` (requires Node 7.10.0 or higher), which you can do with the following command.

```bash
yarn global add global autorest
```

## Getting support and providing feedback

Below are the various channels that are available to you for obtaining support and providing feedback. Please pay carful attention to which channel should be used for which type of content. e.g. general "how do I..." questions should be asked on Stack Overflow, Twitter or Gitter, with GitHub issues being for feature requests and bug reports.

### Github issues

[Github issues](https://github.com/Microsoft/botbuilder-js/issues) should be used for bugs and feature requests.

### Stack overflow

[Stack Overflow](https://stackoverflow.com/questions/tagged/botframework) is a great place for getting high-quality answers. Our support team, as well as many of our community members are already on Stack Overflow providing answers to 'how-to' questions.

### Azure Support

If you issues relates to [Azure Bot Service](https://azure.microsoft.com/en-gb/services/bot-service/), you can take advantage of the available [Azure support options](https://azure.microsoft.com/en-us/support/options/).

### Twitter

We use the [@msbotframework](https://twitter.com/msbotframework) account on twitter for announcements and members from the development team watch for tweets for [@msbotframework](https://twitter.com/msbotframework).

### Gitter Chat Room

The [Gitter Channel](https://gitter.im/Microsoft/BotBuilder) provides a place where the Community can get together and collaborate.

## Contributing and our code of conduct

We welcome contributions and suggestions. Please see our [contributing guidelines](./Contributing.md) for more information.

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

Licensed under the [MIT](./LICENSE) License.
