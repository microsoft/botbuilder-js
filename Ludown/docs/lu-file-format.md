# .lu File Format
.lu files contain markdown-like, simple text based definitions for [LUIS](http://luis.ai) or [QnAmaker.ai](http://qnamaker.ai) concepts. 

## Intent
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

## Entity
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
- Prebuilt ("datetimeV2", "age", "dimension", "email", "money", "number", "ordinal", "percentage", "phoneNumber","temperature", "url", "datetime", "keyPhrase")
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

## Phrase List features

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

## Patterns
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

## Question and Answer pairs
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

## External references
Two different references are supported in the .lu file. These follow Markdown link syntax.
- Reference to another .lu file via `\[link name](\<.lu file name\>)`. Reference can be an absolute path or a relative path from the containing .lu file.
- Reference to URL for QnAMaker to ingest during KB creation via `\[link name](\<URL\>)`

Here's an example of those references: 

```markdown
[QnaURL](https://docs.microsoft.com/en-in/azure/cognitive-services/qnamaker/faqs)

[none intent definition](./none.lu)
```
## QnAMaker Filters
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
## Adding comments
You can add comments to your .lu document by prefixing the comment with >. Here's an example: 

```markdown
> This is a comment and will be ignored

# Greeting
- hi
- hello
```
