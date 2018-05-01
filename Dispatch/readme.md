# Dispatch Command Line tool
[![npm version](https://badge.fury.io/js/botdispatch.svg)](https://badge.fury.io/js/botdispatch) 
Dispatch is a tool to create and evaluate LUIS model used to dispatch intent across multiple bot modules such as LUIS model(s), QnA knowledge base(s) and others (added to dispatch as a file type).

Use the Dispatch model in cases when:
1. Your bot consists of multiple modules and you need assistance in routing user's utterances to these modules and evaluate the bot integration.
2. Evaluate quality of intents classification of a single LUIS model.
3. Create a text classification model from text file(s).

## Pre-requisite

- [Node.js](https://nodejs.org/) version 8.5 or higher


## Installation
To install simply invoke npm 

```shell
npm install -g botdispatch
```

This will install dispatch into your global path.

# Usage

## Initializing dispatch

To initialize dispatch you run 

```shell
dispatch init [options]
```

It will ask you the name of the dispatch, LUIS authoring key and region needed to create a LUIS application.  This commands then creates {dispatchName}.dispatch file.
To bypass the prompts, values could be passed in via arguments below.

Arguments

| Option               | Description                       |
| -------------------- | --------------------------------- |
| -name                | (optional) Name of the dispatch   |
| -luisAuthoringKey    | (optional) LUIS authoring key     |
| -luisAuthoringRegion | (optional) LUIS authoring region  |
| -bot                 | (optional) .bot file path         |
| -hierarchical        | (optional) Default to false.  If false, existing intents from source LUIS model(s) will be available as the dispatch intents. |
| -dataFolder          | (optional) Working directory for tool |
| -h                   | Output usage information |

Example:

```shell
dispatch init -name TestDispatch -luisAuthoringKey F57AEEEBE67349C282E1DC51F6BA66D9 -luisAuthoringRegion westus 
dispatch init -bot c:\src\bot\testbot.bot
```


## Adding source to dispatch

This step is not needed if you have a .bot file already connected with services (ie LUIS/QnA). Dispatch will take the services in .bot file
and add each of the services it can dispatch to .dispatch file.

```shell
dispatch add -type luis -id 1090A345-2D89-4BED-99EF-1CE3E08B690E -name TestLuisApp -version 0.1 -key F57AEEEBE67349C282E1DC51F6BA66D9
dispatch add -type qna -id 09DF8311-9MSA-L2I9-DJEE-4MT434481212 -name Faq -key L2340T8NM78OSFDWAS23B4TAASMPO1N1
dispatch add -type file -name TestModule -filePath c:\src\testmodule.tsv
dispatch add -type file -name TestModule2 -filePath c:\src\testmodule2.txt
dispatch add -type file -name TestModule3 -filePath c:\src\testmodule3.json

```

Arguments

| Option       | Description |
| -----------  | ----------- |
| -type        | luis, qna, file|
| -id          | (required only if type is luis/qna) LUIS app id or QnA kb id - from application settings page)|
| -name        | LUIS app name or QnA name (from application settings page) or module/file name for file type |
| -key         | (required only if type is luis/qna) LUIS authoring key (from https://www.luis.ai/user/settings) or QnA maker key (from https://qnamaker.ai/UserSettings) |
| -version     | (Required only if type is luis) LUIS app version |
| -filePath    | (Required only if type is file) Path to tsv file containing tab delimited intent and utterance fields or .txt file with an utterance on each line |
| -dispatch    | (optional) Path to .dispatch file |
| -dataFolder  | (optional) Working directory for tool |
| -h           | Output usage information |


## Creating your dispatch model  

To create, train and publish your new dispatch model, run

```shell
dispatch create [options]
```

With the following options

| Option               | Description                                                  |
| ----------------     | ------------------------------------------------------------ |
| -bot                 | (optional) .bot file path         |
| -dispatch            | (optional) .dispatch file path    |
| -dataFolder          | (optional) Working directory for tool |
| -hierarchical        | (optional) Set to true (default) for all tasks except for single LUIS model evaluation when this should be set to false |
| -h                   | Output usage information |

This command creates a brand new LUIS application.

## Refreshing your dispatch model  

To train and publish your existing dispatch model after modification, run

```shell
dispatch refresh [options]
```

With the following options

| Option               | Description                                                  |
| ----------------     | ------------------------------------------------------------ |
| -bot                 | (optional) .bot file path         |
| -dispatch            | (optional) .dispatch file path    |
| -dataFolder          | (optional) Working directory for tool |
| -h                   | Output usage information |

This command updates existing LUIS application in .dispatch file.

## Evaluating your dispatch model  

This command will run cross validation evaluation on the dispatch model and generate a summary of the evaluation.    

```shell
dispatch eval [options]
```

With the following options.  If not given, the tool will prompt for the required information it needs to run model evaluation.

|Option | Description|
| ------ | ----------- |
| -luisPredictingKey    | (optional, will be prompted) LUIS predicting key     |
| -luisPredictingRegion | (optional, will be prompted) LUIS predicting region  |
| -dispatch            | (optional) .dispatch file path    |
| -dataFolder           | (optional) Output folder for tool |
| -h, --help            | Output usage information|

## Testing your dispatch model  

To test your dispatch model againsts test set, run

```shell
dispatch test [options]
```

With the following options

| Option               | Description                                                  |
| ----------------     | ------------------------------------------------------------ |
| -testFilePath        | Path to a tsv file with three (or two) fields: expected intent, weight and utterance in that order; the first line (header) will be skipped; the weight column is optional     |
| -luisPredictingKey   | (optional, will be prompted) LUIS predicting key     |
| -luisPredictingRegion| (optional, will be prompted) LUIS predicting region  |
| -dispatch            | (optional) .dispatch file path    |
| -dataFolder          | (optional) Output folder for tool |
| -h                   | Output usage information |


# Common Tasks

## Create and evaluate bot dispatch

End-to-end example of a bot consisting of a LUIS module and a QnA Maker knowledge base module:

```shell
dispatch init -name mybot_dispatch -luisAuthoringKey <luis_authoring_key> -luisAuthoringRegion <region>
dispatch add -name LuisChitChat -type luis -id <luis_app_id> -name <luis_app_name> -version <luis_app_version> -key <luis_app_authoring_key>
dispatch add -name MyKnowledgeBase -type qna -id <qna_kb_id> -name <kb_name> -key <qna_maker_key>
dispatch create
dispatch eval -luisPredictingKey <azure_luis_key> -luisPredictingRegion <azure_luis_region>
```

The output is Summary.html file located in local file system directory where the commands were issued. It includes all the evaluation results and suggestions for improving the bot components.

## Evaluate single LUIS model

Evaluate a LUIS model performing cross validation:

```shell
dispatch init -name mybot_dispatch -luisAuthoringKey <luis_authoring_key> -luisAuthoringRegion <region>
dispatch add -name LuisChitChat -type luis -id <luis_app_id> -name <luis_app_name> -version <luis_app_version> -key <luis_app_authoring_key>
dispatch create -hierarchical false
dispatch eval -luisPredictingKey <azure_luis_key> -luisPredictingRegion <azure_luis_region>
```

The output, Summary.html, contains all the evaluation results. The file is located in local file system directory where the commands were issued.

## Test a LUIS model using test utterances

Suppose the dispatcher model was already created following the steps of one of the above tasks. To test this model with a tab-delimitted text file run these commands:

```shell
dispatch test -testFilePath <text_file>
```

The output, Summary.html, contains all the evaluation results. The file is located in the location of the test file.

# Sample Code and Tutorial
C# Sample: https://github.com/Microsoft/botbuilder-dotnet/tree/master/samples/Microsoft.Bot.Samples.Ai.Luis.Dispatch 
JS Sample: https://github.com/Microsoft/botbuilder-js/tree/master/samples/dispatch-es6 
Tutorial: https://aka.ms/Sas1mu
