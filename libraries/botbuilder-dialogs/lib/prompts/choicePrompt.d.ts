/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Promiseable, Activity } from 'botbuilder';
import { Dialog } from '../dialog';
import { DialogSet } from '../dialogSet';
import { PromptOptions, PromptValidator } from './prompt';
import { Choice, ChoiceStylerOptions, FoundChoice } from 'botbuilder-choices';
export declare enum ChoicePromptStyle {
    /** Don't include any choices for prompt. */
    none = 0,
    /** Automatically select the appropriate style for the current channel. */
    auto = 1,
    /** Add choices to prompt as an inline list. */
    inline = 2,
    /** Add choices to prompt as a numbered list. */
    list = 3,
    /** Add choices to prompt as suggested actions. */
    suggestedAction = 4,
}
export interface ChoicePromptOptions extends PromptOptions {
    /** List of choices to recognize. */
    choices?: (string | Choice)[];
    /** Preferred style of the choices sent to the user. The default value is `ChoicePromptStyle.auto`. */
    style?: ChoicePromptStyle;
}
export declare type DynamicChoicesProvider = (context: BotContext, recognizePhase: boolean, dialogs: DialogSet) => Promiseable<(string | Choice)[]>;
export declare class ChoicePrompt implements Dialog {
    private validator;
    private choices;
    readonly stylerOptions: ChoiceStylerOptions;
    constructor(validator?: PromptValidator<FoundChoice | undefined> | undefined, choices?: DynamicChoicesProvider | undefined);
    begin(context: BotContext, dialogs: DialogSet, options: ChoicePromptOptions): Promise<void>;
    continue(context: BotContext, dialogs: DialogSet): Promise<void>;
    protected sendChoicePrompt(context: BotContext, dialogs: DialogSet, prompt: string | Partial<Activity>, speak?: string): Promise<void>;
    private getChoices(context, recognizePhase, dialogs);
}
export declare function formatChoicePrompt(channelOrContext: string | BotContext, choices: (string | Choice)[], text?: string, speak?: string, options?: ChoiceStylerOptions, style?: ChoicePromptStyle): Partial<Activity>;
