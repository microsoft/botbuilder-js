[Bot Builder SDK - Core](../README.md) > [BotStateManagerSettings](../interfaces/botbuilder.botstatemanagersettings.md)



# Interface: BotStateManagerSettings


Optional settings used to configure a BotStateManager instance.


## Properties
<a id="lastwriterwins"></a>

###  lastWriterWins

**●  lastWriterWins**:  *`boolean`* 

*Defined in [libraries/botbuilder/lib/botStateManager.d.ts:20](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botStateManager.d.ts#L20)*



If true the eTag's for user & conversation state will be set to '*' before writing to storage. The default value is true.




___

<a id="persistconversationstate"></a>

###  persistConversationState

**●  persistConversationState**:  *`boolean`* 

*Defined in [libraries/botbuilder/lib/botStateManager.d.ts:16](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botStateManager.d.ts#L16)*



If true `context.state.conversation` will be persisted. The default value is true.




___

<a id="persistuserstate"></a>

###  persistUserState

**●  persistUserState**:  *`boolean`* 

*Defined in [libraries/botbuilder/lib/botStateManager.d.ts:14](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botStateManager.d.ts#L14)*



If true `context.state.user` will be persisted. The default value is true.




___

<a id="writebeforepost"></a>

###  writeBeforePost

**●  writeBeforePost**:  *`boolean`* 

*Defined in [libraries/botbuilder/lib/botStateManager.d.ts:18](https://github.com/Microsoft/botbuilder-js/blob/0b16877/libraries/botbuilder/lib/botStateManager.d.ts#L18)*



If true state information will be persisted before outgoing activities are sent to the user. The default value is true.




___


