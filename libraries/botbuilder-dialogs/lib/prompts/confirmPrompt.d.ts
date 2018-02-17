/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity } from 'botbuilder';
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptValidator } from './prompt';
import { ChoicePromptOptions } from './choicePrompt';
import { ChoiceStylerOptions, Choice } from 'botbuilder-choices';
export interface ConfirmChoices {
    [locale: string]: (string | Choice)[];
}
export declare class ConfirmPrompt implements Dialog {
    private validator;
    readonly stylerOptions: ChoiceStylerOptions;
    readonly choices: ConfirmChoices;
    constructor(validator?: PromptValidator<boolean | undefined> | undefined);
    begin(context: BotContext, dialogs: DialogSet, options: ChoicePromptOptions): Promise<void>;
    continue(context: BotContext, dialogs: DialogSet): Promise<void>;
    protected sendChoicePrompt(context: BotContext, dialogs: DialogSet, prompt: string | Partial<Activity>, speak?: string): Promise<void>;
}
