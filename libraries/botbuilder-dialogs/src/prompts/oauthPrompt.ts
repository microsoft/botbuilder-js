/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity, ActivityTypes, InputHints, TokenResponse } from '../../../botbuilder/lib';
import * as prompts from '../../../botbuilder-prompts/lib';
import { DialogContext } from '../dialogContext';
import { Dialog, DialogTurnResult } from '../dialog';
import { PromptOptions, PromptValidator } from './prompt';

/**
 * Settings used to configure an `OAuthPrompt` instance. Includes the ability to adjust the prompts
 * timeout settings.
 */
export interface OAuthPromptSettingsWithTimeout extends prompts.OAuthPromptSettings {
    /** 
     * (Optional) number of milliseconds the prompt will wait for the user to authenticate. 
     * Defaults to a value `54,000,000` (15 minutes.)
     */
    timeout?: number;
}

/**
 * Creates a new prompt that asks the user to sign in using the Bot Frameworks Single Sign On (SSO) 
 * service. 
 * 
 * @remarks
 * The prompt will attempt to retrieve the users current token and if the user isn't signed in, it 
 * will send them an `OAuthCard` containing a button they can press to signin. Depending on the 
 * channel, the user will be sent through one of two possible signin flows:
 * 
 * - The automatic signin flow where once the user signs in and the SSO service will forward the bot 
 * the users access token using either an `event` or `invoke` activity.
 * - The "magic code" flow where where once the user signs in they will be prompted by the SSO 
 * service to send the bot a six digit code confirming their identity. This code will be sent as a 
 * standard `message` activity.
 * 
 * Both flows are automatically supported by the `OAuthPrompt` and the only thing you need to be 
 * careful of is that you don't block the `event` and `invoke` activities that the prompt might
 * be waiting on.
 * 
 * > [!NOTE]
 * > You should avoid persisting the access token with your bots other state. The Bot Frameworks 
 * > SSO service will securely store the token on your behalf. If you store it in your bots state
 * > it could expire or be revoked in between turns. 
 * >
 * > When calling the prompt from within a waterfall step you should use the token within the step
 * > following the prompt and then let the token go out of scope at the end of your function.
 * 
 * #### Prompt Usage
 * 
 * When used with your bots `DialogSet` you can simply add a new instance of the prompt as a named
 * dialog using `DialogSet.add()`. You can then start the prompt from a waterfall step using either
 * `DialogContext.begin()` or `DialogContext.prompt()`. The user will be prompted to signin as 
 * needed and their access token will be passed as an argument to the callers next waterfall step: 
 * 
 * ```JavaScript
 * const { DialogSet, OAuthPrompt } = require('botbuilder-dialogs');
 * 
 * const dialogs = new DialogSet();
 * 
 * dialogs.add('loginPrompt', new OAuthPrompt({
 *    connectionName: 'GitConnection',
 *    title: 'Login To GitHub',
 *    timeout: 300000   // User has 5 minutes to login
 * }));
 * 
 * dialogs.add('taskNeedingLogin', [
 *      async function (dc) {
 *          await dc.begin('loginPrompt');
 *      },
 *      async function (dc, token) {
 *          if (token) {
 *              // Continue with task needing access token
 *          } else {
 *              await dc.context.sendActivity(`Sorry... We couldn't log you in. Try again later.`);
 *              await dc.end();
 *          }
 *      }
 * ]);
 * ```
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 */
export class OAuthPrompt extends Dialog {
    private prompt: prompts.OAuthPrompt;

    /**
     * Creates a new `OAuthPrompt` instance.
     * @param settings Settings used to configure the prompt. 
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.  
     */
    constructor(dialogId: string, private settings: OAuthPromptSettingsWithTimeout, private validator?: PromptValidator<TokenResponse>) { 
        super(dialogId);
        this.prompt = prompts.createOAuthPrompt(settings);
    }

    public async dialogBegin(dc: DialogContext, options?: PromptOptions): Promise<DialogTurnResult> {
        // Initialize prompt state
        const timeout = typeof this.settings.timeout === 'number' ? this.settings.timeout : 54000000; 
        const state = dc.activeDialog.state as OAuthPromptState;
        state.state = {};
        state.options = Object.assign({}, options);
        state.expires = new Date().getTime() + timeout;

        // Attempt to get the users token
        const output = await this.prompt.getUserToken(dc.context);
        if (output !== undefined) {
            // Return token
            return await dc.end(output);
        } else {
            if (typeof state.options.prompt === 'string') {
                // Send supplied prompt then OAuthCard
                await dc.context.sendActivity(state.options.prompt, state.options.speak);
                await this.prompt.prompt(dc.context);
            } else {
                // Send OAuthCard
                await this.prompt.prompt(dc.context, state.options.prompt);
            }
            return Dialog.EndOfTurn;
        }
    }

    public async dialogContinue(dc: DialogContext): Promise<DialogTurnResult> {
        // Recognize token
        const recognized = await this.prompt.recognize(dc.context);

        // Check for timeout
        const state = dc.activeDialog.state as OAuthPromptState;
        const isMessage = dc.context.activity.type === ActivityTypes.Message;
        const hasTimedOut = isMessage && (new Date().getTime() > state.expires);
        if (hasTimedOut) {
            return await dc.end(undefined);
        } else {
            // Validate the return value
            let end = false;
            let endResult: any;
            if (this.validator) {
                await this.validator(dc.context, {
                    result: recognized,
                    state: state.state,
                    options: state.options,
                    end: (output: any) => {
                        end = true;
                        endResult = output;
                    }
                });
            } else if (recognized !== undefined) {
                end = true;
                endResult = recognized;
            }

            // Return recognized value or re-prompt
            if (end) {
                return await dc.end(endResult);
            } else {
                // Send retry prompt
                if (!dc.context.responded && isMessage && state.options.retryPrompt) {
                    await dc.context.sendActivity(state.options.retryPrompt, state.options.retrySpeak, InputHints.ExpectingInput);
                }
                return Dialog.EndOfTurn;
            }
        }
    }

    /**
     * Signs the user out of the service.
     *
     * @remarks
     * This example shows creating an instance of the prompt and then signing out the user.
     *
     * ```JavaScript
     * const prompt = new OAuthPrompt({
     *    connectionName: 'GitConnection',
     *    title: 'Login To GitHub'
     * });
     * await prompt.signOutUser(context);
     * ```
     * @param context 
     */
    public signOutUser(context: TurnContext): Promise<void> {
        return this.prompt.signOutUser(context);
    }
}

interface OAuthPromptState  {
    state: object;
    options: PromptOptions;
    expires: number;        // Timestamp of when the prompt will timeout. 
}
