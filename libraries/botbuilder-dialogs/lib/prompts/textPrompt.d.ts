/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Prompt, PromptOptions, PromptValidator, PromptRecognizerResult } from './prompt';
/**
 * Prompts a user to enter some text.
 *
 * @remarks
 * By default the prompt will return to the calling dialog a `string` representing the users reply.
 */
export declare class TextPrompt extends Prompt<string> {
    /**
     * Creates a new `TextPrompt` instance.
     * @param dialogId Unique ID of the dialog within its parent `DialogSet`.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     */
    constructor(dialogId: string, validator?: PromptValidator<string>);
    protected onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void>;
    protected onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<string>>;
}
