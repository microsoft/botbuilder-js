[Bot Builder SDK - AI](../README.md) > [QnAMakerSettings](../interfaces/botbuilder_ai.qnamakersettings.md)



# Interface: QnAMakerSettings


## Properties
<a id="answerbeforenext"></a>

### «Optional» answerBeforeNext

**●  answerBeforeNext**:  *`boolean`* 

*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:37](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L37)*



(Optional) and only applied when a QnAMaker instance has been added to ths adapter as middleware. Defaults to a value of `false`.

Setting this to `true` will cause the QnA Maker service to be called BEFORE any other middleware or the bots logic is run. Should the service return an answer the user will be automatically sent the answer and the turn completed such that no other middleware or the bots logic will be run.

The default behavior is to only call the service AFTER all other middleware and the bots logic has run, and only under the condition that no other replies have been sent by the bot yet for this turn.




___

<a id="knowledgebaseid"></a>

###  knowledgeBaseId

**●  knowledgeBaseId**:  *`string`* 

*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:15](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L15)*



ID of your knowledge base.




___

<a id="scorethreshold"></a>

### «Optional» scoreThreshold

**●  scoreThreshold**:  *`number`* 

*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:19](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L19)*



(Optional) minimum score accepted. Defaults to "0.3".




___

<a id="serviceendpoint"></a>

### «Optional» serviceEndpoint

**●  serviceEndpoint**:  *`string`* 

*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:21](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L21)*



(Optional) service endpoint. Defaults to "[https://westus.api.cognitive.microsoft.com/](https://westus.api.cognitive.microsoft.com/)"




___

<a id="subscriptionkey"></a>

###  subscriptionKey

**●  subscriptionKey**:  *`string`* 

*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:17](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L17)*



Your subscription keys.




___

<a id="top"></a>

### «Optional» top

**●  top**:  *`number`* 

*Defined in [libraries/botbuilder-ai/lib/qnaMaker.d.ts:23](https://github.com/Microsoft/botbuilder-js/blob/68b6da0/libraries/botbuilder-ai/lib/qnaMaker.d.ts#L23)*



(Optional) number of results to return. Defaults to "1".




___


