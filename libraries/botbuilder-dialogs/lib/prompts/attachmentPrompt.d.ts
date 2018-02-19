/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Attachment } from 'botbuilder';
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator } from './prompt';
/**
 * Prompts a user to upload attachments like images. By default the prompt will return to the
 * calling dialog a `Attachment[]` but this can be overridden using a custom `PromptValidator`.
 *
 * **Example usage:**
 *
 * ```JavaScript
 * const { DialogSet, AttachmentPrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('attachmentPrompt', new AttachmentPrompt());
 *
 * dialogs.add('uploadImage', [
 *      function (context) {
 *          return dialogs.prompt(context, 'attachmentPrompt', `Send me image(s)`);
 *      },
 *      function (context, attachments) {
 *          context.reply(`Processing ${attachments.length} images.`);
 *          return dialogs.end(context);
 *      }
 * ]);
 * ```
 */
export declare class AttachmentPrompt implements Dialog {
    private validator;
    /**
     * Creates a new instance of the prompt.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * dialogs.add('imagePrompt', new AttachmentPrompt((context, values) => {
     *      if (values.length < 1) {
     *          context.reply(`Send me an image or say 'cancel'.`);
     *          return Prompts.resolve();
     *      } else {
     *          return dialogs.end(context, values);
     *      }
     * }));
     * ```
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     */
    constructor(validator?: PromptValidator<Attachment[]> | undefined);
    begin(context: BotContext, dialogs: DialogSet, options: PromptOptions): Promise<void>;
    continue(context: BotContext, dialogs: DialogSet): Promise<void>;
}
