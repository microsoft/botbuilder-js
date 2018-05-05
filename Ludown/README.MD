# LUDown

[![npm version](https://badge.fury.io/js/ludown.svg)](https://badge.fury.io/js/ludown)

.lu files help describe language understanding components for your bot. LUDown is a command line tool that helps convert .lu file(s) into JSON files that you can then use to create your [LUIS](http://luis.ai) app or [QnAMaker](http://qnamaker.ai) knowledge base. 

Language Understanding ([LUIS.ai](https://luis.ai/)) allows your application to understand what a person wants in their own words. LUIS uses machine learning to allow developers to build applications that can receive user input in natural language and extract meaning from it.

[QnA Maker](http://qnamaker.ai) enables you to go from FAQ to bot in minutes. With QnA Maker you can build, train and publish a simple question and answer bot based on FAQ URLs, structured documents or editorial content in minutes.

The .lu file and the LUDown tool serve several use cases:
- Quick, simple and easy way to bootstrap language understanding for your bot.
- Describe intents, entities, utterances and patterns for your bot in simple markdown documents.
- The language understanding definition for your bot lives with the rest of your code. You can use other CLI tools like luis to create a new LUIS app using the .lu files.
- Group language understanding documents by language and locale to easily manage localization.
- Define question and answer pairs for your bot.
- Works in conjunction with other Microsoft Bot Builder tools, like [LUIS CLI](https://github.com/Microsoft/botbuilder-tools/tree/master/LUIS) and [QnAMaker CLI](https://github.com/Microsoft/botbuilder-tools/tree/master/QnAMaker).

## Prerequisite

- [Node.js](https://nodejs.org/) version 8.5 or higher

## Installation

To install:
```bash
npm i -g ludown
```

## Commands

```
>ludown

  Usage: ludown [options] [command]

  Ludown is a command line tool to bootstrap language understanding models from .lu files

  Options:

    -V, --Version  output the version number
    -h, --help     output usage information

  Commands:

    parse|p        Convert .lu file(s) into LUIS JSON OR QnA Maker JSON files.
    refresh|d      Convert LUIS JSON and/ or QnAMaker JSON file into .lu file
    help [cmd]     display help for [cmd]
```

### Parse command

Convert .lu file(s) into LUIS JSON OR QnA Maker JSON files.

```
>ludown parse

  Usage: ludown parse [options] [command]

  Convert .lu file(s) into LUIS JSON, QnA Maker JSON files.

  Options:

    -h, --help     output usage information

  Commands:

    ToLuis|toluis  Convert .lu file(s) into LUIS JSON file.
    ToQna|toqna    Convert .lu file(s) into QnA Maker JSON files.
    help [cmd]     display help for [cmd]
```

#### Parse ToLuis command

Convert .lu file(s) into LUIS JSON file. Optionally you can also generate a LUIS Batch test JSON file. 

```
>ludown parse toluis

  Usage: ludown parse ToLuis --in <luFile> | --lu_folder <inputFolder> [-s]

  Convert .lu file(s) into LUIS JSON file. You can optionally also request LUIS batch test input file

  Options:

    --in <luFile>                                    .lu file to parse
    -l, --lu_folder <inputFolder>                    [Optional] Folder that has the .lu file. By default ludown will only look at the current folder. To look at all subfolders, include -s
    -o, --out_folder <outputFolder>                  [Optional] Output folder for all files the tool will generate
    -s, --subfolder                                  [Optional] Include sub-folders as well when looking for .lu files
    -n, --luis_name <luis_appName>                   [Optional] LUIS app name
    -d, --luis_desc <luis_appDesc>                   [Optional] LUIS app description
    -v, --luis_versionId <luis_versionId>            [Optional] LUIS app version (default: 0.1)
    -c, --luis_culture <luis_appCulture>             [Optional] LUIS app culture (default: en-us)
    -t, --write_luis_batch_tests                     [Optional] Write out LUIS batch test json file
    --verbose                                        [Optional] Get verbose messages from parser
    -h, --help                                       output usage information
```

#### Parse ToQna command

Convert .lu file(s) into QnA Maker JSON file.

```
>ludown parse toqna

  Usage: ludown parse ToQna --in <luFile> | --lu_folder <inputFolder> [-s]

  Convert .lu file(s) into QnA Maker JSON file

  Options:

    --in <luFile>                    .lu file to parse
    -l, --lu_folder <inputFolder>    [Optional] Folder with .lu file(s). By default ludown will only look at the current folder. -s to include subfolders
    -o, --out_folder <outputFolder>  [Optional] Output folder for all files the tool will generate
    -s, --subfolder                  [Optional] Include sub-folders as well when looking for .lu files
    -m, --qna_name <QnA_KB_Name>     [Optional] QnA KB name
    --verbose                        [Optional] Get verbose messages from parser
    -h, --help                       output usage information
```

### Refresh command
After you have bootstrapped and created your LUIS model and / or QnAMaker knowledge base, you might make subsequent refinements to your models directly from [luis.ai](https://luis.ai/) or [qnamaker.ai](https://qnamaker.ai). You can use the refresh command to re-genrate .lu files from your LUIS JSON and / or QnAMaker JSON files.  

```
>ludown refresh -h

  Usage: ludown refresh -i <LUISJsonFile> | -q <QnAJSONFile>

  Convert LUIS JSON and/ or QnAMaker JSON file into .lu file

  Options:

    -i, --LUIS_File <LUIS_JSON_File>            [Optional] LUIS JSON input file name
    -q, --QNA_FILE <QNA_FILE>                   [Optional] QnA Maker JSON input file name
    -o, --out_folder <outputFolder> [optional]  [Optional] Output folder for all files the tool will generate
    -n, --lu_File <LU_File>                     [Optional] Output .lu file name
    --verbose                                   [Optional] Get verbose messages from parser
    -h, --help                                  output usage information
```

## .lu File Format
.lu files contain markdown-like, simple text based definitions for [LUIS](http://luis.ai) or [QnAmaker.ai](http://qnamaker.ai) concepts. 

### Intent
An intent represents an action the user wants to perform. The intent is a purpose or goal expressed in a user's input, such as booking a flight, paying a bill, or finding a news article. You define and name intents that correspond to these actions. A travel app may define an intent named "BookFlight."

Here's a simple .lu file that captures a simple 'Greeting' intent with a list of example utterances that capture ways users can express this intent. You can use - or + or * to denote lists. Numbered lists are not supported.

```markdown
# Greeting
- Hi
- Hello
- Good morning
- Good evening
```

'#\<intent-name\>' describes a new intent definition section. Each line after the intent definition are example utterances that describe that intent.

You can stitch together multiple intent definitions in a single file like this:

```markdown
# Greeting
- Hi
- Hello
- Good morning
- Good evening

# Help
- help
- I need help
- please help
```
Each section is idenfied by #\<intent name\> notation. Blank lines are skipped when parsing the file.

### Entity
An entity represents detailed information that is relevant in the utterance. For example, in the utterance "Book a ticket to Paris", "Paris" is a location. 

|Sample user utterance|entity|
|--------------------------|----------|
|"Book a flight to **Seattle**?"|Seattle|
|"When does your store **open**?"|open|
|"Schedule a meeting at **1pm** with **Bob** in Distribution"|1pm, Bob|

Entity in .lu file is denoted using {\<entityName\>=\<labelled value\>} notation. Here's an example: 

```markdown
# CreateAlarm
- book a flight to {toCity=seattle}
- book a flight from {fromCity=new york} to {toCity=seattle}
```

LUDown tool supports the following [LUIS entity types](https://docs.microsoft.com/en-us/azure/cognitive-services/LUIS/luis-concept-entity-types)
- Prebuilt ("datetimeV2", "age", "dimension", "email", "money", "number", "ordinal", "percentage", "phoneNumber","temperature", "url")
- List
- Simple

LUDown tool **does not** support the following LUIS entity types:
- Regular expression
- Hierarchical
- Composite

You can define: 
- [Simple](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-quickstart-primary-and-secondary-data) entities by using $\<entityName\>:simple notation. Note that the parser defaults to simple entity type.
- [PREBUILT](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/pre-builtentities) entities by using $PREBUILT:\<entityType\> notation. 
- [List](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-quickstart-intent-and-list-entity) entities by using $\<entityName\>:\<CanonicalValue\>**=**<List of values> notation.

Here's an example: 

```markdown
# CreateAlarm
- create an alarm for {alarmTime=7AM}
- set an alarm for {alarmTime=7AM}

$alarmTime:Simple
```
Pre-built entities only need to be defined once and are applicable to your entire application. Here's an example: 
```markdown 
# Add
- 1 + 1

> 1's in the "1 + 1" utterance will automatically be picked up as numbers by LUIS
$PREBUILT:number 

# BookTable
- book a table for tomorrow
- book a table for 3pm
- book a table for next thursday 4pm

> all date or time or date and time in utterances will automatically be picked by LUIS as datetime values
$PREBUILT:datetimeV2
```

You can describe list entites using the following notation:
$listEntity:\<normalized-value\>=
    - \<synonym1\>
    - \<synonym2\>

Here's an example definition of a list entity: 

```markdown
$commPreference:call=
	- phone call
	- give me a ring
	- ring
	- call
	- cell phone
	- phone
$commPreference:text=
	- message
	- text
	- sms
	- text message
```

### Phrase List features

You can enhance LUIS understanding of your model using [PhraseLists](https://docs.microsoft.com/en-us/azure/cognitive-services/LUIS/luis-tutorial-interchangeable-phrase-list).

You can describe Phrase List entities using the following notation:
$\<entityName\>:PhraseList[!interchangeable]
    - \<synonym1\>
    - \<synonym2\>

Here's an example of a phrase list definition:

```markdown
$Want:PhraseList
    - require, need, desire, know

> You can also break up the phrase list values into an actual list

$Want:PhraseList
    - require
	- need
	- desire
	- know
```
By default synonyms are set to be **not interchangeable** (matches with the portal experience). You can optionally set the synonyms to be **interchangeable** as part of the definition. Here's an example:

```markdown
$question:PhraseList interchangeable
    - are you
    - you are
```

### Patterns
Patterns are a new feature in LUIS that allows you to define a set of rules that augment the machine learned model. You can define patterns in the .lu file simply by defining an entity in an utterance without a labelled value. 

As an example, this would be treated as a pattern with alarmTime set as a Pattern.Any entity type:
```markdown
# DeleteAlarm
- delete the {alarmTime} alarm
``` 
This example would be treated as an utterance since it has a labelled value with 7AM being the labelled value for entity alarmTime:
```markdown
# DeleteAlarm
- delete the {alarmTime=7AM} alarm
```

Note: By default any entity that is left undescribed in a pattern will be mapped to Pattern.Any entity type.

### Question and Answer pairs
.lu file (and the parser) supports question and answer definitions as well. You can this notation to describe them:

\# ? Question
\[list of question variations]
```markdown
	Answer
```

Here's an example of question and answer definitions. The LUDown tool will automatically separate question and answers into a qnamaker JSON file that you can then use to create your new [QnaMaker.ai](http://qnamaker.ai) knowledge base article.

```markdown
> # QnA Definitions
> 
### ? who is the ceo?
	```markdown
	You can change the default message if you use the QnAMakerDialog. 
	See [this link](https://docs.botframework.com/en-us/azure-bot-service/templates/qnamaker/#navtitle) for details. 
	```

### ? How do I programmatically update my KB?
	```markdown
	You can use our REST apis to manage your KB. 
	\#1. See here for details: https://westus.dev.cognitive.microsoft.com/docs/services/58994a073d9e04097c7ba6fe/operations/58994a073d9e041ad42d9baa
	```
```

You can add multiple questions to the same answer by simply additing variations to questions:

```markdown
### ? Who is your ceo?
- get me your ceo info
	```markdown
		Vishwac
	```
```

### External references
Two different references are supported in the .lu file. These follow Markdown link syntax.
- Reference to another .lu file via `\[link name](\<.lu file name\>)`. Reference can be an absolute path or a relative path from the containing .lu file.
- Reference to URL for QnAMaker to ingest during KB creation via `\[link name](\<URL\>)`

Here's an example of those references: 

```markdown
[QnaURL](https://docs.microsoft.com/en-in/azure/cognitive-services/qnamaker/faqs)

[none intent definition](./none.lu)
```
### Filters
Filters in QnA Maker are simple key value pairs that can be used to narrow search results, boost answers and store context. You can add filters using the following notation: 
```markdown
***Filters:***
- name = value
- name = value 
```

Here's an example usage: 
```markdown
### ? Where can I get coffee? 
- I need coffee

**Filters:**
- location = seattle

    ```markdown
    You can get coffee in our Seattle store at 1 pike place, Seattle, WA
    ```

### ? Where can I get coffee? 
- I need coffee

**Filters:**
- location = portland

    ```markdown
    You can get coffee in our Portland store at 52 marine drive, Portland, OR
    ```
```
### Adding comments
You can add comments to your .lu document by prefixing the comment with >. Here's an example: 

```markdown
> This is a comment and will be ignored

# Greeting
- hi
- hello
```

Checkout the [examples](https://github.com/Microsoft/botbuilder-tools/tree/master/ludown/Examples) folder for additional example .lu files.

## Consuming Output of LUDown Tool
Once you have run LUDown, you can use the resulting JSON files in several ways: 
- Using command line tools like luis.exe, qna.exe
- Using the LUIS and QnA maker portals

### Creating a New LUIS App
#### using command line 
```bash
luis import application --in _LUISApp.json --authoringKey ""
```
Note: You can install LUIS CLI from [here](https://github.com/Microsoft/botbuilder-tools/tree/master/LUIS). If you are using LUIS CLI, you might see the option to provide a versionId, application name directly in the LUIS CLI. You can also provide this information to the Ludown tool to generate your LUIS JSON model as well. Information explicitly spcified in the LUIS CLI will override any information captured by Ludown tool. 

#### using [LUIS](http://luis.ai) portal
- Navigate to [LUIS](http://luis.ai)
- Sign in
- Click on My apps
- "Import new App"
- Choose file -> select the _LUISApp.json generated by LUDown tool

#### Creating and adding batch tests to [LUIS](http://luis.ai) app
You can create the input JSON for [batch testing](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-concept-batch-test) in LUIS using:

```bash
ludown parse ToLuis --write_luis_batch_tests --in <.lufile>
```
This command will write out a _LUISBatchTest.json file

You can then import this to batch testing by following these steps
- Navigate to [LUIS](http://luis.ai)
- Sign in
- Click on My apps
- Open the LUIS app you wish to add this as batch test input
- Click on Test (top right corner)
- Click on 'Batch testing panel'
- Click on 'Import dataset'
- Click on 'Choose File' and provide the _LUISBatchTest.json file that was generated by ludown tool
- Give a name for the dataset
- Click Done

### Creating a new QnAMaker KB
#### using command line
```bash
qnamaker create --in _qnaKB.json
```
#### using [QnAMaker.ai](http://qnamaker.ai) portal
- Naviagate to [QnAMaker](http://qnamaker.ai)
- Sign in
- Create a new service with just the name and no other attributes
- Once the service is created, click on 'Replace Knowledge Base'
- Select _qnaJSON.json that was generated by LUDown

### Exporting LUIS model (for ludown refresh command)
#### Using CLI
```bash
luis export version --appId <string> --versionId <string>
```
#### using [LUIS](http://luis.ai) portal
- Navigate to [LUIS](http://luis.ai)
- Sign in
- Click on My apps
- Find the app you wish to download, click "..." -> Export app

### Exporting QnA Maker 
#### using CLI
```bash
qnamaker get --kbid ""
```
#### using [QnAMaker.ai](http://qnamaker.ai) portal
- Naviagate to [QnAMaker](http://qnamaker.ai)
- Sign in
- Select the Knowledgebase you want to export -> click on the pen icon to edit 
- Click on "Download Knowledge Base" 
