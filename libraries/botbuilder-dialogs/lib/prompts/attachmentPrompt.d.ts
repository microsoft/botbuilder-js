/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Attachment } from 'botbuilder';
import { PromptValidator } from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { Prompt, PromptOptions } from './prompt';
/**
 * Prompts a user to upload attachments like images.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `Attachment[]` but this can be
 * overridden using a custom `PromptValidator`.
 *
 * #### Prompt Usage
 *
 * When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named
 * dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either
 * `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted to upload one or
 * more attachments which will be passed as an argument to the callers next waterfall step:
 *
 * ```JavaScript
 * const { DialogSet, AttachmentPrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('attachmentPrompt', new AttachmentPrompt());
 *
 * dialogs.add('uploadImage', [
 *      async function (dc) {
 *          await dc.prompt('attachmentPrompt', `Send me image(s)`);
 *      },
 *      async function (dc, attachments) {
 *          await dc.context.sendActivity(`Processing ${attachments.length} images.`);
 *          await dc.end();
 *      }
 * ]);
 * ```
 *
 * If the users response to the prompt fails to be recognized they will be automatically re-prompted
 * to try again. By default the original prompt is re-sent to the user but you can provide an
 * alternate prompt to send by passing in additional options:
 *
 * ```JavaScript
 * await dc.prompt('attachmentPrompt', `Send me image(s)`, { retryPrompt: `I didn't get anything. Send me an image.` });
 * ```
 *
 * The prompts retry logic can also be completely customized by passing the prompts constructor a
 * custom validator:
 *
 * ```JavaScript
 * dialogs.add('imagePrompt', new AttachmentPrompt(async (context, values) => {
 *    if (values && values.length > 0) {
 *       for (let i = 0; i < values.length; i++) {
 *          if (!values[i].contentType.startsWith('image')) {
 *             await context.sendActivity(`Only images are accepted.`);
 *             return undefined;
 *          }
 *       }
 *    } else {
 *       await context.sendActivity(`Please upload at least one image.`);
 *    }
 *    return values;
 * }));
 * ```
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param O (Optional) output type returned by prompt. This defaults to an `Attachment[]` but can be changed by a custom validator passed to the prompt.
 */
export declare class AttachmentPrompt<C extends TurnContext, O = Attachment[]> extends Prompt<C> {
    private prompt;
    /**
     * Creates a new `AttachmentPrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     */
    constructor(validator?: PromptValidator<Attachment[], O>);
    protected onPrompt(dc: DialogContext<C>, options: PromptOptions, isRetry: boolean): Promise<void>;
    protected onRecognize(dc: DialogContext<C>, options: PromptOptions): Promise<O | undefined>;
}
