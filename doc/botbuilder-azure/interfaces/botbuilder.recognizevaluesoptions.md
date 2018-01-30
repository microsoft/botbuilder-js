[Bot Builder SDK - Azure](../README.md) > [botbuilder](../modules/botbuilder.md) > [RecognizeValuesOptions](../interfaces/botbuilder.recognizevaluesoptions.md)



# Interface: RecognizeValuesOptions

## Hierarchy

**RecognizeValuesOptions**

↳  [RecognizeChoicesOptions](botbuilder.recognizechoicesoptions.md)









## Properties
<a id="allowpartialmatches"></a>

### «Optional» allowPartialMatches

**●  allowPartialMatches**:  *`undefined`⎮`true`⎮`false`* 

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/entityRecognizers.d.ts:32*



(Optional) if true, then only some of the tokens in a value need to exist to be considered a match. The default value is "false".




___

<a id="maxtokendistance"></a>

### «Optional» maxTokenDistance

**●  maxTokenDistance**:  *`undefined`⎮`number`* 

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/entityRecognizers.d.ts:39*



(Optional) maximum tokens allowed between two matched tokens in the utterance. So with a max distance of 2 the value "second last" would match the utternace "second from the last" but it wouldn't match "Wait a second. That's not the last one is it?". The default value is "2".




___


