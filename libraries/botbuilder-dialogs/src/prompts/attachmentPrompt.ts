/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Attachment, TurnContext } from 'botbuilder';
import { Dialog, DialogTurnResult } from '../dialog';
import { Prompt, PromptOptions, PromptValidator } from './prompt';
import * as prompts from 'botbuilder-prompts';

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
 * @param O (Optional) output type returned by prompt. This defaults to an `Attachment[]` but can be changed by a custom validator passed to the prompt.
 */
export class AttachmentPrompt<O = Attachment[]> extends Prompt {
    private prompt: prompts.AttachmentPrompt<O>;

    /**
     * Creates a new `AttachmentPrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.  
     */
    constructor(dialogId: string, validator?: PromptValidator<Attachment[], O>) {
        super(dialogId, validator);
        this.prompt = prompts.createAttachmentPrompt(); 
    }

    protected async onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void> {
        if (isRetry && options.retryPrompt) {
            await this.prompt.prompt(context, options.retryPrompt, options.retrySpeak);
        } else if (options.prompt) {
            await this.prompt.prompt(context, options.prompt, options.speak);
        }
    }

    protected async onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<O|undefined> {
        return await this.prompt.recognize(context);
    }
}
