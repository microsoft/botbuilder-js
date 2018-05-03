# LUISGen Command Line Tool
[![npm version](https://badge.fury.io/js/luisgen.svg)](https://badge.fury.io/js/luisgen)

LUISGen is a tool for generating a strongly typed C# class to make consuming LUIS output easier.

## Prerequisite

- [Node.js](https://nodejs.org/) version 8.5 or higher


## Installation
To install LUISGen into the global path:

```shell
npm install -g luisgen
```

## Generating a class

Generate a strongly typed class for consuming intents and entities from a LUIS export file:
`LUISGen <AppNameLUISExport.json> [-cs [[NAMESPACE.]CLASS]] [-ts [CLASS]] [-o PATH]`

If the input is empty, LUISGen will get the export file from stdin.

At least one of `-cs` or `-ts` must be supplied:

1) Generate C# class file including namespace.  Default is Luis.APPNAME if no class name is specified.
`cs [[NAMESPACE.][CLASS]]`

2) Generate Typescript interface descriptions.  Default is APPNAME if no class name is specified.
`-ts [CLASS]`

`-o PATH` specifies the output path to the generated files. Default value is the directory where the export file is located.

## Using the generated class in C#
1) Add the `.cs` file to your project.
2) Call your `LuisRecognizer` instance supplying the type to `.Recognize`:

    `var result = recognizer.Recognize<APPNAME>("hi", CancellationToken.None);`

The variable will be strongly typed LUIS result.

## Using the generated class in Typescript
1) Add the `.ts` file to your project.
2) Call your `LuisRecognizer` instance and type the returned result with your class.

    `recognizer.recognize(context).then(app : APPNAME => {});`

The callback value app will be a strongly typed LUIS result.
