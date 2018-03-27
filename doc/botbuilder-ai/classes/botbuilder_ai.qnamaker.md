[Bot Builder SDK - AI](../README.md) > [QnAMaker](../classes/botbuilder_ai.qnamaker.md)



# Class: QnAMaker

## Implements

* `any`

## Index

### Constructors

* [constructor](botbuilder_ai.qnamaker.md#constructor)


### Methods

* [answer](botbuilder_ai.qnamaker.md#answer)
* [callService](botbuilder_ai.qnamaker.md#callservice)
* [generateAnswer](botbuilder_ai.qnamaker.md#generateanswer)
* [onProcessRequest](botbuilder_ai.qnamaker.md#onprocessrequest)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new QnAMaker**(settings: *[QnAMakerSettings](../interfaces/botbuilder_ai.qnamakersettings.md)*): [QnAMaker](botbuilder_ai.qnamaker.md)


*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:40](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L40)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| settings | [QnAMakerSettings](../interfaces/botbuilder_ai.qnamakersettings.md)   |  - |





**Returns:** [QnAMaker](botbuilder_ai.qnamaker.md)

---


## Methods
<a id="answer"></a>

###  answer

► **answer**(context: *`BotContext`*): `Promise`.<`boolean`>



*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:49](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L49)*



Calls [generateAnswer()](#generateanswer) and sends the answer as a message ot the user. Returns a value of `true` if an answer was found and sent. If multiple answers are returned the first one will be delivered.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  Context for the current turn of conversation with the use. |





**Returns:** `Promise`.<`boolean`>





___

<a id="callservice"></a>

### «Protected» callService

► **callService**(serviceEndpoint: *`string`*, question: *`string`*, top: *`number`*): `Promise`.<[QnAMakerResult](../interfaces/botbuilder_ai.qnamakerresult.md)[]>



*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:58](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L58)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| serviceEndpoint | `string`   |  - |
| question | `string`   |  - |
| top | `number`   |  - |





**Returns:** `Promise`.<[QnAMakerResult](../interfaces/botbuilder_ai.qnamakerresult.md)[]>





___

<a id="generateanswer"></a>

###  generateAnswer

► **generateAnswer**(question: *`string`*, top?: *`number`*, scoreThreshold?: *`number`*): `Promise`.<[QnAMakerResult](../interfaces/botbuilder_ai.qnamakerresult.md)[]>



*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:57](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L57)*



Calls the QnA Maker service to generate answer(s) for a question. The returned answers will be sorted by score with the top scoring answer returned first.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| question | `string`   |  The question to answer. |
| top | `number`   |  (Optional) number of answers to return. Defaults to a value of `1`. |
| scoreThreshold | `number`   |  (Optional) minimum answer score needed to be considered a match to questions. Defaults to a value of `0.0`. |





**Returns:** `Promise`.<[QnAMakerResult](../interfaces/botbuilder_ai.qnamakerresult.md)[]>





___

<a id="onprocessrequest"></a>

###  onProcessRequest

► **onProcessRequest**(context: *`BotContext`*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:42](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L42)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___


