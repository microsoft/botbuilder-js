[Bot Builder SDK - Core](../README.md) > [__global](../modules/botbuilder.__global.md) > [BotState](../interfaces/botbuilder.__global.botstate.md)



# Interface: BotState


State for the bot relative to the current request.

## Indexable

\[key: `string`\]:&nbsp;`any`
Key/value pairs.



## Properties
<a id="conversation"></a>

### «Optional» conversation

**●  conversation**:  *[ConversationState](botbuilder.__global.conversationstate.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:260](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L260)*



Persisted state for the current conversation.




___

<a id="user"></a>

### «Optional» user

**●  user**:  *[UserState](botbuilder.__global.userstate.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:262](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L262)*



Persisted state for the current user.




___

<a id="writeoptimizer"></a>

### «Optional» writeOptimizer

**●  writeOptimizer**:  *`undefined`⎮`object`* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:264](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/botbuilder.d.ts#L264)*



Used by storage middleware to track hashes of objects that have been read from storage.




___


