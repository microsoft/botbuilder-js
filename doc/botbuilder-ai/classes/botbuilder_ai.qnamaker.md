[Bot Builder SDK - AI](../README.md) > [QnAMaker](../classes/botbuilder_ai.qnamaker.md)



# Class: QnAMaker

## Index

### Constructors

* [constructor](botbuilder_ai.qnamaker.md#constructor)


### Methods

* [getAnswers](botbuilder_ai.qnamaker.md#getanswers)
* [routeTo](botbuilder_ai.qnamaker.md#routeto)



---
## Constructors
<a id="constructor"></a>


### ⊕ **new QnAMaker**(options: *[QnAMakerOptions](../interfaces/botbuilder_ai.qnamakeroptions.md)*): [QnAMaker](botbuilder_ai.qnamaker.md)


*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:22](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L22)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| options | [QnAMakerOptions](../interfaces/botbuilder_ai.qnamakeroptions.md)   |  - |





**Returns:** [QnAMaker](botbuilder_ai.qnamaker.md)

---


## Methods
<a id="getanswers"></a>

###  getAnswers

► **getAnswers**(question: *`string`*): `Promise`.<[QnAMakerResult](../interfaces/botbuilder_ai.qnamakerresult.md)[]>



*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:24](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L24)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| question | `string`   |  - |





**Returns:** `Promise`.<[QnAMakerResult](../interfaces/botbuilder_ai.qnamakerresult.md)[]>





___

<a id="routeto"></a>

###  routeTo

► **routeTo**(context: *[BotContext]()*): `Promise`.<`boolean`>



*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:29](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L29)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| context | [BotContext]()   |  - |





**Returns:** `Promise`.<`boolean`>





___


