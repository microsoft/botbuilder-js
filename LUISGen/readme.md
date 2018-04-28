# LUISGen Command Line tool
[![npm version](https://badge.fury.io/js/botdispatch.svg)](https://badge.fury.io/js/botdispatch) 
LUISGen is a tool for generating a strongly typed C# class to make consuming LUIS output easier.
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
npm install -g luisgen
```

This will install luisgen into your global path.

## Usage

LUISGen [<LUIS.json>] [-cs [<class>]] [-o <path>]
From a LUIS export file generate a C# class for consuming intents and entities.
If the input is missing, will get the export file from stdin.
-cs [<class>] : Generate C# class file including namespace.  Default is Luis.<appName> if no class name is specified.
-o <path> : Where to put generated files, defaults to directory where export file is.

