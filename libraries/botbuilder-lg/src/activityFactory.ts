/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, SuggestedActions, Attachment, ActivityTypes, ActionTypes, CardAction } from 'botframework-schema';
import { MessageFactory, CardFactory } from 'botbuilder-core';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { ActivityChecker } from './activityChecker';
import { Evaluator } from './evaluator';

/**
 * The ActivityFactory
 * to generate text and then uses simple markdown semantics like chatdown to create Activity.
 */
export class ActivityFactory {
    private static adaptiveCardType: string = CardFactory.contentTypes.adaptiveCard;

    /**
     * Generate the activity.
     * @param lgResult string result from languageGenerator.
     */
    public static createActivity(lgResult: any): Partial<Activity> {
        const diagnostics: Diagnostic[] = ActivityChecker.check(lgResult);
        const errors: Diagnostic[] = diagnostics.filter((u: Diagnostic): boolean => u.severity === DiagnosticSeverity.Error);
        if (errors !== undefined && errors.length > 0) {
            throw new Error(`${ errors.join('\n') }`);
        }

        if (typeof lgResult === 'string') {
            const structuredLGResult: any = this.parseStructuredLGResult(lgResult.trim());
            return structuredLGResult === undefined ?
                this.buildActivityFromText(lgResult.trim())
                :this.buildActivityFromLGStructuredResult(lgResult);
        }

        return this.buildActivityFromLGStructuredResult(lgResult);
    }

    /**
     * Given a lg result, create a text activity. This method will create a MessageActivity from text.
     * @param text lg text output.
     */
    private static buildActivityFromText(text: string): Partial<Activity> {
        return MessageFactory.text(text, text);
    }

    /**
     * Given a structured lg result, create an activity. This method will create an MessageActivity from object
     * @param lgValue lg output.
     */
    private static buildActivityFromLGStructuredResult(lgValue: any): Partial<Activity> {
        let activity: Partial<Activity> = {};

        const type: string = this.getStructureType(lgValue);
        if (ActivityChecker.genericCardTypeMapping.has(type) || type === 'attachment') {
            activity = MessageFactory.attachment(this.getAttachment(lgValue));
        } else if (type === 'activity') {
            activity = this.buildActivity(lgValue);
        }

        return activity;
    }

    private static buildActivity(messageValue: any): Partial<Activity> {
        let activity: Partial<Activity> = { type: ActivityTypes.Message };
        for (const key of Object.keys(messageValue)) {
            const property: string = key.trim();
            if (property === Evaluator.LGType) {
                continue;
            }

            const value: any = messageValue[key];

            switch (property.toLowerCase()) {
                case 'attachments':
                    activity.attachments = this.getAttachments(value);
                    break;
                case 'suggestedactions':
                    activity.suggestedActions = this.getSuggestions(value);
                    break;
                default:
                    var properties = ActivityChecker.activityProperties.map((u: string): string => u.toLowerCase());
                    if (properties.includes(property.toLowerCase()))
                    {
                        var realPropertyName = ActivityChecker.activityProperties[properties.indexOf(property.toLowerCase())];
                        activity[realPropertyName] = value;
                    } else {
                        activity[property.toLowerCase()] = value;
                    }
                    break;
            }
        }

        return activity;
    }

    private static getSuggestions(suggestionsValue: any): SuggestedActions {
        const actions: any[] = this.normalizedToList(suggestionsValue);

        const suggestedActions: SuggestedActions = {
            actions : this.getCardActions(actions),
            to: []
        };

        return suggestedActions;
    }

    private static getButtons(buttonsValue: any): CardAction[] {
        const actions: any[] = this.normalizedToList(buttonsValue);
        return this.getCardActions(actions);
    }

    private static getCardActions(actions: any[]): CardAction[] {
        return actions.map((u: any): CardAction => this.getCardAction(u));
    }

    private static getCardAction(action: any): CardAction
    {
        let cardAction: CardAction;
        if (typeof action === 'string') {
            cardAction = { type: ActionTypes.ImBack, value: action, title: action, channelData: undefined };
        } else {
            const type: string = this.getStructureType(action);
            cardAction = {
                type: ActionTypes.ImBack,
                title: '',
                value: ''
            };

            if (type === 'cardaction') {
                for (const key of Object.keys(action)) {
                    const property: string = key.trim();
                    if (property === Evaluator.LGType) {
                        continue;
                    }

                    const value: any = action[key];

                    switch (property.toLowerCase()) {
                        case 'displaytext':
                            cardAction.displayText = value;
                            break;
                        case 'channeldata':
                            cardAction.channelData = value;
                            break;
                        default:
                            cardAction[property.toLowerCase()] = value;
                            break;
                    }
                }
            }
        }

        return cardAction;
    }


    private static getStructureType(input: any): string {
        let result = '';

        if (input && typeof input === 'object') {
            if (Evaluator.LGType in input) {
                result = input[Evaluator.LGType].toString();
            } else if ('type' in input) {
                // Adaptive card type
                result = input['type'].toString();
            }
        }

        return result.trim().toLowerCase();
    }

    private static getAttachments(input: any): Attachment[] {
        const attachments: Attachment[] = [];
        const attachmentsJsonList: any[] = this.normalizedToList(input);

        for (const attachmentsJson of attachmentsJsonList) {
            if (typeof attachmentsJson === 'object') {
                attachments.push(this.getAttachment(attachmentsJson));
            }
        }

        return attachments;
    }

    private static getAttachment(input: any): Attachment {
        let attachment: Attachment = {
            contentType: ''
        };
        const type: string = this.getStructureType(input);
        if (ActivityChecker.genericCardTypeMapping.has(type)) {
            attachment = this.getCardAttachment(ActivityChecker.genericCardTypeMapping.get(type), input);
        } else if (type === 'adaptivecard') {
            attachment = CardFactory.adaptiveCard(input);
        } else if (type === 'attachment') {
            attachment = this.getNormalAttachment(input);
        } else {
            attachment = {contentType: type, content: input};
        }

        return attachment;
    }

    private static getNormalAttachment(input: any): Attachment {
        const attachment: Attachment = {contentType:''};

        for (const key of Object.keys(input)) {
            const property: string = key.trim();
            const value: any = input[key];

            switch (property.toLowerCase()) {
                case 'contenttype':
                    const type: string = value.toString().toLowerCase();
                    if (ActivityChecker.genericCardTypeMapping.has(type)) {
                        attachment.contentType = ActivityChecker.genericCardTypeMapping.get(type);
                    } else if (type === 'adaptivecard') {
                        attachment.contentType = this.adaptiveCardType;
                    } else {
                        attachment.contentType = type;
                    }
                    break;
                case 'contenturl':
                    attachment.contentUrl = value;
                    break;
                case 'thumbnailurl':
                    attachment.thumbnailUrl = value;
                    break;
                default:
                    attachment[property.toLowerCase()] = value;
                    break;
            }
        }

        return attachment;
    }

    private static getCardAttachment(type: string, input: any): Attachment {
        const card: any = {};

        for (const key of Object.keys(input)) {
            const property: string = key.trim().toLowerCase();
            const value: any = input[key];

            switch (property) {
                case 'tap':
                    card[property] = this.getCardAction(value);
                    break;
                case 'image':
                case 'images':
                    if (type === CardFactory.contentTypes.heroCard || type === CardFactory.contentTypes.thumbnailCard) {
                        if (!('images' in card)) {
                            card['images'] = [];
                        }

                        const imageList: string[] = this.normalizedToList(value).map((u): string => u.toString());
                        imageList.forEach( (u): any => card['images'].push({url : u}));
                    } else {
                        card['image'] = {url: value.toString()};
                    }
                    break;
                case 'media':
                    if (!('media' in card)) {
                        card['media'] = [];
                    }

                    const mediaList: string[] = this.normalizedToList(value).map((u): string => u.toString());
                    mediaList.forEach( (u): any => card['media'].push({url : u}));
                    break;
                case 'buttons':
                    if (!('buttons' in card)) {
                        card['buttons'] = [];
                    }

                    const buttons: any[] = this.getButtons(value);
                    buttons.forEach( (u): any => card[property].push(u));
                    break;
                case 'autostart':
                case 'shareable':
                case 'autoloop':
                    const boolValue: boolean = this.getValidBooleanValue(value.toString());
                    if (boolValue !== undefined) {
                        card[property] = boolValue;
                    }
                    break;
                case 'connectionname':
                    card['connectionName'] = value;
                    break;
                default:
                    card[property.toLowerCase()] = value;
                    break;
            }
        }

        const attachment: Attachment = {
            contentType: type,
            content: card
        };

        return attachment;
    }

    private static getValidBooleanValue(boolValue: string): boolean{
        if (boolValue.toLowerCase() === 'true')
        {
            return true;
        }
        else if (boolValue.toLowerCase() === 'false')
        {
            return false;
        }

        return undefined;
    }

    private static normalizedToList(item: any): any[] {
        if (item === undefined) {
            return [];
        } else if (Array.isArray(item)) {
            return item;
        } else {
            return [item];
        }
    }

    private static parseStructuredLGResult(lgStringResult: string): any
    {
        let lgStructuredResult: any = undefined;
        if (lgStringResult === undefined || lgStringResult === '') {
            return undefined;
        }

        lgStringResult = lgStringResult.trim();

        if (lgStringResult === '' || !lgStringResult.startsWith('{') || !lgStringResult.endsWith('}')) {
            return undefined;
        }

        try {
            lgStructuredResult = JSON.parse(lgStringResult);
        } catch (error) {
            return undefined;
        }

        return lgStructuredResult;
    }
}