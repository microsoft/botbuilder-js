/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, TokenResponse } from 'botbuilder-core';
import { DialogContext } from '../dialogContext';
import { Dialog, DialogTurnResult } from '../dialog';
import { PromptOptions, PromptValidator } from './prompt';
/**
 * Settings used to configure an `OAuthPrompt` instance.
 */
export interface OAuthPromptSettings {
    /** Name of the OAuth connection being used. */
    connectionName: string;
    /** Title of the cards signin button. */
    title: string;
    /** (Optional) additional text to include on the signin card. */
    text?: string;
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
 */
export declare class OAuthPrompt extends Dialog {
    private settings;
    private validator;
    /**
     * Creates a new `OAuthPrompt` instance.
     * @param dialogId Unique ID of the dialog within its parent `DialogSet`.
     * @param settings Settings used to configure the prompt.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     */
    constructor(dialogId: string, settings: OAuthPromptSettings, validator?: PromptValidator<TokenResponse>);
    dialogBegin(dc: DialogContext, options?: PromptOptions): Promise<DialogTurnResult>;
    dialogContinue(dc: DialogContext): Promise<DialogTurnResult>;
    getUserToken(context: TurnContext, code?: string): Promise<TokenResponse | undefined>;
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
    signOutUser(context: TurnContext): Promise<void>;
    private sendOAuthCardAsync(context, prompt?);
    private recognizeToken(context);
    private isTokenResponseEvent(context);
    private isTeamsVerificationInvoke(context);
    private channelSupportsOAuthCard(channelId);
}
