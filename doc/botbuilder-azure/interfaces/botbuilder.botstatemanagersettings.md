[Bot Builder SDK - Azure](../README.md) > [botbuilder](../modules/botbuilder.md) > [BotStateManagerSettings](../interfaces/botbuilder.botstatemanagersettings.md)



# Interface: BotStateManagerSettings


Optional settings used to configure a BotStateManager instance.


## Properties
<a id="lastwriterwins"></a>

###  lastWriterWins

**●  lastWriterWins**:  *`boolean`* 

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botStateManager.d.ts:17*



If true the eTag's for user & conversation state will be set to '*' before writing to storage. The default value is true.




___

<a id="persistconversationstate"></a>

###  persistConversationState

**●  persistConversationState**:  *`boolean`* 

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botStateManager.d.ts:13*



If true `context.state.conversation` will be persisted. The default value is true.




___

<a id="persistuserstate"></a>

###  persistUserState

**●  persistUserState**:  *`boolean`* 

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botStateManager.d.ts:11*



If true `context.state.user` will be persisted. The default value is true.




___

<a id="writebeforepost"></a>

###  writeBeforePost

**●  writeBeforePost**:  *`boolean`* 

*Defined in libraries/botbuilder-azure/node_modules/botbuilder/lib/botStateManager.d.ts:15*



If true state information will be persisted before outgoing activities are sent to the user. The default value is true.




___


