[Bot Builder SDK - Core](../README.md) > [Intent](../interfaces/botbuilder.intent.md)



# Interface: Intent


A named intent that represents an informed guess as to what the user is wanting to do based on their last utterance. Intents have a [score](#score) which is the calculated confidence of this guess.


## Properties
<a id="entities"></a>

### «Optional» entities

**●  entities**:  *[EntityObject](botbuilder.entityobject.md)`any`[]* 

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/intentRecognizer.d.ts#L18)*



(Optional) entities that were recognized as being related to this intent.




___

<a id="name"></a>

###  name

**●  name**:  *`string`* 

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:14](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/intentRecognizer.d.ts#L14)*



Name of the intent.




___

<a id="score"></a>

###  score

**●  score**:  *`number`* 

*Defined in [libraries/botbuilder/lib/intentRecognizer.d.ts:16](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/intentRecognizer.d.ts#L16)*



Calculated confidence score.




___


