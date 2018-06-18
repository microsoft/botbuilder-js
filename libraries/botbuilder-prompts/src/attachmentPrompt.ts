/**
 * @module botbuilder-prompts
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Promiseable, Activity, Attachment, TurnContext } from 'botbuilder';
import { PromptValidator } from './textPrompt';
import { sendPrompt } from './internal';

/** 
 * Prompts the user to upload one or more attachments. 
 *
 * @remarks
 * This example shows how to create a new attachment prompt:
 *
 * ```JavaScript
 * const { createAttachmentPrompt } = require('botbuilder-prompts');
 * 
 * const imagePrompt = createAttachmentPrompt();
 * ```
 * @param O (Optional) type of result returned by the [recognize()](#recognize) method. This defaults to an `attachment[]` but can be changed by the prompts custom validator.
 */
export interface AttachmentPrompt<O = Attachment[]> {
    /**
     * Sends a formated prompt to the user. 
     *
     * @remarks
     * This example shows how to send a prompt to the user:
     *
     * ```JavaScript
     * await imagePrompt.prompt(context, `Upload an image(s).`);
     * ```
     * @param context Context for the current turn of conversation.
     * @param prompt Text or activity to send as the prompt.
     * @param speak (Optional) SSML that should be spoken for prompt. The prompts `inputHint` will be automatically set to `expectingInput`.
     */
    prompt(context: TurnContext, prompt: string|Partial<Activity>, speak?: string): Promise<void>;

    /**
     * Recognizes and validates the users reply. 
     * 
     * @remarks
     * The result of the call will either be the recognized value or `undefined`. 
     * 
     * The recognize() method will not automatically re-prompt the user so either the caller or the
     * prompts custom validator will need to implement re-prompting logic.
     * 
     * ```JavaScript
     * const images = await imagePrompt.recognize(context);
     * if (images) {
     *    // Process images
     * }
     * ```
     * @param context Context for the current turn of conversation.
     */
    recognize(context: TurnContext): Promise<O|undefined>;
}

/**
 * Creates a new prompt that asks the user to upload one or more attachments.
 *
 * @remarks
 * This example shows creating a prompt with a custom validator that ensures an image attachment has
 * been uploaded by the user:
 *
 * ```JavaScript
 * const { createAttachmentPrompt } = require('botbuilder-prompts');
 * 
 * const imagePrompt = createAttachmentPrompt(async (context, values) => {
 *    if (values && values.length > 0) {
 *       for (let i = 0; i < values.length; i++) {
 *          if (!values[i].contentType.startsWith('image')) {
 *             await imagePrompt.prompt(context, `Only images are accepted.`);
 *             return undefined;
 *          }
 *       }
 *    } else {
 *       await imagePrompt.prompt(context, `Please upload at least one image.`);
 *    }
 *    return values;
 * });
 * ```
 * @param O (Optional) type of result returned by the `recognize()` method. This defaults to an `attachment[]` but can be changed by the prompts custom validator.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 */
export function createAttachmentPrompt<O = Attachment[]>(validator?: PromptValidator<Attachment[], O>): AttachmentPrompt<O> {
    return {
        prompt: function prompt(context, prompt, speak) {
            return sendPrompt(context, prompt, speak);
        },
        recognize: function recognize(context) {
            const values = context.activity ? context.activity.attachments : undefined;
            return Promise.resolve(validator ? validator(context, values) : values as any);
        }
    };
}
