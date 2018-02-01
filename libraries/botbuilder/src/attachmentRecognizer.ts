/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Intent, IntentRecognizer } from './intentRecognizer';
import { EntityObject, EntityTypes } from './entityObject';
import { Attachment } from './index';

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
export class AttachmentRecognizer extends IntentRecognizer {
    private settings: AttachmentRecognizerSettings;
    private typeFilters: ContentTypeFilter[] = [];

    /**
     * Creates a new instance of the recognizer.
     *
     * @param settings (Optional) settings to customize the recognizer.
     */
    constructor(settings?: Partial<AttachmentRecognizerSettings>) {
        super();
        this.settings = Object.assign(<AttachmentRecognizerSettings>{
            intentName: 'Intents.AttachmentsReceived'
        }, settings);

        this.onRecognize((context) => {
            const intents: Intent[] = [];
            if (context.request.attachments && context.request.attachments.length > 0) {
                // Map attachments to entities
                const entities: EntityObject<Attachment>[] = [];
                context.request.attachments.forEach((a) => entities.push({ 
                    type: a.contentType || EntityTypes.attachment, 
                    score: 1.0, 
                    value: a 
                }));

                // Filter by content type
                if (this.typeFilters.length > 0) {
                    // Sort by content type
                    const matches: { [type: string]: EntityObject<Attachment>[] } = {};
                    entities.forEach((entity) => {
                        if (matches.hasOwnProperty(entity.type)) {
                            matches[entity.type].push(entity);
                        } else {
                            matches[entity.type] = [entity];
                        }
                    });

                    // Return intents for matches
                    this.typeFilters.forEach((filter) => {
                        const stringFilter = typeof filter.type === 'string';
                        for (const type in matches) {
                            let addIntent: boolean;
                            if (stringFilter) {
                                addIntent = type === filter.type;
                            } else {
                                addIntent = (<RegExp>filter.type).test(type);
                            }
                            if (addIntent) {
                                intents.push({
                                    score: 1.0,
                                    name: filter.intentName,
                                    entities: matches[type]
                                });
                            }
                        }
                    });
                } else {
                    // Return a single intent for all attachments
                    intents.push({ 
                        score: 1.0, 
                        name: <string>this.settings.intentName,
                        entities: entities
                    });
                }
            }
            return intents;
        });
    }

    /** 
     * Add a new content type filter to the recognizer. Adding one or more `contentType()` filters
     * will result in only attachments of the specified type(s) being recognized.
     *
     * @param contentType The `Attachment.contentType` to look for.
     * @param intentName Name of the intent to return when the given type is matched. 
     */
    public contentType(contentType: string|RegExp, intentName: string): this {
        this.typeFilters.push({ type: contentType, intentName: intentName });
        return this;
    }
}

interface ContentTypeFilter {
    type: string|RegExp;
    intentName: string;
}