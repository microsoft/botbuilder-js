/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, SuggestedActions, Attachment, ActivityTypes, ActionTypes, CardAction } from 'botframework-schema';
import { MessageFactory, CardFactory } from 'botbuilder-core';

export class ActivityFactory {
    private static genericCardTypeMapping: Map<string, string> = new Map<string, string>
    ([
        [ 'herocard', CardFactory.contentTypes.heroCard ],
        [ 'thumbnailcard', CardFactory.contentTypes.thumbnailCard ],
        [ 'audiocard', CardFactory.contentTypes.audioCard ],
        [ 'videocard', CardFactory.contentTypes.videoCard ],
        [ 'animationcard', CardFactory.contentTypes.animationCard ],
        [ 'signincard', CardFactory.contentTypes.signinCard ],
        [ 'oauthcard', CardFactory.contentTypes.oauthCard ],
    ]);

    public static CreateActivity(lgResult: string): Partial<Activity> {
        if (typeof lgResult === 'string') {
            return this.buildActivityFromText(lgResult.trim());
        }

        return this.buildActivityFromLGStructuredResult(lgResult);
    }

    private static buildActivityFromText(text: string): Partial<Activity> {
        return MessageFactory.text(text, text);
    }

    private static buildActivityFromLGStructuredResult(lgValue: any): Partial<Activity> {
        let activity: Partial<Activity> = {};

        const type: string = this.getStructureType(lgValue);
        if (ActivityFactory.genericCardTypeMapping.has(type)) {
            const attachment: Attachment = this.getAttachment(lgValue);
            if (attachment !== undefined) {
                activity = MessageFactory.attachment(attachment);
            } else {
                throw new Error(`'${ lgValue }' is not an attachment format.`);
            }
        } else if (type === 'activity') {
            activity = this.buildActivityFromObject(lgValue);
        } else {
            throw new Error(`type ${ type } is not support currently.`);
        }

        return activity;
    }

    private static buildActivityFromObject(activityValue: any): Partial<Activity> {
        let activity: Partial<Activity> = {};

        if ('type' in activityValue && activityValue.type === 'event') {
            activity = this.buildEventActivity(activityValue);
        } else {
            activity = this.buildMessageActivity(activityValue);
        }

        return activity;
    }

    private static buildEventActivity(eventValue: any): Partial<Activity> {
        let activity: Partial<Activity> = { type: ActivityTypes.Event };
        for (const item of Object.keys(eventValue)) {
            const property: string = item.trim();
            const value: any = eventValue[item];
            switch (property.toLowerCase()) {
                case '$type':
                    break;
                case 'name':
                    activity.name = value.toString();
                    break;
                case 'value':
                    activity.value = value.toString();
                    break;
                default:
                    activity[property] = value;
                    break;
            }
        }

        return activity;
    }

    private static buildMessageActivity(messageValue: any): Partial<Activity> {
        let activity: Partial<Activity> = { type: ActivityTypes.Message };
        for (const key of Object.keys(messageValue)) {
            const property: string = key.trim();
            const value: any = messageValue[key];

            switch (property.toLowerCase()) {
                case '$type':
                    break;
                case 'text':
                    activity.text = value.toString();
                    break;
                case 'speak':
                    activity.speak = value.toString();
                    break;
                case 'inputhint':
                    activity.inputHint = value.toString();
                    break;
                case 'attachments':
                    activity.attachments = this.getAttachments(value);
                    break;
                case 'suggestedactions':
                    activity.suggestedActions = this.getSuggestions(value);
                    break;
                case 'attachmentlayout':
                    activity.attachmentLayout = value.toString();
                default:
                    activity[property] = value;
                    break;
            }
        }

        return activity;
    }

    private static getSuggestions(suggestionsValue: any): SuggestedActions {
        let actions: any[] = this.normalizedToList(suggestionsValue);

        let suggestedActions: SuggestedActions = {
            actions : this.getCardActions(actions),
            to: []
        };

        return suggestedActions;
    }

    private static getButtons(buttonsValue: any): CardAction[] {
        let actions: any[] = this.normalizedToList(buttonsValue);
        return this.getCardActions(actions);
    }

    private static getCardActions(actions: any[]): CardAction[] {
        let cardActions: (string|CardAction)[] = [];
        for (const action of actions) {
            if (typeof action === 'string') {
                cardActions.push(action.trim());
            } else {
                const cardAction: CardAction = this.getCardAction(action);
                if (cardAction !== undefined) {
                    cardActions.push(cardAction);
                }
            }
        }

        return CardFactory.actions(cardActions);
    }

    private static getCardAction(cardActionValue: any): CardAction {
        const type: string = this.getStructureType(cardActionValue);
        let cardAction: CardAction = {
            type: ActionTypes.ImBack,
            title: '',
            value: ''
        };

        if(type !== 'cardaction') {
            return undefined;
        }

        for (const key of Object.keys(cardActionValue)) {
            const property: string = key.trim();
            const value: any = cardActionValue[key];

            switch (property.toLowerCase()) {
                case 'type':
                    cardAction.type = value.toString();
                    break;
                case 'title':
                    cardAction.title = value.toString();
                    break;
                case 'value':
                    cardAction.value = value.toString();
                    break;
                case 'displaytext':
                    cardAction.displayText = value.toString();
                    break;
                case 'text':
                    cardAction.text = value.toString();
                    break;
                case 'image':
                    cardAction.image = value.toString();
                    break;
                default:
                    cardAction[property] = value;
                    break;
            }
        }

        return cardAction;
    }

    private static getStructureType(input: any): string {
        let result = '';

        if (input !== undefined) {
            if ('$type' in input) {
                result = input['$type'].toString();
            } else if ('type' in input) {
                result = input['type'].toString();
            }
        }

        return result.trim().toLowerCase();
    }

    private static getAttachments(input: any): Attachment[] {
        let attachments: Attachment[] = [];
        let attachmentsJsonList: any[] = this.normalizedToList(input);

        for (const attachmentsJson of attachmentsJsonList) {
            if (typeof attachmentsJson === 'object') {
                const attachment = this.getAttachment(attachmentsJson);
                if (attachment !== undefined) {
                    attachments.push(attachment);
                } else {
                    throw new Error(`'${ attachmentsJson }' is not an attachment format.`);
                }
            } else {
                throw new Error(`'${ attachmentsJson }' is not an attachment format.`);
            }
        }

        return attachments;
    }

    private static getAttachment(input: any): Attachment {
        let attachment: Attachment = {
            contentType: ''
        };
        const type: string = this.getStructureType(input);
        if (ActivityFactory.genericCardTypeMapping.has(type)) {
            attachment = this.getCardAttachment(ActivityFactory.genericCardTypeMapping.get(type), input);
        } else if(type === 'adaptivecard') {
            attachment = CardFactory.adaptiveCard(input);
        } else {
            attachment = undefined;
        }

        return attachment;
    }

    private static getCardAttachment(type: string, input: any): Attachment {
        let card: any = {};

        for (const key in input) {
            const property: string = key.trim().toLowerCase();
            const value: any = input[key];

            switch (property) {
                case 'title':
                case 'subtitle':
                case 'text':
                case 'aspect':
                case 'value':
                    card[property] = value;
                    break;
                case 'connectionname':
                    card['connectionName'] = value;
                    break;
                
                case 'image':
                case 'images':
                    if (type === CardFactory.contentTypes.heroCard || type === CardFactory.contentTypes.thumbnailCard) {
                        if (!('images' in card)) {
                            card['images'] = [];
                        }

                        let imageList: string[] = this.normalizedToList(value).map((u): string => u.toString());
                        imageList.forEach( (u): any => card['images'].push({url : u}));
                    } else {
                        card['image'] = {url: value.toString()};
                    }
                    break;
                case 'media':
                    if (!('media' in card)) {
                        card['media'] = [];
                    }

                    let mediaList: string[] = this.normalizedToList(value).map((u): string => u.toString());
                    mediaList.forEach( (u): any => card['media'].push({url : u}));
                    break;
                case 'buttons':
                    if (!('buttons' in card)) {
                        card['buttons'] = [];
                    }

                    let buttons: any[] = this.getButtons(value);
                    buttons.forEach( (u): any => card[property].push(u));
                    break;
                case 'autostart':
                case 'shareable':
                case 'autoloop':
                    if (value.toString().toLowerCase() === 'true') {
                        card[property] = true;
                    } else if (value.toString().toLowerCase() === 'false') {
                        card[property] = false;
                    }
                    break;
                default:
                    card[property] = value;
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
        } else if (Array.isArray(item)){
            return item;
        } else {
            return [item];
        }
    }

}