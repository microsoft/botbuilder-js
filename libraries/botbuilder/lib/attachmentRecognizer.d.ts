/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IntentRecognizer } from './intentRecognizer';
/** Optional settings for an `AttachmentRecognizer`. */
export interface AttachmentRecognizerSettings {
    /**
     * Name of the intent to return when an attachment is detected. This defaults to
     * a value of "Intents.AttachmentReceived".
     *
     * Developers can also adjust the name of the intent returned by adding content filters to
     * the recognizer. This setting will be ignored when content filters are active.
     */
    intentName: string;
}
/**
 * An intent recognizer for detecting that the user has uploaded an attachment.
 *
 * **Usage Example**
 *
 * ```js
 * const bot = new Bot(adapter)
 *      .use(new AttachmentRecognizer())
 *      .onReceive((context) => {
 *          if (context.ifIntent('Intents.AttachmentsReceived')) {
 *              // ... process uploaded file
 *          } else {
 *              // ... default logic
 *          }
 *      });
 * ```
 */
export declare class AttachmentRecognizer extends IntentRecognizer {
    private settings;
    private typeFilters;
    /**
     * Creates a new instance of the recognizer.
     *
     * @param settings (Optional) settings to customize the recognizer.
     */
    constructor(settings?: Partial<AttachmentRecognizerSettings>);
    /**
     * Add a new content type filter to the recognizer. Adding one or more `contentType()` filters
     * will result in only attachments of the specified type(s) being recognized.
     *
     * @param contentType The `Attachment.contentType` to look for.
     * @param intentName Name of the intent to return when the given type is matched.
     */
    contentType(contentType: string | RegExp, intentName: string): this;
}
