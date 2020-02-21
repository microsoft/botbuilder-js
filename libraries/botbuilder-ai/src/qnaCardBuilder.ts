import { Activity, MessageFactory, CardAction, CardFactory } from 'botbuilder-core';
import { QnAMakerResult } from './';

export class QnACardBuilder {
    public GetSuggestionsCard(suggestionsList: string[], cardTitle: string, cardNoMatchText: string): Partial<Activity> {
        if (!suggestionsList) { throw new Error('Missing suggestionsList'); }

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

        const plCard = CardFactory.heroCard('', null, buttonList);
        const message = MessageFactory.attachment(plCard, cardTitle);

        return message;
    }

    public getQnAPromptsCard(result: QnAMakerResult, cardNoMatchText: string): Partial<Activity> {
        if (!result) { throw new Error('Missing QnAMaker result'); }

        if (!cardNoMatchText) { throw new Error('Missing cardNoMatchText'); }

        var buttonList: CardAction[] = [];

        result.context.prompts.forEach(prompt => {
            buttonList.push({
                value: prompt.displayText,
                type: 'imBack',
                title: prompt.displayText
            });
        });

        const plCard = CardFactory.heroCard('', null, buttonList);
        const message = MessageFactory.attachment(plCard, '');

        return message;
    }
}