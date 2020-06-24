/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {Activity, MessageFactory, CardAction, CardFactory, ActivityFactory} from 'botbuilder-core';
import { QnAMakerResult } from './';
import {any} from "codelyzer/util/function";
import {ActivityTypes} from "../../botframework-schema/lib";
import {Attachments} from "../../botframework-connector/lib/connectorApi/operations";

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
    public static getSuggestionsCard(suggestionsList: string[], cardTitle: string, cardNoMatchText: string): Partial<Activity> {
        if (!Array.isArray(suggestionsList)) { throw new Error('Missing suggestionsList'); }

        if (!cardTitle) { throw new Error('Missing cardTitle'); }

        if (!cardNoMatchText) { throw new Error('Missing cardNoMatchText'); }

        var buttonList: CardAction[] = [];

        suggestionsList.forEach(suggestion => {
            buttonList.push({
                value: suggestion,
                type: 'imBack',
                title: suggestion
            });
        });

        buttonList.push({
            value: cardNoMatchText,
            type: 'imBack',
            title: cardNoMatchText
        });

        const promptsCard = CardFactory.heroCard('', undefined, buttonList);
        const message = MessageFactory.attachment(promptsCard, cardTitle);

        return message;
    }

    /**
     * Returns an activity with answer text and a hero card attachment, containing buttons for multi turn prompts.
     * @param result QnAMaker result containing the answer text and multi turn prompts to be displayed.
     */
    public static getQnAAnswerCard(result: QnAMakerResult,  displayPreciseAnswerOnly): Partial<Activity> {
        if (!result) { throw new Error('Missing QnAMaker result'); }

        let chatActivity: Partial<Activity> = {type: ActivityTypes.Message};
        var buttonList: CardAction[] = [];

        result.context.prompts.forEach(prompt => {
            buttonList.push({
                value: prompt.displayText,
                type: 'imBack',
                title: prompt.displayText
            });
        });
        var answerText = result.answer;
        var answerspantext = '';


        if(result.answerSpan != undefined && result.answerSpan.text != '')
        {
            answerspantext = result.answerSpan.text;
            if (displayPreciseAnswerOnly)
            {
                answerText = answerspantext;
                answerspantext = '';
            }
            console.log(result.answerSpan.text);
        }
        console.log(answerspantext);

        if( answerText != '' || buttonList.length > 0) {
            const promptsCard = CardFactory.heroCard('', answerText, undefined, buttonList);
            var attachments = [promptsCard];
            chatActivity.attachments = attachments;
        }
        chatActivity.text = answerspantext;

        return chatActivity;
    }
}