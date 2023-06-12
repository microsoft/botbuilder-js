/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, MessageFactory, CardAction, CardFactory, ActivityTypes, Attachment } from 'botbuilder-core';
import { QnAMakerResult } from './';

/**
 * Provides methods to create activities containing hero cards for showing active learning or multi-turn prompt options for the QnAMakerDialog.
 */
export class QnACardBuilder {
    /**
     * Returns an [activity](xref:botframework-schema.Activity) with a hero card attachment, containing buttons for active learning suggestions.
     *
     * @param {string[]} suggestionsList List of suggestions to be displayed on hero card.
     * @param {string} cardTitle Title of the hero card.
     * @param {string} cardNoMatchText Text for button to be added to card to allow user to select 'no match'.
     * @param {boolean} useTeamsAdaptiveCard whether to use a Microsoft Teams formatted adaptive card instead of a hero card. Defaults to false.
     *  Card width is limited by Teams and long CQA responses should be formatted in the Language Studio to add line breaks. Card payload is specific to MS Teams.
     * @returns {Partial<Activity>} Activity representing the suggestions as a card
     */
    static getSuggestionsCard(
        suggestionsList: string[],
        cardTitle: string,
        cardNoMatchText: string,
        useTeamsAdaptiveCard = false
    ): Partial<Activity> {
        if (!Array.isArray(suggestionsList)) {
            throw new Error('Missing suggestionsList');
        }

        if (!cardTitle) {
            throw new Error('Missing cardTitle');
        }

        if (!cardNoMatchText) {
            throw new Error('Missing cardNoMatchText');
        }

        const buttonList: CardAction[] = [];

        suggestionsList.forEach((suggestion) => {
            buttonList.push({
                value: suggestion,
                type: 'imBack',
                title: suggestion,
            });
        });

        buttonList.push({
            value: cardNoMatchText,
            type: 'imBack',
            title: cardNoMatchText,
        });

        const promptsCard = useTeamsAdaptiveCard
            ? this.getTeamsAdaptiveCard(cardTitle, buttonList)
            : this.getHeroCard(cardTitle, buttonList);
        const message = MessageFactory.attachment(promptsCard);

        return message;
    }

    /**
     * Returns an [activity](xref:botframework-schema.Activity) with answer text and a card attachment, containing buttons for multi turn prompts.
     *
     * @param {QnAMakerResult} result QnAMaker result containing the answer text and multi turn prompts to be displayed.
     * @param {boolean} displayPreciseAnswerOnly whether to display PreciseAnswer Only or along with source Answer text.
     * @param {boolean} useTeamsAdaptiveCard whether to use a Microsoft Teams formatted adaptive card instead of a hero card. Defaults to false.
     *  Card width is limited by Teams and long CQA responses should be formatted in the Language Studio to add line breaks. Card payload is specific to MS Teams.
     * @returns {Partial<Activity>} Activity representing the prompts as a card
     */
    static getQnAAnswerCard(
        result: QnAMakerResult,
        displayPreciseAnswerOnly: boolean,
        useTeamsAdaptiveCard = false
    ): Partial<Activity> {
        if (!result) {
            throw new Error('Missing QnAMaker result');
        }

        const chatActivity: Partial<Activity> = { type: ActivityTypes.Message };
        const buttonList: CardAction[] = [];

        result.context?.prompts?.forEach((prompt) => {
            buttonList.push({
                value: prompt.qnaId,
                type: 'messageBack',
                title: prompt.displayText,
                text: prompt.displayText,
                displayText: prompt.displayText,
            });
        });

        let cardText = '';
        chatActivity.text = result.answer;
        if (result.answerSpan && result.answerSpan.text.length > 0) {
            // When the configuration is set to display precise answer only
            if (!displayPreciseAnswerOnly) {
                cardText = result.answer;
            }

            chatActivity.text = result.answerSpan.text;
        }

        if (buttonList.length > 0 || cardText.length > 0) {
            const prompt = useTeamsAdaptiveCard
                ? this.getTeamsAdaptiveCard(cardText, buttonList)
                : this.getHeroCard(cardText, buttonList);
            chatActivity.attachments = [prompt];
        }
        return chatActivity;
    }

    /**
     * Returns an [activity](xref:botframework-schema.Activity) with answer text and a hero card attachment, containing buttons for multi turn prompts.
     *
     * @param {QnAMakerResult} result QnAMaker result containing the answer text and multi turn prompts to be displayed.
     * @returns {Partial<Activity>} Activity representing the prompts as a card
     */
    static getQnAPromptsCard(result: QnAMakerResult): Partial<Activity> {
        return this.getQnAAnswerCard(result, true);
    }

    /**
     * Returns an Adaptive Card attachment containing the text for the card and a button list formatted for MS Teams
     *
     * @param {string} cardText The string to be placed in the card's text field
     * @param {any[]} buttonList The list of buttons to be converted to MS Teams messageBack buttons and placed in the card's actions field
     * @returns {Attachment} An attachment representing the MS Teams-formatted Adaptive Card
     */
    static getTeamsAdaptiveCard(cardText: string, buttonList: any[]): Attachment {
        // Create adaptive card attachement
        const buttonArray = [];

        if (buttonList) {
            for (const button of buttonList) {
                // Create messageBack card for Teams
                buttonArray.push({
                    type: 'Action.Submit',
                    data: {
                        msteams: {
                            type: 'messageBack',
                            displayText: button.displayText,
                            text: button.text,
                            value: button.value,
                            width: 'full',
                        },
                    },
                });
            }
        }

        // Define JSON representation of an adaptive card
        const adaptiveCardJson = {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: '1.3',
            title: !cardText || !cardText.trim() ? cardText : '',
            msteams: {
                width: 'full',
                height: 'full',
            },
            body: [
                {
                    type: 'TextBlock',
                    text: !cardText || !cardText.trim() ? cardText : '',
                },
            ],
            actions: buttonArray,
        };
        return CardFactory.adaptiveCard(adaptiveCardJson);
    }

    /**
     * Returns a Hero Card attachment containing the text for the card and a button list
     *
     * @param {string} cardText The string to be placed in the card's text field
     * @param {any[]} buttonList The list of buttons to be converted to imBack buttons and attached to the card
     * @returns {Attachment} An attachment representing the Hero Card
     */
    static getHeroCard(cardText: string, buttonList: any[]): Attachment {
        return CardFactory.heroCard(cardText, cardText, undefined, buttonList);
    }
}
