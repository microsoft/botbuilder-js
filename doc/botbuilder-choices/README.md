


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

*Defined in [libraries/botbuilder-choices/lib/tokenizer.d.ts:14](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-choices/lib/tokenizer.d.ts#L14)*


#### Type declaration
►(text: *`string`*, locale?: *`undefined`⎮`string`*): [Token](interfaces/botbuilder_choices.token.md)[]



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| text | `string`   |  - |
| locale | `undefined`⎮`string`   |  - |





**Returns:** [Token](interfaces/botbuilder_choices.token.md)[]






___


## Functions
<a id="defaulttokenizer"></a>

###  defaultTokenizer

► **defaultTokenizer**(text: *`string`*, locale?: *`undefined`⎮`string`*): [Token](interfaces/botbuilder_choices.token.md)[]



*Defined in [libraries/botbuilder-choices/lib/tokenizer.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-choices/lib/tokenizer.d.ts#L19)*



Simple tokenizer that breaks on spaces and punctuation. The only normalization done is to lowercase


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| text | `string`   |  - |
| locale | `undefined`⎮`string`   |  - |





**Returns:** [Token](interfaces/botbuilder_choices.token.md)[]





___

<a id="findchoices"></a>

###  findChoices

► **findChoices**(utterance: *`string`*, choices: *(`string`⎮[Choice](interfaces/botbuilder_choices.choice.md))[]*, options?: *[FindChoicesOptions](interfaces/botbuilder_choices.findchoicesoptions.md)*): [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundChoice](interfaces/botbuilder_choices.foundchoice.md)[]



*Defined in [libraries/botbuilder-choices/lib/findChoices.d.ts:47](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-choices/lib/findChoices.d.ts#L47)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| utterance | `string`   |  - |
| choices | (`string`⎮[Choice](interfaces/botbuilder_choices.choice.md))[]   |  - |
| options | [FindChoicesOptions](interfaces/botbuilder_choices.findchoicesoptions.md)   |  - |





**Returns:** [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundChoice](interfaces/botbuilder_choices.foundchoice.md)[]





___

<a id="findvalues"></a>

###  findValues

► **findValues**(utterance: *`string`*, values: *[SortedValue](interfaces/botbuilder_choices.sortedvalue.md)[]*, options?: *[FindValuesOptions](interfaces/botbuilder_choices.findvaluesoptions.md)*): [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundValue](interfaces/botbuilder_choices.foundvalue.md)[]



*Defined in [libraries/botbuilder-choices/lib/findValues.d.ts:57](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-choices/lib/findValues.d.ts#L57)*



Looks for a set of values within an utterance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| utterance | `string`   |  - |
| values | [SortedValue](interfaces/botbuilder_choices.sortedvalue.md)[]   |  - |
| options | [FindValuesOptions](interfaces/botbuilder_choices.findvaluesoptions.md)   |  - |





**Returns:** [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundValue](interfaces/botbuilder_choices.foundvalue.md)[]





___

<a id="recognizechoices"></a>

###  recognizeChoices

► **recognizeChoices**(utterance: *`string`*, choices: *(`string`⎮[Choice](interfaces/botbuilder_choices.choice.md))[]*, options?: *[FindChoicesOptions](interfaces/botbuilder_choices.findchoicesoptions.md)*): [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundChoice](interfaces/botbuilder_choices.foundchoice.md)[]



*Defined in [libraries/botbuilder-choices/lib/recognizeChoices.d.ts:10](https://github.com/Microsoft/botbuilder-js/blob/09ad751/libraries/botbuilder-choices/lib/recognizeChoices.d.ts#L10)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| utterance | `string`   |  - |
| choices | (`string`⎮[Choice](interfaces/botbuilder_choices.choice.md))[]   |  - |
| options | [FindChoicesOptions](interfaces/botbuilder_choices.findchoicesoptions.md)   |  - |





**Returns:** [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundChoice](interfaces/botbuilder_choices.foundchoice.md)[]





___


