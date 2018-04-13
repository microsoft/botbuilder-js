[Bot Builder SDK](../README.md) > [CardAction](../interfaces/botbuilder.cardaction.md)



# Interface: CardAction

*__interface__*: An interface representing CardAction. A clickable action



## Properties
<a id="displaytext"></a>

### «Optional» displayText

**●  displayText**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:186](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L186)*


*__member__*: {string} [displayText] (Optional) text to display in the chat feed if the button is clicked





___

<a id="image"></a>

### «Optional» image

**●  image**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:177](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L177)*


*__member__*: {string} [image] Image URL which will appear on the button, next to text label





___

<a id="text"></a>

### «Optional» text

**●  text**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:181](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L181)*


*__member__*: {string} [text] Text for this action





___

<a id="title"></a>

###  title

**●  title**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:172](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L172)*


*__member__*: {string} [title] Text description which appears on the button





___

<a id="type"></a>

###  type

**●  type**:  *[ActionTypes](../enums/botbuilder.actiontypes.md)⎮`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:168](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L168)*


*__member__*: {ActionTypes} [type] The type of action implemented by this button. Possible values include: 'openUrl', 'imBack', 'postBack', 'playAudio', 'playVideo', 'showImage', 'downloadFile', 'signin', 'call', 'payment', 'messageBack'





___

<a id="value"></a>

###  value

**●  value**:  *`any`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:191](https://github.com/Microsoft/botbuilder-js/blob/c748a95/libraries/botframework-schema/lib/index.d.ts#L191)*


*__member__*: {any} [value] Supplementary parameter for action. Content of this property depends on the ActionType





___


