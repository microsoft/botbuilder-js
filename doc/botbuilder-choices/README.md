


#  botbuilder-choices


## Index

### Classes

* [ChoiceStyler](classes/botbuilder_choices.choicestyler.md)


### Interfaces

* [Choice](interfaces/botbuilder_choices.choice.md)
* [ChoiceStylerOptions](interfaces/botbuilder_choices.choicestyleroptions.md)
* [FindChoicesOptions](interfaces/botbuilder_choices.findchoicesoptions.md)
* [FindValuesOptions](interfaces/botbuilder_choices.findvaluesoptions.md)
* [FoundChoice](interfaces/botbuilder_choices.foundchoice.md)
* [FoundValue](interfaces/botbuilder_choices.foundvalue.md)
* [ModelResult](interfaces/botbuilder_choices.modelresult.md)
* [SortedValue](interfaces/botbuilder_choices.sortedvalue.md)


### Functions

* [findChoices](#findchoices)
* [findValues](#findvalues)
* [recognizeChoices](#recognizechoices)



---
## Functions
<a id="findchoices"></a>

###  findChoices

► **findChoices**(utterance: *`string`*, choices: *(`string`⎮[Choice](interfaces/botbuilder_choices.choice.md))[]*, options?: *[FindChoicesOptions](interfaces/botbuilder_choices.findchoicesoptions.md)*): [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundChoice](interfaces/botbuilder_choices.foundchoice.md)[]



*Defined in [libraries/botbuilder-choices/lib/findChoices.d.ts:44](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-choices/lib/findChoices.d.ts#L44)*



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



*Defined in [libraries/botbuilder-choices/lib/findValues.d.ts:54](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-choices/lib/findValues.d.ts#L54)*



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



*Defined in [libraries/botbuilder-choices/lib/recognizeChoices.d.ts:7](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-choices/lib/recognizeChoices.d.ts#L7)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| utterance | `string`   |  - |
| choices | (`string`⎮[Choice](interfaces/botbuilder_choices.choice.md))[]   |  - |
| options | [FindChoicesOptions](interfaces/botbuilder_choices.findchoicesoptions.md)   |  - |





**Returns:** [ModelResult](interfaces/botbuilder_choices.modelresult.md)[FoundChoice](interfaces/botbuilder_choices.foundchoice.md)[]





___


