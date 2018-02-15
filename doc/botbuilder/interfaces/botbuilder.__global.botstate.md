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

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:184](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/botbuilder.d.ts#L184)*



Persisted state for the current conversation.




___

<a id="user"></a>

### «Optional» user

**●  user**:  *[UserState](botbuilder.__global.userstate.md)* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:186](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/botbuilder.d.ts#L186)*



Persisted state for the current user.




___

<a id="writeoptimizer"></a>

### «Optional» writeOptimizer

**●  writeOptimizer**:  *`undefined`⎮`object`* 

*Defined in [libraries/botbuilder/lib/botbuilder.d.ts:188](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/botbuilder.d.ts#L188)*



Used by storage middleware to track hashes of objects that have been read from storage.




___


