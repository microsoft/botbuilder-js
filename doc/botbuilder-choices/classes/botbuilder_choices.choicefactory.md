[Bot Builder SDK - Choices](../README.md) > [ChoiceFactory](../classes/botbuilder_choices.choicefactory.md)



# Class: ChoiceFactory


:package: **botbuilder-choices**

A set of utility functions to assist with the formatting a 'message' activity containing a list of choices.

**Usage Example**

    const { ChoiceFactory } = require('botbuilder-choices');

    const message = ChoiceFactory.forChannel(context, ['red', 'green', 'blue'], `Pick a color.`);
    await context.sendActivity(message);

## Index

### Methods

* [forChannel](botbuilder_choices.choicefactory.md#forchannel)
* [inline](botbuilder_choices.choicefactory.md#inline)
* [list](botbuilder_choices.choicefactory.md#list)
* [suggestedAction](botbuilder_choices.choicefactory.md#suggestedaction)
* [toChoices](botbuilder_choices.choicefactory.md#tochoices)



---
## Methods
<a id="forchannel"></a>

### «Static» forChannel

► **forChannel**(channelOrContext: *`string`⎮`TurnContext`*, choices: *(`string`⎮[Choice](../interfaces/botbuilder_choices.choice.md))[]*, text?: *`string`*, speak?: *`string`*, options?: *[ChoiceFactoryOptions](../interfaces/botbuilder_choices.choicefactoryoptions.md)*): `Partial`.<`Activity`>



*Defined in [libraries/botbuilder-choices/lib/choiceFactory.d.ts:79](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/choiceFactory.d.ts#L79)*



Returns a 'message' activity containing a list of choices that has been automatically formatted based on the capabilities of a given channel. The algorithm prefers to format the supplied list of choices as suggested actions but can decide to use a text based list if suggested actions aren't natively supported by the channel, there are too many choices for the channel to display, or the title of any choice is too long.

If the algorithm decides to use a list it will use an inline list if there are 3 or less choices and all have short titles. Otherwise, a numbered list is used.

**Usage Example**

    const message = ChoiceFactory.forChannel(context, [
       { value: 'red', action: { type: 'imBack', title: 'The Red Pill', value: 'red pill' } },
       { value: 'blue', action: { type: 'imBack', title: 'The Blue Pill', value: 'blue pill' } },
    ], `Which do you choose?`);
    await context.sendActivity(message);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| channelOrContext | `string`⎮`TurnContext`   |  Channel ID or context object for the current turn of conversation. |
| choices | (`string`⎮[Choice](../interfaces/botbuilder_choices.choice.md))[]   |  List of choices to render. |
| text | `string`   |  (Optional) text of the message. |
| speak | `string`   |  (Optional) SSML to speak for the message. |
| options | [ChoiceFactoryOptions](../interfaces/botbuilder_choices.choicefactoryoptions.md)   |  (Optional) formatting options to use when rendering as a list. |





**Returns:** `Partial`.<`Activity`>





___

<a id="inline"></a>

### «Static» inline

► **inline**(choices: *(`string`⎮[Choice](../interfaces/botbuilder_choices.choice.md))[]*, text?: *`string`*, speak?: *`string`*, options?: *[ChoiceFactoryOptions](../interfaces/botbuilder_choices.choicefactoryoptions.md)*): `Partial`.<`Activity`>



*Defined in [libraries/botbuilder-choices/lib/choiceFactory.d.ts:96](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/choiceFactory.d.ts#L96)*



Returns a 'message' activity containing a list of choices that has been formatted as an inline list.

**Usage Example**

    // Generates a message text of `Pick a color: (1\. red, 2\. green, or 3\. blue)`
    const message = ChoiceFactory.inline(['red', 'green', 'blue'], `Pick a color:`);
    await context.sendActivity(message);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| choices | (`string`⎮[Choice](../interfaces/botbuilder_choices.choice.md))[]   |  List of choices to render. |
| text | `string`   |  (Optional) text of the message. |
| speak | `string`   |  (Optional) SSML to speak for the message. |
| options | [ChoiceFactoryOptions](../interfaces/botbuilder_choices.choicefactoryoptions.md)   |  (Optional) formatting options to tweak rendering of list. |





**Returns:** `Partial`.<`Activity`>





___

<a id="list"></a>

### «Static» list

► **list**(choices: *(`string`⎮[Choice](../interfaces/botbuilder_choices.choice.md))[]*, text?: *`string`*, speak?: *`string`*, options?: *[ChoiceFactoryOptions](../interfaces/botbuilder_choices.choicefactoryoptions.md)*): `Partial`.<`Activity`>



*Defined in [libraries/botbuilder-choices/lib/choiceFactory.d.ts:112](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/choiceFactory.d.ts#L112)*



Returns a 'message' activity containing a list of choices that has been formatted as an numbered or bulleted list.

**Usage Example**

    const message = ChoiceFactory.list(['red', 'green', 'blue'], `Pick a color:`);
    await context.sendActivity(message);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| choices | (`string`⎮[Choice](../interfaces/botbuilder_choices.choice.md))[]   |  List of choices to render. |
| text | `string`   |  (Optional) text of the message. |
| speak | `string`   |  (Optional) SSML to speak for the message. |
| options | [ChoiceFactoryOptions](../interfaces/botbuilder_choices.choicefactoryoptions.md)   |  (Optional) formatting options to tweak rendering of list. |





**Returns:** `Partial`.<`Activity`>





___

<a id="suggestedaction"></a>

### «Static» suggestedAction

► **suggestedAction**(choices: *(`string`⎮[Choice](../interfaces/botbuilder_choices.choice.md))[]*, text?: *`string`*, speak?: *`string`*): `Partial`.<`Activity`>



*Defined in [libraries/botbuilder-choices/lib/choiceFactory.d.ts:127](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/choiceFactory.d.ts#L127)*



Returns a 'message' activity containing a list of choices that have been added as suggested actions.

**Usage Example**

    const message = ChoiceFactory.suggestedAction(['red', 'green', 'blue'], `Pick a color:`);
    await context.sendActivity(message);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| choices | (`string`⎮[Choice](../interfaces/botbuilder_choices.choice.md))[]   |  List of choices to add. |
| text | `string`   |  (Optional) text of the message. |
| speak | `string`   |  (Optional) SSML to speak for the message. |





**Returns:** `Partial`.<`Activity`>





___

<a id="tochoices"></a>

### «Static» toChoices

► **toChoices**(choices: *(`string`⎮[Choice](../interfaces/botbuilder_choices.choice.md))[]⎮`undefined`*): [Choice](../interfaces/botbuilder_choices.choice.md)[]



*Defined in [libraries/botbuilder-choices/lib/choiceFactory.d.ts:138](https://github.com/Microsoft/botbuilder-js/blob/fbf16f5/libraries/botbuilder-choices/lib/choiceFactory.d.ts#L138)*



Takes a mixed list of `string` and `Choice` based choices and returns them as a `Choice[]`.

**Usage Example**

    const choices = ChoiceFactory.toChoices(['red', 'green', 'blue']);


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| choices | (`string`⎮[Choice](../interfaces/botbuilder_choices.choice.md))[]⎮`undefined`   |  List of choices to add. |





**Returns:** [Choice](../interfaces/botbuilder_choices.choice.md)[]





___


