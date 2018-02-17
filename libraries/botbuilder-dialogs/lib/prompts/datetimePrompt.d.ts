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
export interface FoundDatetime {
    timex: string;
    type: string;
    value: string;
}
export declare class DatetimePrompt implements Dialog {
    private validator;
    constructor(validator?: PromptValidator<FoundDatetime[]> | undefined);
    begin(context: BotContext, dialogs: DialogSet, options: PromptOptions): Promise<void>;
    continue(context: BotContext, dialogs: DialogSet): Promise<void>;
}
