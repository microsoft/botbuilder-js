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


*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:40](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L40)*



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



*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:43](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L43)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |





**Returns:** `Promise`.<`boolean`>





___

<a id="callservice"></a>

### «Protected» callService

► **callService**(serviceEndpoint: *`string`*, question: *`string`*, top: *`number`*): `Promise`.<[QnAMakerResult](../interfaces/botbuilder_ai.qnamakerresult.md)[]>



*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:45](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L45)*



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



*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:44](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L44)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| question | `string`   |  - |
| top | `number`   |  - |
| scoreThreshold | `number`   |  - |





**Returns:** `Promise`.<[QnAMakerResult](../interfaces/botbuilder_ai.qnamakerresult.md)[]>





___

<a id="onprocessrequest"></a>

###  onProcessRequest

► **onProcessRequest**(context: *`BotContext`*, next: *`function`*): `Promise`.<`void`>



*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:42](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L42)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | `BotContext`   |  - |
| next | `function`   |  - |





**Returns:** `Promise`.<`void`>





___


