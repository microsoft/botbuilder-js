# Dispatch Command Line tool
[![npm version](https://badge.fury.io/js/botdispatch.svg)](https://badge.fury.io/js/botdispatch) 

Dispatch is a tool to create and evaluate LUIS models used to dispatch intent across multiple bot modules such as LUIS models, QnA knowledge bases and others (added to dispatch as a file type).

Use the Dispatch model in cases when:
1. Your bot consists of multiple modules and you need assistance in routing user's utterances to these modules and evaluate the bot integration.
2. Evaluate quality of intents classification of a single LUIS model.
3. Create a text classification model from text files.

## Prerequisite

- [Node.js](https://nodejs.org/) version 8.5 or higher
- For installation on Linux, please pre-install .NET Core runtime by following instructions on this page: https://docs.microsoft.com/en-us/dotnet/core/linux-prerequisites?tabs=netcore2x.

## Installation
To install:

```shell
npm install -g botdispatch
```

This will install dispatch into your global path.

# Usage

## Initializing dispatch

To initialize dispatch:

```shell
dispatch init [options]
```

It will ask for the name of the dispatch, LUIS authoring key and region needed to create a LUIS application.  This commands then creates {dispatchName}.dispatch file.
To bypass the prompts, values could be passed in via arguments below.

Arguments:

| Option               | Description                       |
| -------------------- | --------------------------------- |
| -n, --name           | (optional) Name of the dispatch   |
| --luisAuthoringKey    | (optional) LUIS authoring key     |
| --luisAuthoringRegion | (optional) LUIS authoring region  |
| -b, --bot             | (optional) .bot file path         |
| --hierarchical    | (optional) Default to true.  If false, existing intents from source LUIS model(s) will be available as the dispatch intents. |
| --dataFolder          | (optional) Working directory for tool |
| -h, --help            | Output usage information |

Example:

```shell
dispatch init -n TestDispatch --luisAuthoringKey F57AEEEBE67349C282E1DC51F6BA66D9 --luisAuthoringRegion westus 
dispatch init --bot c:\src\bot\testbot.bot
```


## Adding source to dispatch

This step is not needed if you have a .bot file already connected with services (i.e., LUIS/QnA). Dispatch will take the services in .bot file
and add each of the services it can dispatch to .dispatch file.

```shell
dispatch add -t luis -i 1090A345-2D89-4BED-99EF-1CE3E08B690E -n TestLuisApp -v 0.1 -k F57AEEEBE67349C282E1DC51F6BA66D9
dispatch add -t qna -i 09DF8311-9MSA-L2I9-DJEE-4MT434481212 -n Faq -k L2340T8NM78OSFDWAS23B4TAASMPO1N1
dispatch add -t file -n TestModule -f c:\src\testmodule.tsv
dispatch add -t file -n TestModule2 -f c:\src\testmodule2.txt
dispatch add -t file -n TestModule3 -f c:\src\testmodule3.json

```

Arguments

| Option       | Description |
| -----------  | ----------- |
| -t, --type   | luis, qna, file|
| -i, --id     | (required only if type is luis/qna) LUIS app id or QnA kb id from application settings page|
| -n, --name   | LUIS app name or QnA name (from application settings page) or module/file name for file type |
| -k, --key    | (required only if type is luis/qna) LUIS authoring key (from https://www.luis.ai/user/settings) or QnA maker key (from QnA Maker Cognitive Service resource page on https://ms.portal.azure.com) |
| -v, --version| (Required only if type is luis) LUIS app version |
| -f, --filePath| (Required only if type is file) Path to tsv file containing tab delimited intent and utterance fields or .txt file with an utterance on each line |
| --dispatch    | (optional) Path to .dispatch file |
| --dataFolder  | (optional) Working directory for tool |
| -h, --help    | Output usage information |

Supported file types:

| File extension       | Description |
| -----------  | ----------- |
| .tsv | Lines of tab delimited fields of intent and utterance (in that order) |
| .txt | Lines of utterances with intent as file name |
| .json | Exported LUIS or QnA Maker json file | 


## Removing dispatch source

To remove one of the services from .dispatch file, run

```shell
dispatch remove -t luis -i 1090A345-2D89-4BED-99EF-1CE3E08B690E 
dispatch remove -t qna -i 09DF8311-9MSA-L2I9-DJEE-4MT434481212 
dispatch remove -t file -f c:\src\testmodule.json

```

Arguments

| Option       | Description |
| -----------  | ----------- |
| -t, --type   | luis, qna, file|
| -i, --id     | (required only if type is luis/qna) LUIS app id or QnA kb id - from application settings page)|
| -n, --name   | LUIS app name or QnA name (from application settings page) or module/file name for file type |
| -f, --filePath | (Required only if type is file) Path to tsv file containing tab delimited intent and utterance fields or .txt file with an utterance on each line |
| --dispatch    | (optional) Path to .dispatch file |
| --dataFolder  | (optional) Working directory for tool |
| -h, --help    | Output usage information |

## Creating your dispatch model  

To create, train and publish your new dispatch model:

```shell
dispatch create [options]
```

Options:

| Option               | Description                                                  |
| ----------------     | ------------------------------------------------------------ |
| -b, --bot            | (optional) .bot file path         |
| --dispatch           | (optional) .dispatch file path    |
| --dataFolder         | (optional) Working directory for tool |
| --hierarchical       | (optional) Default to true, set to false when evaluating a single LUIS model |
| -h, --help           | Output usage information |

This command creates a brand new LUIS application.

## Refreshing your dispatch model  

To train and publish your existing dispatch model after modification:

```shell
dispatch refresh [options]
```

With the following options

| Option               | Description                                                  |
| ----------------     | ------------------------------------------------------------ |
| -b, --bot            | (optional) .bot file path         |
| --dispatch           | (optional) .dispatch file path    |
| --dataFolder         | (optional) Working directory for tool |
| -h, --help           | Output usage information |

This command updates existing LUIS application in .dispatch file.

## Evaluating your dispatch model  

This command will run cross validation evaluation on the dispatch model and generate a summary of the evaluation:  

```shell
dispatch eval [options]
```

Options:

|Option | Description|
| ------ | ----------- |
| --luisSubscriptionKey    | (optional, will be prompted) Cognitive Service LUIS key from portal.azure.com  |
| --luisSubscriptionRegion | (optional, will be prompted) Cognitive Service LUIS region from portal.azure.com  |
| --dispatch               | (optional) .dispatch file path    |
| --dataFolder             | (optional) Output folder for tool |
| -h, --help               | Output usage information|

If no options are supplied, the tool will prompt for the required information it needs to run model evaluation.

## Testing your dispatch model  

To test your dispatch model againsts test set:

```shell
dispatch test [options]
```

Options:

| Option                  | Description                                                  |
| --------------------    | ------------------------------------------------------------ |
| --testFilePath          | Path to a tsv file with three (or two) fields: expected intent, weight and utterance in that order; the first line (header) will be skipped; the weight column is optional     |
| --luisSubscriptionKey   | (optional) Cognitive Service LUIS key from portal.azure.com     |
| --luisSubscriptionRegion| (optional) Cognitive Service LUIS region from portal.azure.com  |
| --dispatch              | (optional) .dispatch file path    |
| --dataFolder            | (optional) Output folder for tool |
| -h, --help              | Output usage information |


## Run prediction using your dispatch model  

To run prediction againsts your new dispatch model, run

```shell
dispatch predict [options]
```

With the following options

| Option                  | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| --luisSubscriptionKey   | (optional) Cognitive Service LUIS key from portal.azure.com    |
| --luisSubscriptionRegion| (optional) Cognitive Service LUIS region from portal.azure.com  |
| --dispatch              | (optional) .dispatch file path    |
| --dataFolder            | (optional) Output folder for tool |
| -h, --help              | Output usage information |

You'll then be prompted to enter the utterance you'd like to run prediction on.

## Print dispatch configuration to console 

To print your current dispatch configuration, run

```shell
dispatch list [options]
```

With the following options

| Option               | Description                                                  |
| ----------------     | ------------------------------------------------------------ |
| --dispatch           | (optional) .dispatch file path    |
| --dataFolder         | (optional) Output folder for tool |
| -h, --help           | Output usage information |


# Common Tasks

## Create and evaluate bot dispatch

End-to-end example of a bot consisting of a LUIS module and a QnA Maker knowledge base module:

```shell
dispatch init -n mybot_dispatch --luisAuthoringKey <luis_authoring_key> --luisAuthoringRegion <region>
dispatch add -t luis -i <luis_app_id> -n <luis_app_name> -v <luis_app_version> -k <luis_app_authoring_key>
dispatch add -t qna -i <qna_kb_id> -n <kb_name> -k <qna_maker_key>
dispatch create
dispatch eval --luisSubscriptionKey <azure_luis_key> --luisSubscriptionRegion <azure_luis_region>
```

The output is Summary.html file located in local file system directory where the commands were issued. It includes all the evaluation results and suggestions for improving the bot components.

## Evaluate single LUIS model

Evaluate a LUIS model performing cross validation:

```shell
dispatch init -n mybot_dispatch --luisAuthoringKey <luis_authoring_key> --luisAuthoringRegion <region>
dispatch add -t luis -i <luis_app_id> -n <luis_app_name> -v <luis_app_version> -k <luis_app_authoring_key>
dispatch create --hierarchical false
dispatch eval --luisSubscriptionKey <azure_luis_key> --luisSubscriptionRegion <azure_luis_region>
```

The output, Summary.html, contains all the evaluation results. The file is located in local file system directory where the commands were issued.

## Test a LUIS model using test utterances

Suppose the dispatcher model was already created following the steps of one of the above tasks. To test this model with a tab-delimitted text file run these commands:

```shell
dispatch test --testFilePath <text_file>
```

The output, Summary.html, contains all the evaluation results. The file is located in the location of the test file.

# Sample Code and Tutorial
C# Sample: https://github.com/Microsoft/botbuilder-dotnet/tree/master/samples/Microsoft.Bot.Samples.Ai.Luis.Dispatch

JS Sample: https://github.com/Microsoft/botbuilder-js/tree/master/samples/dispatch-es6 

Tutorial: https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-tutorial-dispatch
