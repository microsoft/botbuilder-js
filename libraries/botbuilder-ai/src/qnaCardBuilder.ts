/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, MessageFactory, CardAction, CardFactory } from 'botbuilder-core';
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
    public static getSuggestionsCard(
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
     * @returns {Partial<Activity>} Activity representing the prompts as a card
     */
    public static getQnAPromptsCard(result: QnAMakerResult): Partial<Activity> {
        if (!result) {
            throw new Error('Missing QnAMaker result');
        }

        const buttonList: CardAction[] = [];

        result.context.prompts.forEach((prompt) => {
            buttonList.push({
                value: prompt.displayText,
                type: 'imBack',
                title: prompt.displayText,
            });
        });

        const promptsCard = CardFactory.heroCard('', undefined, buttonList);
        const message = MessageFactory.attachment(promptsCard, result.answer);

        return message;
    }
}
