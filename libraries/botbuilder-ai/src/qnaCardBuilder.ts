/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, MessageFactory, CardAction, CardFactory, ActivityTypes } from 'botbuilder-core';
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
     * @returns {Partial<Activity>} Activity representing the suggestions as a card
     */
    static getSuggestionsCard(
        suggestionsList: string[],
        cardTitle: string,
        cardNoMatchText: string
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

        const promptsCard = CardFactory.heroCard(cardTitle, undefined, buttonList);
        const message = MessageFactory.attachment(promptsCard);

        return message;
    }

    /**
     * Returns an [activity](xref:botframework-schema.Activity) with answer text and a hero card attachment, containing buttons for multi turn prompts.
     *
     * @param {QnAMakerResult} result QnAMaker result containing the answer text and multi turn prompts to be displayed.
     * @param {boolean} displayPreciseAnswerOnly whether to display PreciseAnswer Only or along with source Answer text. .
     * @returns {Partial<Activity>} Activity representing the prompts as a card
     */
    static getQnAAnswerCard(result: QnAMakerResult, displayPreciseAnswerOnly: boolean): Partial<Activity> {
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

        let heroCardText = '';
        chatActivity.text = result.answer;
        if (result.answerSpan && result.answerSpan.text.length > 0) {
            // When the configuration is set to display precise answer only
            if (!displayPreciseAnswerOnly) {
                heroCardText = result.answer;
            }

            chatActivity.text = result.answerSpan.text;
        }

        if (buttonList.length > 0 || heroCardText.length > 0) {
            // Create the attachment.
            const prompt = CardFactory.heroCard('', heroCardText, undefined, buttonList);
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
}
