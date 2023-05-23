**[Bot Builder SDK - AI](../README.md)**

> [Globals](undefined) / [botbuilder-ai](../README.md) / QnAMakerDialogResponseOptions

# Interface: QnAMakerDialogResponseOptions

QnAMakerDialog response options.

## Hierarchy

* **QnAMakerDialogResponseOptions**

## Index

### Properties

* [activeLearningCardTitle](botbuilder_ai.qnamakerdialogresponseoptions.md#activelearningcardtitle)
* [cardNoMatchResponse](botbuilder_ai.qnamakerdialogresponseoptions.md#cardnomatchresponse)
* [cardNoMatchText](botbuilder_ai.qnamakerdialogresponseoptions.md#cardnomatchtext)
* [displayPreciseAnswerOnly](botbuilder_ai.qnamakerdialogresponseoptions.md#displaypreciseansweronly)
* [noAnswer](botbuilder_ai.qnamakerdialogresponseoptions.md#noanswer)

## Properties

### activeLearningCardTitle

•  **activeLearningCardTitle**: string

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:22*

Title for active learning card.

___

### cardNoMatchResponse

•  **cardNoMatchResponse**: Partial\<Activity>

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:34*

Activity to be sent in the end that the 'no match' option is selected on active learning card.

___

### cardNoMatchText

•  **cardNoMatchText**: string

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:26*

Text shown for 'no match' option on active learning card.

___

### displayPreciseAnswerOnly

•  **displayPreciseAnswerOnly**: boolean

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:38*

Indicates whether the dialog response should display only precise answers.

___

### noAnswer

•  **noAnswer**: Partial\<Activity>

*Defined in libraries/botbuilder-ai/lib/qnaMakerDialog.d.ts:30*

Activity to be sent in the event of no answer found in KB.
