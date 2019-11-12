/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActionTypes, AnimationCard, Attachment, AudioCard, CardAction, CardImage, HeroCard, MediaUrl, OAuthCard, O365ConnectorCard, ReceiptCard, SigninCard, ThumbnailCard, VideoCard } from 'botframework-schema';

/**
 * Provides methods for formatting the various card types a bot can return.
 *
 * @remarks
 * All of these functions return an [Attachment](xref:botframework-schema.Attachment) object,
 * which can be added to an existing activity's [attachments](xref:botframework-schema.Activity.attachments) collection directly or
 * passed as input to one of the [MessageFactory](xref:botbuilder-core.MessageFactory) methods to generate a new activity.
 *
 * This example sends a message that contains a single hero card.
 *
 * ```javascript
 * const { MessageFactory, CardFactory } = require('botbuilder');
 *
 * const card = CardFactory.heroCard(
 *      'White T-Shirt',
 *      ['https://example.com/whiteShirt.jpg'],
 *      ['buy']
 * );
 * const message = MessageFactory.attachment(card);
 * await context.sendActivity(message);
 * ```
 */
export class CardFactory {
    /**
     * Lists the content type schema for each card style.
     */
    public static contentTypes: any = {
        adaptiveCard: 'application/vnd.microsoft.card.adaptive',
        animationCard: 'application/vnd.microsoft.card.animation',
        audioCard: 'application/vnd.microsoft.card.audio',
        heroCard: 'application/vnd.microsoft.card.hero',
        receiptCard: 'application/vnd.microsoft.card.receipt',
        oauthCard: 'application/vnd.microsoft.card.oauth',
        o365ConnectorCard: 'application/vnd.microsoft.teams.card.o365connector',
        signinCard: 'application/vnd.microsoft.card.signin',
        thumbnailCard: 'application/vnd.microsoft.card.thumbnail',
        videoCard: 'application/vnd.microsoft.card.video'
    };

    /**
     * Returns an attachment for an Adaptive Card.
     *
     * @param card A description of the Adaptive Card to return.
     * 
     * @remarks
     * Adaptive Cards are an open card exchange format enabling developers to exchange UI content in a common and consistent way.
     * For channels that don't yet support Adaptive Cards natively, the Bot Framework will
     * down-render the card to an image that's been styled to look good on the target channel. For
     * channels that support [hero cards](#herocards) you can continue to include Adaptive Card
     * actions and they will be sent as buttons along with the rendered version of the card.
     *
     * For more information about Adaptive Cards and to download the latest SDK, visit
     * [adaptivecards.io](http://adaptivecards.io/).
     *
     * For example:
     * ```JavaScript
     * const card = CardFactory.adaptiveCard({
     *   "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
     *   "type": "AdaptiveCard",
     *   "version": "1.0",
     *   "body": [
     *       {
     *          "type": "TextBlock",
     *          "text": "Default text input"
     *       }
     *   ],
     *   "actions": [
     *       {
     *          "type": "Action.Submit",
     *          "title": "OK"
     *       }
     *   ]
     * });
     * ```
     */
    public static adaptiveCard(card: any): Attachment {
        return { contentType: CardFactory.contentTypes.adaptiveCard, content: card };
    }

    /**
     * Returns an attachment for an animation card.
     * 
     * @param title The card title.
     * @param media The media URLs for the card.
     * @param buttons Optional. The array of buttons to include on the card. Each `string` in the array
     *      is converted to an `imBack` button with a title and value set to the value of the string.
     * @param other Optional. Any additional properties to include on the card.
     */
    public static animationCard(
        title: string,
        media: (MediaUrl | string)[],
        buttons?: (CardAction | string)[],
        other?: Partial<AnimationCard>
    ): Attachment {
        return mediaCard(CardFactory.contentTypes.animationCard, title, media, buttons, other);
    }

    /**
     * Returns an attachment for an audio card.
     * 
     * @param title The card title.
     * @param media The media URL for the card.
     * @param buttons Optional. The array of buttons to include on the card. Each `string` in the array
     *      is converted to an `imBack` button with a title and value set to the value of the string.
     * @param other Optional. Any additional properties to include on the card.
     */
    public static audioCard(
        title: string,
        media: (MediaUrl | string)[],
        buttons?: (CardAction | string)[],
        other?: Partial<AudioCard>
    ): Attachment {
        return mediaCard(CardFactory.contentTypes.audioCard, title, media, buttons, other);
    }

    /**
     * Returns an attachment for a hero card.
     *
     * @param title The card title.
     * @param text Optional. The card text.
     * @param images Optional. The array of images to include on the card. Each element can be a
     *      [CardImage](ref:botframework-schema.CardImage) or the URL of the image to include.
     * @param buttons Optional. The array of buttons to include on the card. Each `string` in the array
     *      is converted to an `imBack` button with a title and value set to the value of the string.
     * @param other Optional. Any additional properties to include on the card.
     * 
     * @remarks
     * Hero cards tend to have one dominant, full-width image.
     * Channels typically render the card's text and buttons below the image.
     * 
     * For example:
     * ```javascript
     * const card = CardFactory.heroCard(
     *      'White T-Shirt',
     *      ['https://example.com/whiteShirt.jpg'],
     *      ['buy']
     * );
     * ```
     */
    public static heroCard(
        title: string,
        images?: (CardImage | string)[],
        buttons?: (CardAction | string)[],
        other?: Partial<HeroCard>
    ): Attachment;
    public static heroCard(
        title: string,
        text: string,
        images?: (CardImage | string)[],
        buttons?: (CardAction | string)[],
        other?: Partial<HeroCard>
    ): Attachment;
    public static heroCard(
        title: string,
        text?: any,
        images?: any,
        buttons?: any,
        other?: Partial<HeroCard>
    ): Attachment {
        const a: Attachment = CardFactory.thumbnailCard(title, text, images, buttons, other);
        a.contentType = CardFactory.contentTypes.heroCard;
        return a;
    }

    /**
     * Returns an attachment for an OAuth card.
     * 
     * @param connectionName The name of the OAuth connection to use.
     * @param title The title for the card's sign-in button.
     * @param text Optional. Additional text to include on the card.
     * @param link Optional. The sign-in link to use.
     * 
     * @remarks
     * OAuth cards support the Bot Framework's single sign on (SSO) service.
     */
    public static oauthCard(connectionName: string, title: string, text?: string, link?: string): Attachment {
        const card: Partial<OAuthCard> = {
            buttons: [
                { type: ActionTypes.Signin, title: title, value: link, channelData: undefined }
            ],
            connectionName: connectionName
        };
        if (text) { card.text = text; }

        return { contentType: CardFactory.contentTypes.oauthCard, content: card };
    }


    /**
    * Returns an attachment for an Office 365 connector card.
    *
    * @param card a description of the Office 365 connector card to return.
    * 
    * @remarks
    * For example:
    * ```JavaScript
    * const card = CardFactory.o365ConnectorCard({
    *   "title": "card title",
    *   "text": "card text",
    *   "summary": "O365 card summary",
    *   "themeColor": "#E67A9E",
    *   "sections": [
    *       {
    *           "title": "**section title**",
    *           "text": "section text",
    *           "activityTitle": "activity title",
    *       }
    *   ]
    * });
    * ```
    */
    public static o365ConnectorCard(card: O365ConnectorCard): Attachment {
        return { contentType: CardFactory.contentTypes.o365ConnectorCard, content: card };
    }

    /**
     * Returns an attachment for a receipt card.
     * 
     * @param card A description of the receipt card to return.
     */
    public static receiptCard(card: ReceiptCard): Attachment {
        return { contentType: CardFactory.contentTypes.receiptCard, content: card };
    }

    /**
     * Returns an attachment for a sign-in card.
     *
     * @param title The title for the card's sign-in button.
     * @param url The URL of the sign-in page to use.
     * @param text Optional. Additional text to include on the card.
     * 
     * @remarks
     * For channels that don't natively support sign-in cards, an alternative message is rendered.
     */
    public static signinCard(title: string, url: string, text?: string): Attachment {
        const card: SigninCard = { buttons: [{ type: ActionTypes.Signin, title: title, value: url, channelData: undefined }] };
        if (text) { card.text = text; }

        return { contentType: CardFactory.contentTypes.signinCard, content: card };
    }

    /**
     * Returns an attachment for a thumbnail card.
     *
     * @param title The card title.
     * @param text Optional. The card text.
     * @param images Optional. The array of images to include on the card. Each element can be a
     *      [CardImage](ref:botframework-schema.CardImage) or the URL of the image to include.
     * @param buttons Optional. The array of buttons to include on the card. Each `string` in the array
     *      is converted to an `imBack` button with a title and value set to the value of the string.
     * @param other Optional. Any additional properties to include on the card.
     * 
     * @remarks
     * Thumbnail cards are similar to hero cards but instead of a full width image,
     * they're typically rendered with a smaller thumbnail version of the image.
     * Channels typically render the card's text to one side of the image,
     * with any buttons displayed below the card.
     */
    public static thumbnailCard(
        title: string,
        images?: (CardImage | string)[],
        buttons?: (CardAction | string)[],
        other?: Partial<ThumbnailCard>
    ): Attachment;
    public static thumbnailCard(
        title: string,
        text: string,
        images?: (CardImage | string)[],
        buttons?: (CardAction | string)[],
        other?: Partial<ThumbnailCard>
    ): Attachment;
    public static thumbnailCard(
        title: string,
        text?: any,
        images?: any,
        buttons?: any,
        other?: Partial<ThumbnailCard>
    ): Attachment {
        if (typeof text !== 'string') {
            other = buttons;
            buttons = images;
            images = text;
            text = undefined;
        }
        const card: Partial<ThumbnailCard> = { ...other };
        if (title) { card.title = title; }
        if (text) { card.text = text; }
        if (images) { card.images = CardFactory.images(images); }
        if (buttons) { card.buttons = CardFactory.actions(buttons); }

        return { contentType: CardFactory.contentTypes.thumbnailCard, content: card };
    }

    /**
     * Returns an attachment for a video card.
     * 
     * @param title The card title.
     * @param media The media URLs for the card.
     * @param buttons Optional. The array of buttons to include on the card. Each `string` in the array
     *      is converted to an `imBack` button with a title and value set to the value of the string.
     * @param other Optional. Any additional properties to include on the card.
     */
    public static videoCard(
        title: string,
        media: (MediaUrl | string)[],
        buttons?: (CardAction | string)[],
        other?: Partial<VideoCard>
    ): Attachment {
        return mediaCard(CardFactory.contentTypes.videoCard, title, media, buttons, other);
    }

    /**
     * Returns a properly formatted array of actions.
     *
     * @param actions The array of action to include on the card. Each `string` in the array
     *      is converted to an `imBack` button with a title and value set to the value of the string.
     */
    public static actions(actions: (CardAction | string)[] | undefined): CardAction[] {
        const list: CardAction[] = [];
        (actions || []).forEach((a: (CardAction | string)) => {
            if (typeof a === 'object') {
                list.push(a);
            } else {
                list.push({ type: ActionTypes.ImBack, value: a.toString(), title: a.toString(), channelData: undefined });
            }
        });

        return list;
    }

    /**
     * Returns a properly formatted array of card images.
     * 
     * @param images The array of images to include on the card. Each element can be a
     *      [CardImage](ref:botframework-schema.CardImage) or the URL of the image to include.
     */
    public static images(images: (CardImage | string)[] | undefined): CardImage[] {
        const list: CardImage[] = [];
        (images || []).forEach((img: (CardImage | string)) => {
            if (typeof img === 'object') {
                list.push(img);
            } else {
                list.push({ url: img });
            }
        });

        return list;
    }

    /**
     * Returns a properly formatted array of media URL objects.
     * 
     * @param links The media URLs. Each `string` is converted to a media URL object.
     */
    public static media(links: (MediaUrl | string)[] | undefined): MediaUrl[] {
        const list: MediaUrl[] = [];
        (links || []).forEach((lnk: (MediaUrl | string)) => {
            if (typeof lnk === 'object') {
                list.push(lnk);
            } else {
                list.push({ url: lnk });
            }
        });

        return list;
    }
}

/**
 * @private
 */
function mediaCard(contentType: string,
    title: string,
    media: (MediaUrl | string)[],
    buttons?: (CardAction | string)[],
    other?: any): Attachment {
    const card: VideoCard = { ...other };
    if (title) { card.title = title; }
    card.media = CardFactory.media(media);
    if (buttons) { card.buttons = CardFactory.actions(buttons); }

    return { contentType: contentType, content: card };
}
