[Bot Builder SDK](../README.md) > [CardAction](../interfaces/botbuilder.cardaction.md)



# Interface: CardAction

*__interface__*: An interface representing CardAction. A clickable action



## Properties
<a id="displaytext"></a>

### «Optional» displayText

**●  displayText**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:154](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botframework-schema/lib/index.d.ts#L154)*


*__member__*: {string} [displayText] (Optional) text to display in the chat feed if the button is clicked





___

<a id="image"></a>

### «Optional» image

**●  image**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:145](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botframework-schema/lib/index.d.ts#L145)*


*__member__*: {string} [image] Image URL which will appear on the button, next to text label





___

<a id="text"></a>

### «Optional» text

**●  text**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:149](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botframework-schema/lib/index.d.ts#L149)*


*__member__*: {string} [text] Text for this action





___

<a id="title"></a>

###  title

**●  title**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:140](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botframework-schema/lib/index.d.ts#L140)*


*__member__*: {string} [title] Text description which appears on the button





___

<a id="type"></a>

###  type

**●  type**:  *[ActionTypes](../enums/botbuilder.actiontypes.md)⎮`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:136](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botframework-schema/lib/index.d.ts#L136)*


*__member__*: {ActionTypes} [type] The type of action implemented by this button. Possible values include: 'openUrl', 'imBack', 'postBack', 'playAudio', 'playVideo', 'showImage', 'downloadFile', 'signin', 'call', 'payment', 'messageBack'





___

<a id="value"></a>

###  value

**●  value**:  *`string`* 

*Defined in [libraries/botframework-schema/lib/index.d.ts:159](https://github.com/Microsoft/botbuilder-js/blob/f596b7c/libraries/botframework-schema/lib/index.d.ts#L159)*


*__member__*: {string} [value] Supplementary parameter for action. Content of this property depends on the ActionType





___


