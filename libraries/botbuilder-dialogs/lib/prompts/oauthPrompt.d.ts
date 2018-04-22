/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
import * as prompts from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { Control } from '../control';
import { PromptOptions } from './prompt';
export interface OAuthPromptSettingsWithTimeout extends prompts.OAuthPromptSettings {
    /**
     * (Optional) number of milliseconds the prompt will wait for the user to authenticate.
     * Defaults to a value `54,000,000` (15 minutes.)
     */
    timeout?: number;
}
export declare class OAuthPrompt<C extends TurnContext> extends Control<C> {
    private settings;
    private prompt;
    constructor(settings: OAuthPromptSettingsWithTimeout, validator?: prompts.PromptValidator<any, any>);
    dialogBegin(dc: DialogContext<C>, options: PromptOptions): Promise<any>;
    dialogContinue(dc: DialogContext<C>): Promise<any>;
    signOutUser(context: TurnContext): Promise<void>;
}
