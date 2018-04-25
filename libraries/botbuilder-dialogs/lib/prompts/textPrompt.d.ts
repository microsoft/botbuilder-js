/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
import { PromptValidator } from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { Prompt, PromptOptions } from './prompt';
/**
 * :package: **botbuilder-dialogs**
 *
 * Prompts a user to enter some text. By default the prompt will return to the calling
 * dialog a `string` representing the users reply.
 *
 * The prompt can be used either as a dialog added to your bots `DialogSet` or on its own as a
 * control if your bot is using some other conversation management system.
 *
 * ### Dialog Usage
 *
 * When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named
 * dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either
 * `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted with a question
 * and the response will be passed as an argument to the callers next waterfall step:
 *
 * ```JavaScript
 * const { DialogSet, TextPrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('namePrompt', new TextPrompt());
 *
 * dialogs.add('askName', [
 *      async function (dc) {
 *          await dc.prompt('namePrompt', `What's your name?`);
 *      },
 *      async function (dc, name) {
 *          await dc.context.sendActivity(`Hi ${name}!`);
 *          await dc.end();
 *      }
 * ]);
 * ```
 * The prompt can be configured with a custom validator to perform additional checks like ensuring
 * that the user responds with a valid age and that only whole numbers are returned:
 *
 * ```JavaScript
 * dialogs.add('namePrompt', new TextPrompt(async (context, value) => {
 *    if (value && value.length >= 3) {
 *       return value;
 *    }
 *    await context.sendActivity(`Your entry must be at least 3 characters in length.`);
 *    return undefined;
 * }));
 * ```
 *
 * ### Control Usage
 *
 * If your bot isn't dialog based you can still use the prompt on its own as a control. You will
 * just need start the prompt from somewhere within your bots logic by calling the prompts
 * `begin()` method:
 *
 * ```JavaScript
 * const state = {};
 * const prompt = new TextPrompt();
 * await prompt.begin(context, state, { prompt: `What's your name?` });
 * ```
 *
 * The prompt will populate the `state` object you passed in with information it needs to process
 * the users response. You should save this off to your bots conversation state as you'll need to
 * pass it to the prompts `continue()` method on the next turn of conversation with the user:
 *
 * ```JavaScript
 * const prompt = new TextPrompt();
 * const result = await prompt.continue(context, state);
 * if (!result.active) {
 *     const name = result.result;
 * }
 * ```
 *
 * The `continue()` method returns a `DialogResult` object which can be used to determine when
 * the prompt is finished and then to access the results of the prompt.  To interrupt or cancel
 * the prompt simply delete the `state` object your bot is persisting.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param O (Optional) output type returned by prompt. This defaults to a `string` but can be changed by a custom validator passed to the prompt.
 */
export declare class TextPrompt<C extends TurnContext, O = string> extends Prompt<C> {
    private prompt;
    /**
     * Creates a new `TextPrompt` instance.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     */
    constructor(validator?: PromptValidator<string, O>);
    protected onPrompt(dc: DialogContext<C>, options: PromptOptions, isRetry: boolean): Promise<void>;
    protected onRecognize(dc: DialogContext<C>, options: PromptOptions): Promise<O | undefined>;
}
