"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const intentRecognizer_1 = require("./intentRecognizer");
const entityObject_1 = require("./entityObject");
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
class AttachmentRecognizer extends intentRecognizer_1.IntentRecognizer {
    /**
     * Creates a new instance of the recognizer.
     *
     * @param settings (Optional) settings to customize the recognizer.
     */
    constructor(settings) {
        super();
        this.typeFilters = [];
        this.settings = Object.assign({
            intentName: 'Intents.AttachmentsReceived'
        }, settings);
        this.onRecognize((context) => {
            const intents = [];
            if (context.request.attachments && context.request.attachments.length > 0) {
                // Map attachments to entities
                const entities = [];
                context.request.attachments.forEach((a) => entities.push({
                    type: a.contentType || entityObject_1.EntityTypes.attachment,
                    score: 1.0,
                    value: a
                }));
                // Filter by content type
                if (this.typeFilters.length > 0) {
                    // Sort by content type
                    const matches = {};
                    entities.forEach((entity) => {
                        if (matches.hasOwnProperty(entity.type)) {
                            matches[entity.type].push(entity);
                        }
                        else {
                            matches[entity.type] = [entity];
                        }
                    });
                    // Return intents for matches
                    this.typeFilters.forEach((filter) => {
                        const stringFilter = typeof filter.type === 'string';
                        for (const type in matches) {
                            let addIntent;
                            if (stringFilter) {
                                addIntent = type === filter.type;
                            }
                            else {
                                addIntent = filter.type.test(type);
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
                }
                else {
                    // Return a single intent for all attachments
                    intents.push({
                        score: 1.0,
                        name: this.settings.intentName,
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
    contentType(contentType, intentName) {
        this.typeFilters.push({ type: contentType, intentName: intentName });
        return this;
    }
}
exports.AttachmentRecognizer = AttachmentRecognizer;
//# sourceMappingURL=attachmentRecognizer.js.map