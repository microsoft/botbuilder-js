# Dispatch Command Line tool

Dispatch is a tool to create and evaluate LUIS model used to dispatch intent across multiple bot components such as LUIS model(s), QnA knowledge base(s) and others (added to dispatch as a file type - tab delimited file of intent and utterances).

## Installation
To install simply invoke npm 

```shell
npm install -g botdispatch
```

This will install dispatch into your global path.

# Usage

## Creating a .dispatchrc 

To create .dispatchrc file you run 

```shell
dispatch init [options]
```

It will ask you the name of the dispatch, LUIS authoring key and region needed to create a LUIS application.  This commands then creates .dispatchrc file.
To bypass the prompts, values could be passed in via arguments below.

Arguments

| Option               | Description                       |
| -------------------- | --------------------------------- |
| -name                | (optional) Name of the dispatch   |
| -luisAuthoringKey    | (optional) LUIS authoring key     |
| -luisAuthoringRegion | (optional) LUIS authoring region  |
| -bot                 | (optional) .bot file path         |
| -hierarchical        | (optional) Default to false.  If false, existing intents from source LUIS model(s) will be available as the dispatch intents. |
| -dataFolder          | (optional) Output folder for tool |
| -h                   | Output usage information |

Example:

```shell
dispatch init -name TestDispatch -luisAuthoringKey F57AEEEBE67349C282E1DC51F6BA66D9 -luisAuthoringRegion westus 
dispatch init -bot c:\src\bot\testbot.bot
```


## Adding source to dispatch

This step is not needed if you have a .bot file already connected with services (ie LUIS/QnA). Dispatch will take the services in .bot file
and add each of the services it can dispatch to .dispatchrc.

```shell
dispatch add -type luis -id 1090A3452D894BED99EF1CE3E08B690E -name TestLuisApp -version 0.1 -key F57AEEEBE67349C282E1DC51F6BA66D9
dispatch add -type file -name TestModule -filePath c:\src\testmodule.tsv

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
| -dataFolder  | (optional) Output folder for tool |
| -h           | Output usage information |


## Creating your dispatch model  

To create, train and publish your dispatch model, run

```shell
dispatch create [options]
```

With the following options

| Option               | Description                                                  |
| ----------------     | ------------------------------------------------------------ |
| -bot                 | (optional) .bot file path         |
| -hierarchical        | (optional) Default to false or the value in .dispatchrc if set in init.  If false, existing intents from source LUIS model(s) will be available as the dispatch intents. |
| -dataFolder          | (optional) Output folder for tool |
| -h                   | Output usage information |

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
| -dataFolder          | (optional) Output folder for tool |
| -h                   | Output usage information |

## Evaluating your dispatch model  

This command will run cross validation evaluation on the dispatch model and generate a summary of the evaluation.    

```shell
dispatch evaluate [options]
```

With the following options.  If not given, the tool will prompt for the required information it needs to run model evaluation.

|Option | Description|
| ------ | ----------- |
| -luisPredictingKey    | (optional, will be prompted) LUIS predicting key     |
| -luisPredictingRegion | (optional, will be prompted) LUIS predicting region  |
| -dataFolder           | (optional) Output folder for tool |
| -h, --help            | Output usage information|

