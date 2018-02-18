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
import { PromptOptions, PromptValidator } from './prompt';
import { ListStyle } from './choicePrompt';
import { ChoiceStylerOptions, Choice } from 'botbuilder-choices';
export interface ConfirmChoices {
    [locale: string]: (string | Choice)[];
}
export interface ConfirmPromptOptions extends PromptOptions {
    /** Preferred style of the choices sent to the user. The default value is `ChoicePromptStyle.auto`. */
    style?: ListStyle;
}
export declare class ConfirmPrompt implements Dialog {
    private validator;
    readonly stylerOptions: ChoiceStylerOptions;
    readonly choices: ConfirmChoices;
    constructor(validator?: PromptValidator<boolean | undefined> | undefined);
    begin(context: BotContext, dialogs: DialogSet, options: ConfirmPromptOptions): Promise<void>;
    continue(context: BotContext, dialogs: DialogSet): Promise<void>;
    protected sendChoicePrompt(context: BotContext, dialogs: DialogSet, prompt: string | Partial<Activity>, speak?: string): Promise<void>;
}
