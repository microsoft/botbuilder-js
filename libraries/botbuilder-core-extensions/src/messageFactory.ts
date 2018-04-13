/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { CardFactory } from './cardFactory';
import { 
    ActivityTypes, AttachmentLayoutTypes, Activity, CardAction, 
    SuggestedActions, Attachment, InputHints 
} from 'botbuilder-core';

/**
 * :package: **botbuilder-core-extensions**
 * 
 * A set of utility functions to assist with the formatting of the various message types a bot can
 * return.
 *
 * **Usage Example**
 *
 * ```JavaScript
 * const message = MessageFactory.attachment(
 *     CardFactory.heroCard(
 *         'White T-Shirt',
 *         ['https://example.com/whiteShirt.jpg'],
 *         ['buy']
 *      )
 * );
 * await context.sendActivity(message);
 * ```
 */
export class MessageFactory {
    /**
     * Returns a simple text message.
     *
     * **Usage Example**
     *
     * ```JavaScript
     * const message = MessageFactory.text('Greetings from example message');
     * await context.sendActivity(message);
     * ```
     *
     * @param text Text to include in the message.
     * @param speak (Optional) SSML to include in the message.
     * @param inputHint (Optional) input hint for the message.
     */
    static text(text: string, speak?: string, inputHint?: InputHints|string): Partial<Activity> {
        const msg: Partial<Activity> = {
            type: ActivityTypes.Message,
            text: text
        };
        if (speak) { msg.speak = speak }
        if (inputHint) { msg.inputHint = inputHint }
        return msg;
    }

    /**
     * Returns a message that includes a set of suggested actions and optional text.
     *
     * ```JavaScript
     * const message = MessageFactory.suggestedActions(['red', 'green', 'blue'], `Choose a color`);
     * await context.sendActivity(message);
     * ```
     * @param actions Array of card actions or strings to include. Strings will be converted to `messageBack` actions.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     * @param inputHint (Optional) input hint for the message.
     */
    static suggestedActions(actions: (CardAction|string)[], text?: string, speak?: string, inputHint?: InputHints|string): Partial<Activity> {
        const msg: Partial<Activity> = {
            type: ActivityTypes.Message,
            suggestedActions: <SuggestedActions>{
                actions: CardFactory.actions(actions)
            }
        };
        if (text) { msg.text = text; }
        if (speak) { msg.speak = speak }
        if (inputHint) { msg.inputHint = inputHint }
        return msg;
    }

    /**
     * Returns a single message activity containing an attachment.
     *
     * **Usage Example**
     *
     * ```JavaScript
     * const message = MessageFactory.attachment(
     *     CardFactory.heroCard(
     *         'White T-Shirt',
     *         ['https://example.com/whiteShirt.jpg'],
     *         ['buy']
     *      )
     * );
     * await context.sendActivity(message);
     * ```
     *
     * @param attachment Adaptive card to include in the message.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     * @param inputHint (Optional) input hint for the message.
     */
    static attachment(attachment: Attachment, text?: string, speak?: string, inputHint?: InputHints|string): Partial<Activity> {
        return attachmentActivity(AttachmentLayoutTypes.List, [attachment], text, speak, inputHint);
    }

    /**
     * Returns a message that will display a set of attachments in list form.
     *
     * **Usage Example**
     *
     * ```JavaScript
     * const message = MessageFactory.list([
     *    CardFactory.heroCard('title1', ['imageUrl1'], ['button1']),
     *    CardFactory.heroCard('title2', ['imageUrl2'], ['button2']),
     *    CardFactory.heroCard('title3', ['imageUrl3'], ['button3'])
     * ]);
     * await context.sendActivity(message);
     * ```
     * @param attachments Array of attachments to include in the message.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     * @param inputHint (Optional) input hint for the message.
     */
    static list(attachments: Attachment[], text?: string, speak?: string, inputHint?: InputHints|string): Partial<Activity> {
        return attachmentActivity(AttachmentLayoutTypes.List, attachments, text, speak, inputHint);
    }

    /**
     * Returns a message that will display a set of attachments using a carousel layout.
     *
     * **Usage Example**
     *
     * ```JavaScript
     * const message = MessageFactory.carousel([
     *    CardFactory.heroCard('title1', ['imageUrl1'], ['button1']),
     *    CardFactory.heroCard('title2', ['imageUrl2'], ['button2']),
     *    CardFactory.heroCard('title3', ['imageUrl3'], ['button3'])
     * ]);
     * await context.sendActivity(message);
     * ```
     *
     * @param attachments Array of attachments to include in the message.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     * @param inputHint (Optional) input hint for the message.
     */
    static carousel(attachments: Attachment[], text?: string, speak?: string, inputHint?: InputHints|string): Partial<Activity> {
        return attachmentActivity(AttachmentLayoutTypes.Carousel, attachments, text, speak, inputHint);
    }

    /**
     * Returns a message that will display a single image or video to a user.
     *
     * **Usage Example**
     *
     * ```JavaScript
     * const message = MessageFactory.contentUrl('https://example.com/hawaii.jpg', 'image/jpeg', 'Hawaii Trip', 'A photo from our family vacation.');
     * await context.sendActivity(message);
     * ```
     *
     * @param url Url of the image/video to send.
     * @param contentType The MIME type of the image/video.
     * @param name (Optional) Name of the image/video file.
     * @param text (Optional) text of the message.
     * @param speak (Optional) SSML to include with the message.
     * @param inputHint (Optional) input hint for the message.
     */
    static contentUrl(url: string, contentType: string, name?: string, text?: string, speak?: string, inputHint?: InputHints|string): Partial<Activity> {
        const a: Attachment = { contentType: contentType, contentUrl: url };
        if (name) { a.name = name; }
        return attachmentActivity(AttachmentLayoutTypes.List, [a], text, speak, inputHint);
    }
}


function attachmentActivity(attachmentLayout: AttachmentLayoutTypes, attachments: Attachment[], text?: string, speak?: string, inputHint?: InputHints|string): Partial<Activity> {
    const msg: Partial<Activity> = {
        type: ActivityTypes.Message,
        attachmentLayout: attachmentLayout,
        attachments: attachments
    };
    if (text) { msg.text = text }
    if (speak) { msg.speak = speak }
    if (inputHint) { msg.inputHint = inputHint }
    return msg;
}