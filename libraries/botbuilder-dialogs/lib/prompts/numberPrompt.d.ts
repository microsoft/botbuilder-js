/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator } from './prompt';
export declare class NumberPrompt implements Dialog {
    private validator;
    constructor(validator?: PromptValidator<number | undefined> | undefined);
    begin(context: BotContext, dialogs: DialogSet, options: PromptOptions): Promise<void>;
    continue(context: BotContext, dialogs: DialogSet): Promise<void>;
}
