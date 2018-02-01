/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as activity from './activity';
/**
 * A set of utility functions to assist with the formatting of the various message types a bot can
 * return.
 *
 * **Usage Example**
 *
 * ```js
 * // init message object
 * const message = MessageStyler.attachment(
 *     CardStyler.heroCard(
 *         'White T-Shirt',
 *         ['https://example.com/whiteShirt.jpg'],
 *         ['buy']
 *      )
 * );
 *
 * context.reply(message); // send message
 * ```
 */
export declare class MessageStyler {
    /**
     * Returns a simple text message.
     *
     * **Usage Example**
     *
     * ```js
     * // init message object
     * const basicMessage = MessageStyler.text('Greetings from example message');
     *
     * context.reply(basicMessage); // send message
     * ```
     *
     * @param text Text to include in the message.
     * @param speak (Optional) SSML to include in the message.
     */
    static text(text: string, speak?: string): Partial<activity.Activity>;
    /**
     * Returns a message that includes a set of suggested actions and optional text.
     *
     * @param actions Array of card actions or strings to include. Strings will be converted to `messageBack` actions.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static suggestedActions(actions: (activity.CardAction | string)[], text?: string, speak?: string): Partial<activity.Activity>;
    /**
     * Returns a single message activity containing an attachment.
     *
     * @param attachment Adaptive card to include in the message.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static attachment(attachment: activity.Attachment, text?: string, speak?: string): Partial<activity.Activity>;
    /**
     * Returns a message that will display a set of attachments in list form.
     *
     * @param attachments Array of attachments to include in the message.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static list(attachments: activity.Attachment[], text?: string, speak?: string): Partial<activity.Activity>;
    /**
     * Returns a message that will display a set of attachments using a carousel layout.
     *
     * **Usage Example**
     *
     * ```js
     * // init message object
     * let messageWithCarouselOfCards = MessageStyler.carousel([
     *   CardStyler.heroCard('title1', ['imageUrl1'], ['button1']),
     *   CardStyler.heroCard('title2', ['imageUrl2'], ['button2']),
     *   CardStyler.heroCard('title3', ['imageUrl3'], ['button3'])
     * ]);
     *
     * context.reply(messageWithCarouselOfCards); // send the message
     * ```
     *
     * @param attachments Array of attachments to include in the message.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static carousel(attachments: activity.Attachment[], text?: string, speak?: string): Partial<activity.Activity>;
    /**
     * Returns a message that will display a single image or video to a user.
     *
     * **Usage Example**
     *
     * ```js
     * // init message object
     * let imageOrVideoMessage = MessageStyler.contentUrl('url', 'content-type', 'optional-name', 'optional-text', 'optional-speak');
     *
     * context.reply(imageOrVideoMessage); // send the message
     * ```
     *
     * @param url Url of the image/video to send.
     * @param contentType The MIME type of the image/video.
     * @param name (Optional) Name of the image/video file.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     */
    static contentUrl(url: string, contentType: string, name?: string, text?: string, speak?: string): Partial<activity.Activity>;
}
