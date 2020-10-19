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
     * Returns an activity with a hero card attachment, containing buttons for active learning suggestions.
     * @param suggestionsList List of suggestions to be displayed on hero card.
     * @param cardTitle Title of the hero card.
     * @param cardNoMatchText Text for button to be added to card to allow user to select 'no match'.
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

        const promptsCard = CardFactory.heroCard('', undefined, buttonList);
        const message = MessageFactory.attachment(promptsCard, cardTitle);

        return message;
    }

    /**
     * Returns an activity with answer text and a hero card attachment, containing buttons for multi turn prompts.
     * @param result QnAMaker result containing the answer text and multi turn prompts to be displayed.
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
