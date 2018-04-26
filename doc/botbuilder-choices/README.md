


#  botbuilder-choices


## Index

### Classes

* [ChoiceFactory](classes/botbuilder_choices.choicefactory.md)


### Interfaces

* [Choice](interfaces/botbuilder_choices.choice.md)
* [ChoiceFactoryOptions](interfaces/botbuilder_choices.choicefactoryoptions.md)
* [FindChoicesOptions](interfaces/botbuilder_choices.findchoicesoptions.md)
* [FindValuesOptions](interfaces/botbuilder_choices.findvaluesoptions.md)
* [FoundChoice](interfaces/botbuilder_choices.foundchoice.md)
* [FoundValue](interfaces/botbuilder_choices.foundvalue.md)
* [ModelResult](interfaces/botbuilder_choices.modelresult.md)
* [SortedValue](interfaces/botbuilder_choices.sortedvalue.md)
* [Token](interfaces/botbuilder_choices.token.md)


### Type aliases

* [TokenizerFunction](#tokenizerfunction)


### Functions

* [defaultTokenizer](#defaulttokenizer)
* [findChoices](#findchoices)
* [findValues](#findvalues)
* [recognizeChoices](#recognizechoices)



---
## Type aliases
<a id="tokenizerfunction"></a>

###  TokenizerFunction

**Τ TokenizerFunction**:  *`function`* 

*Defined in [libraries/botbuilder-choices/lib/tokenizer.d.ts:32](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/tokenizer.d.ts#L32)*



:package: **botbuilder-choices**

Signature for an alternate word breaker that can be passed to `recognizeChoices()`, `findChoices()`, or `findValues()`. The `defaultTokenizer()` is fairly simple and only breaks on spaces and punctuation.

#### Type declaration
►(text: *`string`*, locale?: *`string`*): [Token](interfaces/botbuilder_choices.token.md)[]



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| text | `string`   |  The text to be tokenized. |
| locale | `string`   |  (Optional) locale of the text if known. |





**Returns:** [Token](interfaces/botbuilder_choices.token.md)[]






___


## Functions
<a id="defaulttokenizer"></a>

###  defaultTokenizer

► **defaultTokenizer**(text: *`string`*, locale?: *`string`*): [Token](interfaces/botbuilder_choices.token.md)[]



*Defined in [libraries/botbuilder-choices/lib/tokenizer.d.ts:59](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/tokenizer.d.ts#L59)*



:package: **botbuilder-choices**

Simple tokenizer that breaks on spaces and punctuation. The only normalization done is to lowercase the tokens. Developers can wrap this tokenizer with their own function to perform additional normalization like [stemming](https://github.com/words/stemmer).

**Usage Example**

    const { recognizeChoices, defaultTokenizer } = require('botbuilder-choices');
    const stemmer = require('stemmer');

    function customTokenizer(text, locale) {
        const tokens = defaultTokenizer(text, locale);
        tokens.forEach((t) => {
            t.normalized = stemmer(t.normalized);
        });
        return tokens;
    }

    const choices = ['red', 'green', 'blue'];
    const utterance = context.activity.text;
    const results = recognizeChoices(utterance, choices, { tokenizer: customTokenizer });


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| text | `string`   |  - |
| locale | `string`   |  - |





**Returns:** [Token](interfaces/botbuilder_choices.token.md)[]





___

<a id="findchoices"></a>

###  findChoices

► **findChoices**(utterance: *`string`*, choices: *(`string`⎮[Choice](interfaces/botbuilder_choices.choice.md))[]*, options?: *[FindChoicesOptions](interfaces/botbuilder_choices.findchoicesoptions.md)*): [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundChoice](interfaces/botbuilder_choices.foundchoice.md)[]



*Defined in [libraries/botbuilder-choices/lib/findChoices.d.ts:122](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findChoices.d.ts#L122)*



:package: **botbuilder-choices**

Mid-level search function for recognizing a choice in an utterance. This function is layered above `findValues()` and simply determines all of the synonyms that should be searched for before calling `findValues()` to perform the actual search. The `recognizeChoices()` function is layered above this function and adds the ability to select a choice by index or ordinal position in the list. Calling this particular function is useful when you don't want the index and ordinal position recognition done by `recognizeChoices()`.

**Usage Example**

    const { findChoices } = require('botbuilder-choices');

    const choices = ['red', 'green', 'blue'];
    const utterance = context.activity.text;
    const results = findChoices(utterance, choices);
    if (results.length == 1) {
        await context.sendActivity(`I like ${results[0].resolution.value} too!`);
    } else if (results.length > 1) {
        const ambiguous = results.map((r) => r.resolution.value);
        await context.sendActivity(ChoiceFactory.forChannel(context, ambiguous, `Which one?`));
    } else {
        await context.sendActivity(ChoiceFactory.forChannel(context, choices, `I didn't get that... Which color?`));
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| utterance | `string`   |  The text or user utterance to search over. For an incoming 'message' activity you can simply use `context.activity.text`. |
| choices | (`string`⎮[Choice](interfaces/botbuilder_choices.choice.md))[]   |  List of choices to search over. |
| options | [FindChoicesOptions](interfaces/botbuilder_choices.findchoicesoptions.md)   |  (Optional) options used to tweak the search that's performed. |





**Returns:** [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundChoice](interfaces/botbuilder_choices.foundchoice.md)[]





___

<a id="findvalues"></a>

###  findValues

► **findValues**(utterance: *`string`*, values: *[SortedValue](interfaces/botbuilder_choices.sortedvalue.md)[]*, options?: *[FindValuesOptions](interfaces/botbuilder_choices.findvaluesoptions.md)*): [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundValue](interfaces/botbuilder_choices.foundvalue.md)[]



*Defined in [libraries/botbuilder-choices/lib/findValues.d.ts:83](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/findValues.d.ts#L83)*



:package: **botbuilder-choices**

INTERNAL: Low-level function that searches for a set of values within an utterance. Higher level functions like `findChoices()` and `recognizeChoices()` are layered above this function. In most cases its easier to just call one of the higher level functions instead but this function contains the fuzzy search algorithm that drives choice recognition.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| utterance | `string`   |  The text or user utterance to search over. |
| values | [SortedValue](interfaces/botbuilder_choices.sortedvalue.md)[]   |  List of values to search over. |
| options | [FindValuesOptions](interfaces/botbuilder_choices.findvaluesoptions.md)   |  (Optional) options used to tweak the search that's performed. |





**Returns:** [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundValue](interfaces/botbuilder_choices.foundvalue.md)[]





___

<a id="recognizechoices"></a>

###  recognizeChoices

► **recognizeChoices**(utterance: *`string`*, choices: *(`string`⎮[Choice](interfaces/botbuilder_choices.choice.md))[]*, options?: *[FindChoicesOptions](interfaces/botbuilder_choices.findchoicesoptions.md)*): [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundChoice](interfaces/botbuilder_choices.foundchoice.md)[]



*Defined in [libraries/botbuilder-choices/lib/recognizeChoices.d.ts:43](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/recognizeChoices.d.ts#L43)*



:package: **botbuilder-choices**

High level function for recognizing a choice in a users utterance. This is layered above the `findChoices()` function and adds logic to let the user specify their choice by index (they can say "one" to pick `choice[0]`) or ordinal position (they can say "the second one" to pick `choice[1]`.) The users utterance is recognized in the following order:

*   By name using `findChoices()`.
*   By 1's based ordinal position.
*   By 1's based index position.

**Usage Example**

    const { recognizeChoices } = require('botbuilder-choices');

    const choices = ['red', 'green', 'blue'];
    const utterance = context.activity.text;
    const results = recognizeChoices(utterance, choices);
    if (results.length == 1) {
        await context.sendActivity(`I like ${results[0].resolution.value} too!`);
    } else if (results.length > 1) {
        const ambiguous = results.map((r) => r.resolution.value);
        await context.sendActivity(ChoiceFactory.forChannel(context, ambiguous, `Which one?`));
    } else {
        await context.sendActivity(ChoiceFactory.forChannel(context, choices, `I didn't get that... Which color?`));
    }


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| utterance | `string`   |  The text or user utterance to search over. For an incoming 'message' activity you can simply use `context.activity.text`. |
| choices | (`string`⎮[Choice](interfaces/botbuilder_choices.choice.md))[]   |  List of choices to search over. |
| options | [FindChoicesOptions](interfaces/botbuilder_choices.findchoicesoptions.md)   |  (Optional) options used to tweak the search that's performed. |





**Returns:** [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundChoice](interfaces/botbuilder_choices.foundchoice.md)[]





___


