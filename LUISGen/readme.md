# LUISGen Command Line tool
[![npm version](https://badge.fury.io/js/botdispatch.svg)](https://badge.fury.io/js/botdispatch) 
LUISGen is a tool for generating a strongly typed C# class to make consuming LUIS output easier.

## Pre-requisite

- [Node.js](https://nodejs.org/) version 8.5 or higher


## Installation
To install simply invoke npm 

```shell
npm install -g luisgen
```

This will install luisgen into your global path.

## Generating a class

LUISGen <LUIS.json> [-cs [[NAMESPACE.]CLASS]] [-ts [[MODULE.][CLASS]] [-o PATH]

From a LUIS export file generate a strongly typed class for consuming intents and entities.

If the input is -, will get the export file from stdin.

At least one of -cs or -ts must be supplied.

Everything to the left of the last dot in the class name is the namespace in C# and the module in typescript.

-cs [[NAMESPACE.][CLASS]] : Generate C# class file including namespace.  Default is Luis.APPNAME> if no class name is specified.

-ts [[MODULE.][CLASS]] : Generate Typescript interface descriptions.  Default is <appName> if no class name is specified.

-o PATH : Where to put generated files, defaults to directory where export file is.

## Using the generated class in C#
1) Add the .cs file to your project.
2) Call your LuisRecognizer instance supplying the type to .Recognize.

    var result = recognizer.Recognize<Yourclass>("hi", CancellationToken.None);

The variable will be strongly typed LUIS Result.

## Using the generated class in Typescript
1) Add the .ts file to your project.
2) Call your LuisRecognizer instance and type the returned result with your class.

    recognizer.recognize(context).then(res : YOURCLASS => {});

The callback value res will be a strongly typed LUIS result.
