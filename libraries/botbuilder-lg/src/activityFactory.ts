/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {Activity, SuggestedActions, Attachment, ActivityTypes, ActionTypes, CardAction} from 'botframework-schema';
import {MessageFactory, CardFactory} from 'botbuilder-core';

export class ActivityFactory {
    private static GenericCardTypeMapping: Map<string, string> = new Map<string, string>
    ([
        [ 'herocard', CardFactory.contentTypes.heroCard ],
        [ 'thumbnailcard', CardFactory.contentTypes.thumbnailCard ],
        [ 'audiocard', CardFactory.contentTypes.audioCard ],
        [ 'videocard', CardFactory.contentTypes.videoCard ],
        [ 'animationcard', CardFactory.contentTypes.animationCard ],
        [ 'signincard', CardFactory.contentTypes.signinCard ],
        [ 'oauthcard', CardFactory.contentTypes.oauthCard ],
    ]);

    public static CreateActivity(lgStringResult: string): Activity {
        let lgStructuredResult: any;
        try {
            lgStructuredResult = JSON.parse(lgStringResult);
        } catch (error) {
            return this.buildActivityFromText(lgStructuredResult.trim());
        }

        return this.buildActivityFromLGStructuredResult(lgStructuredResult);
    }

    private static buildActivityFromText(text: string): Activity {
        return MessageFactory.text(text, text) as Activity;
    }

    private static buildActivityFromLGStructuredResult(lgJObj: any): Activity {
        let activity: any = {};

        const type: string = this.getStructureType(lgJObj);
        if (ActivityFactory.GenericCardTypeMapping.has(type)) {
            const attachment: Attachment = this.getAttachment(lgJObj);
            if (attachment !== undefined) {
                activity = MessageFactory.attachment(attachment);
            }
        } else if (type === 'activity') {
            activity = this.buildActivityFromObject(lgJObj);
        } else {
            throw new Error(`type ${ type } is not support currently.`);
        }

        return activity;
    }

    private static buildActivityFromObject(lgJObj: any): Activity {
        let activity: any = {};

        if ('type' in lgJObj && lgJObj.type === 'event') {
            activity = this.buildEventActivity(lgJObj);
        } else {
            activity = this.buildMessageActivity(lgJObj);
        }

        return activity;
    }

    private static buildEventActivity(lgJObj: any): Activity {
        let activity: any = { type: ActivityTypes.Event };
        for (const item of Object.keys(lgJObj)) {
            const property: string = item.trim();
            const value: any = lgJObj[item];
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
                    console.log(`Skipping unknown activity property ${ property }`);
                    break;
            }
        }

        return activity;
    }

    private static buildMessageActivity(lgJObj: any): Activity {
        let activity: any = { type: ActivityTypes.Message };
        for (const key of Object.keys(lgJObj)) {
            const property: string = key.trim();
            const value: any = lgJObj[key];

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
                    activity.AttachmentLayout = value.toString();
                default:
                    console.log(`Skipping unknown activity property ${ property }`);
                    break;
            }
        }

        return activity;
    }

    private static getSuggestions(value: any): SuggestedActions {
        let suggestedActions: SuggestedActions = {
            actions : [],
            to: []
        };

        let actions: any[] = this.normalizedToList(value);

        for (const action of actions) {
            if (typeof action === 'string') {
                const actionStr: string = action.trim();
                suggestedActions.actions.push({
                    type: ActionTypes.MessageBack,
                    title: actionStr,
                    displayText: actionStr,
                    text: actionStr,
                    value: actionStr
                });
            } else {
                const cardAction: CardAction = this.getCardAction('', action);
                if (cardAction !== undefined) {
                    suggestedActions.actions.push(cardAction);
                }
            }
        }

        return suggestedActions;
    }

    private static getButtons(cardType: string, value: any): CardAction[] {
        let buttons: any[] = [];
        let actions: any[] = this.normalizedToList(value);

        for (const action of actions) {
            if (typeof action === 'string') {
                const actionStr = action.trim();
                if (cardType === CardFactory.contentTypes.signinCard ||cardType === CardFactory.contentTypes.oauthCard ) {
                    buttons.push({
                        type: ActionTypes.Signin,
                        title: actionStr,
                        value: actionStr
                    });
                } else {
                    buttons.push({
                        type: ActionTypes.ImBack,
                        title: actionStr,
                        value: actionStr
                    });
                }
                
            } else {
                const cardAction: CardAction = this.getCardAction(cardType, action);
                if (cardAction !== undefined) {
                    buttons.push(cardAction);
                }
            }
        }

        return buttons;
    }

    private static getCardAction(cardType: string, cardActionJObj: any): CardAction {
        const type: string = this.getStructureType(cardActionJObj);
        let cardAction: any = {};

        if (cardType === CardFactory.contentTypes.signinCard || cardType === CardFactory.contentTypes.oauthCard) {
            cardAction.type = ActionTypes.Signin;
        } else {
            cardAction.type = ActionTypes.ImBack;
        }

        if(type !== 'cardaction') {
            return undefined;
        }

        for (const key of Object.keys(cardActionJObj)) {
            const property: string = key.trim();
            const value: any = cardActionJObj[key];

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
                    console.log(`Skipping unknown activity property ${ property }`);
                    break;
            }
        }

        return cardAction as CardAction;
    }

    private static getStructureType(jObj: any): string {
        let result = '';

        if (jObj !== undefined) {
            if ('$type' in jObj) {
                result = jObj['$type'].toString();
            } else if ('type' in jObj) {
                result = jObj['type'].toString();
            }
        }

        return result.trim().toLowerCase();
    }

    private static getAttachments(value: any): Attachment[] {
        let attachments = [];
        let attachmentsJsonList: any[] = this.normalizedToList(value);

        for (const attachmentsJson of attachmentsJsonList) {
            if (typeof attachmentsJson === 'object') {
                const attachment = this.getAttachment(attachmentsJson);
                if (attachment !== undefined) {
                    attachments.push(attachment);
                }
            }
        }

        return attachments;
    }

    private static getAttachment(lgJObj: any): Attachment {
        let attachment: any = {};
        const type: string = this.getStructureType(lgJObj);
        if (ActivityFactory.GenericCardTypeMapping.has(type)) {
            attachment = this.getCardAttachment(ActivityFactory.GenericCardTypeMapping.get(type), lgJObj);
        } else if(type === 'adaptivecard') {
            attachment.contentType = CardFactory.contentTypes.adaptiveCard;
            attachment.content = lgJObj;
        } else {
            attachment = undefined;
        }

        return attachment as Attachment;
    }

    private static getCardAttachment(type: string, lgJObj: any): Attachment {
        let card: any = {};

        for (const key in lgJObj) {
            const property: string = key.trim().toLowerCase();
            const value: any = lgJObj[key];

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

                    let buttons: any[] = this.getButtons(type, value);
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
                case '':
                    break;
                default:
                    console.log(`Skipping unknown activity property ${ property }`);
                    break;
            }
        }

        return {
            contentType: type,
            content: card
        };
    }

    private static normalizedToList(item: any): any[] {
        if (item === undefined) {
            return [];
        } else if (item instanceof Array){
            return item;
        } else {
            return [item];
        }
    }

}