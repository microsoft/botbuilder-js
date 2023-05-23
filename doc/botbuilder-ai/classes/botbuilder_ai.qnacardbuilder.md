**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / QnACardBuilder

# Class: QnACardBuilder

Provides methods to create activities containing hero cards for showing active learning or multi-turn prompt options for the QnAMakerDialog.

## Hierarchy

* **QnACardBuilder**

## Index

### Methods

* [getHeroCard](botbuilder_ai.qnacardbuilder.md#getherocard)
* [getQnAAnswerCard](botbuilder_ai.qnacardbuilder.md#getqnaanswercard)
* [getQnAPromptsCard](botbuilder_ai.qnacardbuilder.md#getqnapromptscard)
* [getSuggestionsCard](botbuilder_ai.qnacardbuilder.md#getsuggestionscard)
* [getTeamsAdaptiveCard](botbuilder_ai.qnacardbuilder.md#getteamsadaptivecard)

## Methods

### getHeroCard

▸ `Static`**getHeroCard**(`cardText`: string, `buttonList`: any[]): Attachment

*Defined in libraries/botbuilder-ai/lib/qnaCardBuilder.d.ts:57*

Returns a Hero Card attachment containing the text for the card and a button list

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`cardText` | string | The string to be placed in the card's text field |
`buttonList` | any[] | The list of buttons to be converted to imBack buttons and attached to the card |

**Returns:** Attachment

An attachment representing the Hero Card

___

### getQnAAnswerCard

▸ `Static`**getQnAAnswerCard**(`result`: QnAMakerResult, `displayPreciseAnswerOnly`: boolean, `useTeamsAdaptiveCard?`: boolean): Partial\<Activity>

*Defined in libraries/botbuilder-ai/lib/qnaCardBuilder.d.ts:34*

Returns an [activity](xref:botframework-schema.Activity) with answer text and a card attachment, containing buttons for multi turn prompts.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`result` | QnAMakerResult | QnAMaker result containing the answer text and multi turn prompts to be displayed. |
`displayPreciseAnswerOnly` | boolean | whether to display PreciseAnswer Only or along with source Answer text. |
`useTeamsAdaptiveCard?` | boolean | whether to use a Microsoft Teams formatted adaptive card instead of a hero card. Defaults to false.  Card width is limited by Teams and long CQA responses should be formatted in the Language Studio to add line breaks. Card payload is specific to MS Teams. |

**Returns:** Partial\<Activity>

Activity representing the prompts as a card

___

### getQnAPromptsCard

▸ `Static`**getQnAPromptsCard**(`result`: QnAMakerResult): Partial\<Activity>

*Defined in libraries/botbuilder-ai/lib/qnaCardBuilder.d.ts:41*

Returns an [activity](xref:botframework-schema.Activity) with answer text and a hero card attachment, containing buttons for multi turn prompts.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`result` | QnAMakerResult | QnAMaker result containing the answer text and multi turn prompts to be displayed. |

**Returns:** Partial\<Activity>

Activity representing the prompts as a card

___

### getSuggestionsCard

▸ `Static`**getSuggestionsCard**(`suggestionsList`: string[], `cardTitle`: string, `cardNoMatchText`: string, `useTeamsAdaptiveCard?`: boolean): Partial\<Activity>

*Defined in libraries/botbuilder-ai/lib/qnaCardBuilder.d.ts:24*

Returns an [activity](xref:botframework-schema.Activity) with a hero card attachment, containing buttons for active learning suggestions.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`suggestionsList` | string[] | List of suggestions to be displayed on hero card. |
`cardTitle` | string | Title of the hero card. |
`cardNoMatchText` | string | Text for button to be added to card to allow user to select 'no match'. |
`useTeamsAdaptiveCard?` | boolean | whether to use a Microsoft Teams formatted adaptive card instead of a hero card. Defaults to false.  Card width is limited by Teams and long CQA responses should be formatted in the Language Studio to add line breaks. Card payload is specific to MS Teams. |

**Returns:** Partial\<Activity>

Activity representing the suggestions as a card

___

### getTeamsAdaptiveCard

▸ `Static`**getTeamsAdaptiveCard**(`cardText`: string, `buttonList`: any[]): Attachment

*Defined in libraries/botbuilder-ai/lib/qnaCardBuilder.d.ts:49*

Returns an Adaptive Card attachment containing the text for the card and a button list formatted for MS Teams

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`cardText` | string | The string to be placed in the card's text field |
`buttonList` | any[] | The list of buttons to be converted to MS Teams messageBack buttons and placed in the card's actions field |

**Returns:** Attachment

An attachment representing the MS Teams-formatted Adaptive Card
