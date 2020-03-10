/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, SuggestedActions, Attachment, ActivityTypes, ActionTypes, CardAction } from 'botframework-schema';
import { MessageFactory } from './messageFactory';
import { CardFactory } from './cardFactory';

/**
 * The ActivityFactory
 * to generate text and then uses simple markdown semantics like chatdown to create Activity.
 */
export class ActivityFactory {

    private static readonly lgType = 'lgType';
    private static readonly errorPrefix = '[ERROR]';
    private static readonly warningPrefix = '[WARNING]';
    private static adaptiveCardType: string = CardFactory.contentTypes.adaptiveCard;

    private static readonly genericCardTypeMapping: Map<string, string> = new Map<string, string>
    ([
        [ 'herocard', CardFactory.contentTypes.heroCard ],
        [ 'thumbnailcard', CardFactory.contentTypes.thumbnailCard ],
        [ 'audiocard', CardFactory.contentTypes.audioCard ],
        [ 'videocard', CardFactory.contentTypes.videoCard ],
        [ 'animationcard', CardFactory.contentTypes.animationCard ],
        [ 'signincard', CardFactory.contentTypes.signinCard ],
        [ 'oauthcard', CardFactory.contentTypes.oauthCard ],
        [ 'receiptcard', CardFactory.contentTypes.receiptCard ],
    ]);

    private static readonly activityProperties: string[] = ['type','id','timestamp','localTimestamp','localTimezone','callerId',
        'serviceUrl','channelId','from','conversation','recipient','textFormat','attachmentLayout','membersAdded',
        'membersRemoved','reactionsAdded','reactionsRemoved','topicName','historyDisclosed','locale','text','speak',
        'inputHint','summary','suggestedActions','attachments','entities','channelData','action','replyToId','label',
        'valueType','value','name','typrelatesToe','code','expiration','importance','deliveryMode','listenFor',
        'textHighlights','semanticAction'];

    private static readonly cardActionProperties: string[] = ['type','title','image','text','displayText','value','channelData'];

    /**
     * Generate the activity.
     * @param lgResult string result from languageGenerator.
     */
    public static fromObject(lgResult: any): Partial<Activity> {
        const diagnostics: string[] = this.checkLGResult(lgResult);
        const errors: string[] = diagnostics.filter((u: string): boolean => u.startsWith(this.errorPrefix));
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
     * check the LG result before generate an Activity.
     * @param lgResult lg output.
     * @returns Diagnostic list.
     */
    public static checkLGResult(lgResult: any): string[] {
        if (lgResult === undefined) {
            return [this.buildDiagnostic('LG output is empty', false)];
        }

        if (typeof lgResult === 'string') {
            if (!lgResult.startsWith('{') || !lgResult.endsWith('}')) {
                return [this.buildDiagnostic('LG output is not a json object, and will fallback to string format.', false)];
            }

            let lgStructuredResult: any = undefined;

            try {
                lgStructuredResult = JSON.parse(lgResult);
            } catch (error) {
                return [this.buildDiagnostic('LG output is not a json object, and will fallback to string format.', false)];
            }

            return this.checkStructuredResult(lgStructuredResult);
        } else {
            return this.checkStructuredResult(lgResult);
        }
    }

    /**
     * Given a lg result, create a text activity. This method will create a MessageActivity from text.
     * @param text lg text output.
     */
    private static buildActivityFromText(text: string): Partial<Activity> {
        const msg: Partial<Activity> = {
            type: ActivityTypes.Message,
            text: text,
            speak: text
        };

        return msg;
    }

    /**
     * Given a structured lg result, create an activity. This method will create an MessageActivity from object
     * @param lgValue lg output.
     */
    private static buildActivityFromLGStructuredResult(lgValue: any): Partial<Activity> {
        let activity: Partial<Activity> = {};

        const type: string = this.getStructureType(lgValue);
        if (this.genericCardTypeMapping.has(type) || type === 'attachment') {
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
            if (property === this.lgType) {
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
                    var properties = this.activityProperties.map((u: string): string => u.toLowerCase());
                    if (properties.includes(property.toLowerCase()))
                    {
                        var realPropertyName = this.activityProperties[properties.indexOf(property.toLowerCase())];
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
                    if (property === this.lgType) {
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
        if (this.genericCardTypeMapping.has(type)) {
            attachment = this.getCardAttachment(this.genericCardTypeMapping.get(type), input);
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
                    if (this.genericCardTypeMapping.has(type)) {
                        attachment.contentType = this.genericCardTypeMapping.get(type);
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

    private static checkStructuredResult(input: any): string[] {
        const result: string[] = [];
        const type: string = this.getStructureType(input);
        if (this.genericCardTypeMapping.has(type) || type === 'attachment') {
            result.push(...this.checkAttachment(input));
        } else if (type === 'activity') {
            result.push(...this.checkActivity(input));
        } else {
            const diagnosticMessage: string = (type === undefined || type === '') ? 
                `'${ this.lgType }' does not exist in lg output json object.`
                : `Type '${ type }' is not supported currently.`;
            result.push(this.buildDiagnostic(diagnosticMessage));
        }

        return result;
    }

    private static checkActivity(input: any): string[] {
        const result: string[] = [];
        let activityType: string = undefined;
        if ('type' in input) {
            activityType = input['type'].toString().trim();
        }

        result.push(...this.checkActivityType(activityType));
        result.push(...this.checkActivityPropertyName(input));
        result.push(...this.checkActivityProperties(input));

        return result;
    }

    private static checkActivityType(activityType: string): string[] {
        if (activityType !== undefined) {
            if (!Object.values(ActivityTypes).map((u: string): string => u.toLowerCase()).includes(activityType.toLowerCase())) {
                return [this.buildDiagnostic(`'${ activityType }' is not a valid activity type.`)];
            }
        }
        return [];
    }

    private static checkActivityPropertyName(input: any): string[] {
        const invalidProperties: string[] = [];
        for (const property of Object.keys(input)) {
            if (property === this.lgType) {
                continue;
            }
            if (!this.activityProperties.map((u: string): string => u.toLowerCase()).includes(property.toLowerCase())) {
                invalidProperties.push(property);
            }
        }
        if (invalidProperties.length > 0) {
            return [this.buildDiagnostic(`'${ invalidProperties.join(',') }' not support in Activity.`, false)];
        }

        return [];
    }

    private static checkActivityProperties(input: any): string[] {
        const result: string[] = [];
        for (const key of Object.keys(input)) {
            const property: string = key.trim();
            const value: any = input[key];

            switch (property.toLowerCase()) {
                case 'attachments':
                    result.push(...this.checkAttachments(value));
                    break;
                case 'suggestedactions':
                    result.push(...this.checkSuggestions(value));
                    break;
                default:
                    break;
            }
        }

        return result;
    }

    private static checkSuggestions(value: any): string[] {
        const actions: any[] = this.normalizedToList(value);
        return this.checkCardActions(actions);
    }

    private static checkButtons(value: any): string[] {
        const actions: any[] = this.normalizedToList(value);
        return this.checkCardActions(actions);
    }

    private static checkCardActions(actions: any[]): string[] {
        const result: string[] = [];
        actions.forEach((u: any): void => { result.push(...this.checkCardAction(u)); });
        return result;
    }

    private static checkCardAction(value: any): string[] {
        const result: string[] = [];
        if (typeof value === 'string') {
            return result;
        }

        if (typeof value === 'object') {
            const type: string = this.getStructureType(value);
            if (type !== 'cardaction') {
                result.push(this.buildDiagnostic(`'${ type }' is not card action type.`, false));
            } else {
                result.push(...this.checkCardActionPropertyName(value));
                if ('type' in value) {
                    result.push(...this.checkCardActionType(value['type']));
                }
            }
        } else {
            result.push(this.buildDiagnostic(`'${ value }' is not a valid card action format.`, false));
        }

        return result;
    }

    
    private static checkCardActionPropertyName(input: any): string[] {
        const invalidProperties: string[] = [];
        for (const property of Object.keys(input)) {
            if (property === this.lgType) {
                continue;
            }
            if (!this.cardActionProperties.map((u: string): string => u.toLowerCase()).includes(property.toLowerCase())) {
                invalidProperties.push(property);
            }
        }
        if (invalidProperties.length > 0) {
            return [this.buildDiagnostic(`'${ invalidProperties.join(',') }' not support in card action.`, false)];
        }

        return [];
    }

    private static checkCardActionType(cardActionType: string): string[] {
        const result: string[] = [];
        if (!cardActionType) {
            return result;
        }

        if (!Object.values(ActionTypes).map((u: string): string => u.toLowerCase()).includes(cardActionType.toLowerCase())) {
            return [this.buildDiagnostic(`'${ cardActionType }' is not a valid card action type.`)];
        }

        return result;
    }

    private static checkAttachments(value: any): string[] {
        const result: string[] = [];
        const attachmentsJsonList: any[] = this.normalizedToList(value);

        for (const attachmentsJson of attachmentsJsonList) {
            if (typeof attachmentsJson === 'object') {
                result.push(...this.checkAttachment(attachmentsJson));
            }
        }

        return result;
    }

    private static checkAttachment(value: any): string[] {
        const result: string[] = [];
        const type: string = this.getStructureType(value);
        if (this.genericCardTypeMapping.has(type)) {
            result.push(...this.checkCardAttachment(value));
        } else if (type === 'adaptivecard') {
            // TODO
            // check adaptivecard format
        } else if (type === 'attachment') {
            // TODO
            // Check attachment format
        } else {
            result.push(this.buildDiagnostic(`'${ type }' is not an attachment type.`, false));
        }

        return result;
    }

    private static checkCardAttachment(input: any): string[] {
        const result: string[] = [];
        for (const key of Object.keys(input)) {
            const property: string = key.trim().toLowerCase();
            const value: any = input[key];

            switch (property) {
                case 'buttons':
                    result.push(...this.checkButtons(value));
                    break;
                case 'autostart':
                case 'shareable':
                case 'autoloop':
                    const boolValue: boolean = this.getValidBooleanValue(value.toString());
                    if (boolValue === undefined) {
                        result.push(this.buildDiagnostic(`'${ value.toString() }' is not a boolean value.`));
                    }
                    break;
                default:
                    break;
            }
        }

        return result;
    }

    private static getStructureType(input: any): string {
        let result = '';

        if (input && typeof input === 'object') {
            if (this.lgType in input) {
                result = input[this.lgType].toString();
            } else if ('type' in input) {
                // Adaptive card type
                result = input['type'].toString();
            }
        }

        return result.trim().toLowerCase();
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

    private static buildDiagnostic(message: string, isError: boolean = true): string {
        message = message === undefined ? '' : message;
        return isError ? this.errorPrefix + message : this.warningPrefix + message;
    }
}