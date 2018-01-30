[Bot Builder SDK - Azure](../README.md) > [botbuilder](../modules/botbuilder.md) > [__global](../modules/botbuilder.__global.md) > [BotState](../interfaces/botbuilder.__global.botstate.md)



# Interface: BotState


State for the bot relative to the current request.

## Indexable

\[key: `string`\]:&nbsp;`any`
Key/value pairs.



## Properties
<a id="conversation"></a>

### «Optional» conversation

**●  conversation**:  *[ConversationState](botbuilder.__global.conversationstate.md)* 

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botbuilder.d.ts:260*



Persisted state for the current conversation.




___

<a id="user"></a>

### «Optional» user

**●  user**:  *[UserState](botbuilder.__global.userstate.md)* 

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botbuilder.d.ts:262*



Persisted state for the current user.




___

<a id="writeoptimizer"></a>

### «Optional» writeOptimizer

**●  writeOptimizer**:  *`undefined`⎮`object`* 

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botbuilder.d.ts:264*



Used by storage middleware to track hashes of objects that have been read from storage.




___


