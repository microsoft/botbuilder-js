/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Attachment, MediaUrl, CardAction, AnimationCard, CardImage, HeroCard, ReceiptCard, ThumbnailCard } from "botbuilder-core";
/**
 * A set of utility functions designed to assist with the formatting of the various card types a
 * bot can return.
 *
 * @remarks
 * All of these functions return an `Attachment` which can be added to an `Activity` directly or
 * passed as input to a `MessageFactory` method.
 *
 * ```javascript
 * const card = CardFactory.heroCard(
 *      'White T-Shirt',
 *      ['https://example.com/whiteShirt.jpg'],
 *      ['buy']
 * );
 * ```
 */
export declare class CardFactory {
    /** List of content types for each card style. */
    static contentTypes: {
        adaptiveCard: string;
        animationCard: string;
        audioCard: string;
        heroCard: string;
        receiptCard: string;
        oauthCard: string;
        signinCard: string;
        thumbnailCard: string;
        videoCard: string;
    };
    /**
     * Returns an attachment for an adaptive card. The attachment will contain the card and the
     * appropriate `contentType`.
     *
     * @remarks
     * Adaptive Cards are a new way for bots to send interactive and immersive card content to
     * users. For channels that don't yet support Adaptive Cards natively, the Bot Framework will
     * down render the card to an image that's been styled to look good on the target channel. For
     * channels that support [hero cards](#herocards) you can continue to include Adaptive Card
     * actions and they will be sent as buttons along with the rendered version of the card.
     *
     * For more information about Adaptive Cards and to download the latest SDK, visit
     * [adaptivecards.io](http://adaptivecards.io/).
     *
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
     * @param card The adaptive card to return as an attachment.
     */
    static adaptiveCard(card: any): Attachment;
    /**
     * Returns an attachment for an animation card.
     *
     * @param title The cards title.
     * @param media Media URL's for the card.
     * @param buttons (Optional) set of buttons to include on the card.
     * @param other (Optional) additional properties to include on the card.
     */
    static animationCard(title: string, media: (MediaUrl | string)[], buttons?: (CardAction | string)[], other?: Partial<AnimationCard>): Attachment;
    /**
     * Returns an attachment for an audio card.
     *
     * @param title The cards title.
     * @param media Media URL's for the card.
     * @param buttons (Optional) set of buttons to include on the card.
     * @param other (Optional) additional properties to include on the card.
     */
    static audioCard(title: string, media: (MediaUrl | string)[], buttons?: (CardAction | string)[], other?: Partial<AnimationCard>): Attachment;
    /**
     * Returns an attachment for a hero card.
     *
     * @remarks
     * Hero cards tend to have one dominant full width image and the cards text & buttons can
     * usually be found below the image.
     *
     * ```javascript
     * const card = CardFactory.heroCard(
     *      'White T-Shirt',
     *      ['https://example.com/whiteShirt.jpg'],
     *      ['buy']
     * );
     * ```
     * @param title The cards title.
     * @param text (Optional) text field for the card.
     * @param images (Optional) set of images to include on the card.
     * @param buttons (Optional) set of buttons to include on the card.
     * @param other (Optional) additional properties to include on the card.
     */
    static heroCard(title: string, images?: (CardImage | string)[], buttons?: (CardAction | string)[], other?: Partial<HeroCard>): Attachment;
    static heroCard(title: string, text: string, images?: (CardImage | string)[], buttons?: (CardAction | string)[], other?: Partial<HeroCard>): Attachment;
    /**
     * Returns an attachment for an OAuth card used by the Bot Frameworks Single Sign On (SSO) service.
     *
     * @param connectionName The name of the OAuth connection to use.
     * @param title Title of the cards signin button.
     * @param text (Optional) additional text to include on the card.
     */
    static oauthCard(connectionName: string, title: string, text?: string): Attachment;
    /**
     * Returns an attachment for a receipt card. The attachment will contain the card and the
     * appropriate `contentType`.
     *
     * @param card The adaptive card to return as an attachment.
     */
    static receiptCard(card: ReceiptCard): Attachment;
    /**
     * Returns an attachment for a signin card. For channels that don't natively support signin
     * cards an alternative message will be rendered.
     *
     * @param title Title of the cards signin button.
     * @param url The link to the signin page the user needs to visit.
     * @param text (Optional) additional text to include on the card.
     */
    static signinCard(title: string, url: string, text?: string): Attachment;
    /**
     * Returns an attachment for a thumbnail card. Thumbnail cards are similar to [hero cards](#herocard)
     * but instead of a full width image, they're typically rendered with a smaller thumbnail version of
     * the image on either side and the text will be rendered in column next to the image. Any buttons
     * will typically show up under the card.
     *
     * @param title The cards title.
     * @param text (Optional) text field for the card.
     * @param images (Optional) set of images to include on the card.
     * @param buttons (Optional) set of buttons to include on the card.
     * @param other (Optional) additional properties to include on the card.
     */
    static thumbnailCard(title: string, images?: (CardImage | string)[], buttons?: (CardAction | string)[], other?: Partial<ThumbnailCard>): Attachment;
    static thumbnailCard(title: string, text: string, images?: (CardImage | string)[], buttons?: (CardAction | string)[], other?: Partial<ThumbnailCard>): Attachment;
    /**
     * Returns an attachment for a video card.
     *
     * @param title The cards title.
     * @param media Media URLs for the card.
     * @param buttons (Optional) set of buttons to include on the card.
     * @param other (Optional) additional properties to include on the card.
     */
    static videoCard(title: string, media: (MediaUrl | string)[], buttons?: (CardAction | string)[], other?: Partial<AnimationCard>): Attachment;
    /**
     * Returns a properly formatted array of actions. Supports converting strings to `messageBack`
     * actions (note: using 'imBack' for now as 'messageBack' doesn't work properly in emulator.)
     *
     * @param actions Array of card actions or strings. Strings will be converted to `messageBack` actions.
     */
    static actions(actions: (CardAction | string)[] | undefined): CardAction[];
    /**
     * Returns a properly formatted array of card images.
     *
     * @param images Array of card images or strings. Strings will be converted to card images.
     */
    static images(images: (CardImage | string)[] | undefined): CardImage[];
    /**
     * Returns a properly formatted array of media url objects.
     *
     * @param links Array of media url objects or strings. Strings will be converted to a media url object.
     */
    static media(links: (MediaUrl | string)[] | undefined): MediaUrl[];
}
