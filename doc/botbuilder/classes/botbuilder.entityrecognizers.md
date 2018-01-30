[Bot Builder SDK - Core](../README.md) > [EntityRecognizers](../classes/botbuilder.entityrecognizers.md)



# Class: EntityRecognizers


A set of utility functions to simplify the recognition of entities within a users utterance.

## Index

### Properties

* [numOrdinals](botbuilder.entityrecognizers.md#numordinals)


### Methods

* [coverageScore](botbuilder.entityrecognizers.md#coveragescore)
* [findTopEntity](botbuilder.entityrecognizers.md#findtopentity)
* [recognizeBooleans](botbuilder.entityrecognizers.md#recognizebooleans)
* [recognizeChoices](botbuilder.entityrecognizers.md#recognizechoices)
* [recognizeLocalizedChoices](botbuilder.entityrecognizers.md#recognizelocalizedchoices)
* [recognizeLocalizedRegExp](botbuilder.entityrecognizers.md#recognizelocalizedregexp)
* [recognizeNumbers](botbuilder.entityrecognizers.md#recognizenumbers)
* [recognizeOrdinals](botbuilder.entityrecognizers.md#recognizeordinals)
* [recognizeValues](botbuilder.entityrecognizers.md#recognizevalues)
* [toChoices](botbuilder.entityrecognizers.md#tochoices)



---
## Properties
<a id="numordinals"></a>

### «Static» numOrdinals

**●  numOrdinals**:  *`object`* 

*Defined in [libraries/botbuilder/lib/entityRecognizers.d.ts:59](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/entityRecognizers.d.ts#L59)*


#### Type declaration


[locale: `string`]: `string`[][]






___


## Methods
<a id="coveragescore"></a>

### «Static» coverageScore

► **coverageScore**(utterance: *`string`*, entity: *`string`*, min?: *`undefined`⎮`number`*): `number`



*Defined in [libraries/botbuilder/lib/entityRecognizers.d.ts:114](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/entityRecognizers.d.ts#L114)*



Calculates the coverage score for a recognized entity.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| utterance | `string`   |  - |
| entity | `string`   |  - |
| min | `undefined`⎮`number`   |  - |





**Returns:** `number`





___

<a id="findtopentity"></a>

### «Static» findTopEntity

► **findTopEntity**T(entities: *[EntityObject](../interfaces/botbuilder.entityobject.md)`T`[]*): [EntityObject](../interfaces/botbuilder.entityobject.md)`T`⎮`undefined`



*Defined in [libraries/botbuilder/lib/entityRecognizers.d.ts:112](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/entityRecognizers.d.ts#L112)*



Returns the entity with the highest score.


**Type parameters:**

#### T 
**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| entities | [EntityObject](../interfaces/botbuilder.entityobject.md)`T`[]   |  List of entities to filter. |





**Returns:** [EntityObject](../interfaces/botbuilder.entityobject.md)`T`⎮`undefined`





___

<a id="recognizebooleans"></a>

### «Static» recognizeBooleans

► **recognizeBooleans**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*): [EntityObject](../interfaces/botbuilder.entityobject.md)`boolean`[]



*Defined in [libraries/botbuilder/lib/entityRecognizers.d.ts:75](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/entityRecognizers.d.ts#L75)*



Recognizes any true/false or yes/no expressions in an utterance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  Context for the current turn of the conversation. |





**Returns:** [EntityObject](../interfaces/botbuilder.entityobject.md)`boolean`[]





___

<a id="recognizechoices"></a>

### «Static» recognizeChoices

► **recognizeChoices**(utterance: *`string`*, choices: *[Choice](../interfaces/botbuilder.choice.md)[]*, options?: *[RecognizeChoicesOptions](../interfaces/botbuilder.recognizechoicesoptions.md)*): [EntityObject](../interfaces/botbuilder.entityobject.md)`string`[]



*Defined in [libraries/botbuilder/lib/entityRecognizers.d.ts:97](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/entityRecognizers.d.ts#L97)*



Recognizes a set of choices (including synonyms) in an utterance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| utterance | `string`   |  - |
| choices | [Choice](../interfaces/botbuilder.choice.md)[]   |  Array of choices to match against. |
| options | [RecognizeChoicesOptions](../interfaces/botbuilder.recognizechoicesoptions.md)   |  (Optional) additional options to customize the recognition. |





**Returns:** [EntityObject](../interfaces/botbuilder.entityobject.md)`string`[]





___

<a id="recognizelocalizedchoices"></a>

### «Static» recognizeLocalizedChoices

► **recognizeLocalizedChoices**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, listId: *`string`*, options?: *[RecognizeChoicesOptions](../interfaces/botbuilder.recognizechoicesoptions.md)*): [EntityObject](../interfaces/botbuilder.entityobject.md)`string`[]



*Defined in [libraries/botbuilder/lib/entityRecognizers.d.ts:63](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/entityRecognizers.d.ts#L63)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| listId | `string`   |  - |
| options | [RecognizeChoicesOptions](../interfaces/botbuilder.recognizechoicesoptions.md)   |  - |





**Returns:** [EntityObject](../interfaces/botbuilder.entityobject.md)`string`[]





___

<a id="recognizelocalizedregexp"></a>

### «Static» recognizeLocalizedRegExp

► **recognizeLocalizedRegExp**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, expId: *`string`*): [EntityObject](../interfaces/botbuilder.entityobject.md)`string`[]



*Defined in [libraries/botbuilder/lib/entityRecognizers.d.ts:62](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/entityRecognizers.d.ts#L62)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  - |
| expId | `string`   |  - |





**Returns:** [EntityObject](../interfaces/botbuilder.entityobject.md)`string`[]





___

<a id="recognizenumbers"></a>

### «Static» recognizeNumbers

► **recognizeNumbers**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*, options?: *[RecognizeNumbersOptions](../interfaces/botbuilder.recognizenumbersoptions.md)*): [EntityObject](../interfaces/botbuilder.entityobject.md)`number`[]



*Defined in [libraries/botbuilder/lib/entityRecognizers.d.ts:83](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/entityRecognizers.d.ts#L83)*



Recognizes any numbers mentioned in an utterance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  Context for the current turn of the conversation. |
| options | [RecognizeNumbersOptions](../interfaces/botbuilder.recognizenumbersoptions.md)   |  (Optional) additional options to restrict the range of valid numbers thatwill be recognized. |





**Returns:** [EntityObject](../interfaces/botbuilder.entityobject.md)`number`[]





___

<a id="recognizeordinals"></a>

### «Static» recognizeOrdinals

► **recognizeOrdinals**(context: *[BotContext](../interfaces/botbuilder.__global.botcontext.md)*): [EntityObject](../interfaces/botbuilder.entityobject.md)`number`[]



*Defined in [libraries/botbuilder/lib/entityRecognizers.d.ts:89](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/entityRecognizers.d.ts#L89)*



Recognizes any ordinals, like "the second one", mentioned in an utterance.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext](../interfaces/botbuilder.__global.botcontext.md)   |  Context for the current turn of the conversation. |





**Returns:** [EntityObject](../interfaces/botbuilder.entityobject.md)`number`[]





___

<a id="recognizevalues"></a>

### «Static» recognizeValues

► **recognizeValues**(utterance: *`string`*, values: *(`string`⎮`RegExp`)[]*, options?: *[RecognizeValuesOptions](../interfaces/botbuilder.recognizevaluesoptions.md)*): [EntityObject](../interfaces/botbuilder.entityobject.md)`number`[]



*Defined in [libraries/botbuilder/lib/entityRecognizers.d.ts:106](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/entityRecognizers.d.ts#L106)*



Recognizes a set of values mentioned in an utterance. The zero based index of the match is returned.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| utterance | `string`   |  - |
| values | (`string`⎮`RegExp`)[]   |  - |
| options | [RecognizeValuesOptions](../interfaces/botbuilder.recognizevaluesoptions.md)   |  (Optional) additional options to customize the recognition that's performed. |





**Returns:** [EntityObject](../interfaces/botbuilder.entityobject.md)`number`[]





___

<a id="tochoices"></a>

### «Static» toChoices

► **toChoices**(list: *`string`*): [Choice](../interfaces/botbuilder.choice.md)[]



*Defined in [libraries/botbuilder/lib/entityRecognizers.d.ts:69](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/entityRecognizers.d.ts#L69)*



Converts a list in "value1=synonym1,synonym2|value2" format to a `Choice` array.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| list | `string`   |  Formatted list of choices to convert. |





**Returns:** [Choice](../interfaces/botbuilder.choice.md)[]





___


