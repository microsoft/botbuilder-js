/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes, Attachment, CardFactory, InputHints, MessageFactory, OAuthLoginTimeoutKey, TokenResponse, TurnContext, IUserTokenProvider, OAuthCard, ActionTypes,  } from 'botbuilder-core';
import { Dialog, DialogTurnResult } from '../dialog';
import { DialogContext } from '../dialogContext';
import { PromptOptions, PromptRecognizerResult,  PromptValidator } from './prompt';
import { channels } from '../choices/channel';
import { isSkillClaim } from './skillsHelpers';

/**
 * Settings used to configure an `OAuthPrompt` instance.
 */
export interface OAuthPromptSettings {
    /**
     * Name of the OAuth connection being used.
     */
    connectionName: string;

    /**
     * Title of the cards signin button.
     */
    title: string;

    /**
     * (Optional) additional text to include on the signin card.
     */
    text?: string;

    /**
     * (Optional) number of milliseconds the prompt will wait for the user to authenticate.
     * Defaults to a value `900,000` (15 minutes.)
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
 * `DialogContext.beginDialog()` or `DialogContext.prompt()`. The user will be prompted to signin as
 * needed and their access token will be passed as an argument to the callers next waterfall step:
 *
 * ```JavaScript
 * const { ConversationState, MemoryStorage, OAuthLoginTimeoutMsValue } = require('botbuilder');
 * const { DialogSet, OAuthPrompt, WaterfallDialog } = require('botbuilder-dialogs');
 *
 * const convoState = new ConversationState(new MemoryStorage());
 * const dialogState = convoState.createProperty('dialogState');
 * const dialogs = new DialogSet(dialogState);
 *
 * dialogs.add(new OAuthPrompt('loginPrompt', {
 *    connectionName: 'GitConnection',
 *    title: 'Login To GitHub',
 *    timeout: OAuthLoginTimeoutMsValue   // User has 15 minutes to login
 * }));
 *
 * dialogs.add(new WaterfallDialog('taskNeedingLogin', [
 *      async (step) => {
 *          return await step.beginDialog('loginPrompt');
 *      },
 *      async (step) => {
 *          const token = step.result;
 *          if (token) {
 *
 *              // ... continue with task needing access token ...
 *
 *          } else {
 *              await step.context.sendActivity(`Sorry... We couldn't log you in. Try again later.`);
 *              return await step.endDialog();
 *          }
 *      }
 * ]));
 * ```
 */
export class OAuthPrompt extends Dialog {

    /**
     * Creates a new OAuthPrompt instance.
     * @param dialogId Unique ID of the dialog within its parent `DialogSet` or `ComponentDialog`.
     * @param settings Settings used to configure the prompt.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt.
     */
    constructor(dialogId: string, private settings: OAuthPromptSettings, private validator?: PromptValidator<TokenResponse>) {
        super(dialogId);
    }

    public async beginDialog(dc: DialogContext, options?: PromptOptions): Promise<DialogTurnResult> {
        // Ensure prompts have input hint set
        const o: Partial<PromptOptions> = {...options};
        if (o.prompt && typeof o.prompt === 'object' && typeof o.prompt.inputHint !== 'string') {
            o.prompt.inputHint = InputHints.AcceptingInput;
        }
        if (o.retryPrompt && typeof o.retryPrompt === 'object' && typeof o.retryPrompt.inputHint !== 'string') {
            o.retryPrompt.inputHint = InputHints.AcceptingInput;
        }

        // Initialize prompt state
        const timeout: number = typeof this.settings.timeout === 'number' ? this.settings.timeout : 900000;
        const state: OAuthPromptState = dc.activeDialog.state as OAuthPromptState;
        state.state = {};
        state.options = o;
        state.expires = new Date().getTime() + timeout;

        // Attempt to get the users token
        const output: TokenResponse = await this.getUserToken(dc.context);
        if (output !== undefined) {
            // Return token
            return await dc.endDialog(output);
        } else {
            // Prompt user to login
            await this.sendOAuthCardAsync(dc.context, state.options.prompt);

            return Dialog.EndOfTurn;
        }
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Recognize token
        const recognized: PromptRecognizerResult<TokenResponse> = await this.recognizeToken(dc.context);

        // Check for timeout
        const state: OAuthPromptState = dc.activeDialog.state as OAuthPromptState;
        const isMessage: boolean = dc.context.activity.type === ActivityTypes.Message;
        const hasTimedOut: boolean = isMessage && (new Date().getTime() > state.expires);
        if (hasTimedOut) {
            return await dc.endDialog(undefined);
        } else {

            if (state.state['attemptCount'] === undefined) {
                state.state['attemptCount'] = 0;
            }

            // Validate the return value
            let isValid = false;
            if (this.validator) {
                isValid = await this.validator({
                    context: dc.context,
                    recognized: recognized,
                    state: state.state,
                    options: state.options,
                    attemptCount: ++state.state['attemptCount']
                });
            } else if (recognized.succeeded) {
                isValid = true;
            }

            // Return recognized value or re-prompt
            if (isValid) {
                return await dc.endDialog(recognized.value);
            } else {
                // Send retry prompt
                if (!dc.context.responded && isMessage && state.options.retryPrompt) {
                    await dc.context.sendActivity(state.options.retryPrompt);
                }

                return Dialog.EndOfTurn;
            }
        }
    }

    /**
     * Attempts to retrieve the stored token for the current user.
     * @param context Context reference the user that's being looked up.
     * @param code (Optional) login code received from the user.
     */
    public async getUserToken(context: TurnContext, code?: string): Promise<TokenResponse|undefined> {
        // Validate adapter type
        if (!('getUserToken' in context.adapter)) {
            throw new Error(`OAuthPrompt.getUserToken(): not supported for the current adapter.`);
        }

        // Get the token and call validator
        const adapter: IUserTokenProvider = context.adapter as IUserTokenProvider;

        return await adapter.getUserToken(context, this.settings.connectionName, code);
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
     * @param context Context referencing the user that's being signed out.
     */
    public async signOutUser(context: TurnContext): Promise<void> {
        // Validate adapter type
        if (!('signOutUser' in context.adapter)) {
            throw new Error(`OAuthPrompt.signOutUser(): not supported for the current adapter.`);
        }

        // Sign out user
        const adapter: IUserTokenProvider = context.adapter as IUserTokenProvider;

        return adapter.signOutUser(context, this.settings.connectionName);
    }

    private async sendOAuthCardAsync(context: TurnContext, prompt?: string|Partial<Activity>): Promise<void> {
        // Validate adapter type
        if (!('getUserToken' in context.adapter)) {
            throw new Error(`OAuthPrompt.prompt(): not supported for the current adapter.`);
        }

        // Initialize outgoing message
        const msg: Partial<Activity> =
            typeof prompt === 'object' ? {...prompt} : MessageFactory.text(prompt, undefined, InputHints.AcceptingInput);
        if (!Array.isArray(msg.attachments)) { msg.attachments = []; }

        // Add login card as needed
        if (this.channelSupportsOAuthCard(context.activity.channelId)) {
            const cards: Attachment[] = msg.attachments.filter((a: Attachment) => a.contentType === CardFactory.contentTypes.oauthCard);
            if (cards.length === 0) {
                let cardActionType = ActionTypes.Signin;
                let link: string;
                if (OAuthPrompt.isFromStreamingConnection(context.activity)) {
                    link = await (context.adapter as any).getSignInLink(context, this.settings.connectionName);
                } else {
                    // Retrieve the ClaimsIdentity from a BotFrameworkAdapter. For more information see
                    // https://github.com/microsoft/botbuilder-js/commit/b7932e37bb6e421985d5ce53edd9e82af6240a63#diff-3e3af334c0c6adf4906ee5e2a23beaebR250
                    const identity = context.turnState.get((context.adapter as any).BotIdentityKey);
                    if (identity && isSkillClaim(identity.claims)) {
                        // Force magic code for Skills (to be addressed in R8)
                        link = await (context.adapter as any).getSignInLink(context, this.settings.connectionName);
                        cardActionType = ActionTypes.OpenUrl;
                    }
                }
                // Append oauth card
                const card = CardFactory.oauthCard(
                    this.settings.connectionName,
                    this.settings.title,
                    this.settings.text,
                    link
                );

                // Set the appropriate ActionType for the button.
                (card.content as OAuthCard).buttons[0].type = cardActionType;
                msg.attachments.push(card);
            }
        } else {
            const cards: Attachment[] = msg.attachments.filter((a: Attachment) => a.contentType === CardFactory.contentTypes.signinCard);
            if (cards.length === 0) {
                // Append signin card
                const link: any = await (context.adapter as any).getSignInLink(context, this.settings.connectionName);
                msg.attachments.push(CardFactory.signinCard(
                    this.settings.title,
                    link,
                    this.settings.text
                ));
            }
        }

        // Add the login timeout specified in OAuthPromptSettings to TurnState so it can be referenced if polling is needed
        if (!context.turnState.get(OAuthLoginTimeoutKey) && this.settings.timeout) {
            context.turnState.set(OAuthLoginTimeoutKey, this.settings.timeout);
        }

        // Send prompt
        await context.sendActivity(msg);
    }

    private async recognizeToken(context: TurnContext): Promise<PromptRecognizerResult<TokenResponse>> {
        let token: TokenResponse|undefined;
        if (this.isTokenResponseEvent(context)) {
            token = context.activity.value as TokenResponse;
        } else if (this.isTeamsVerificationInvoke(context)) {
            const code: any = context.activity.value.state;
            try {
                token = await this.getUserToken(context, code);
                if (token !== undefined) {
                    await context.sendActivity({ type: 'invokeResponse', value: { status: 200 }});
                } else {
                    await context.sendActivity({ type: 'invokeResponse', value: { status: 404 }});
                }
            }
            catch (e)
            {
                await context.sendActivity({ type: 'invokeResponse', value: { status: 500 }});
            }
        } else if (context.activity.type === ActivityTypes.Message) {
            const matched: RegExpExecArray = /(\d{6})/.exec(context.activity.text);
            if (matched && matched.length > 1) {
                token = await this.getUserToken(context, matched[1]);
            }
        }

        return token !== undefined ? { succeeded: true, value: token } : { succeeded: false };
    }

    private static isFromStreamingConnection(activity: Activity): boolean {
        return activity && activity.serviceUrl && !activity.serviceUrl.toLowerCase().startsWith('http');
    }

    private isTokenResponseEvent(context: TurnContext): boolean {
        const activity: Activity = context.activity;

        return activity.type === ActivityTypes.Event && activity.name === 'tokens/response';
    }



    private isTeamsVerificationInvoke(context: TurnContext): boolean {
        const activity: Activity = context.activity;

        return activity.type === ActivityTypes.Invoke && activity.name === 'signin/verifyState';
    }

    private channelSupportsOAuthCard(channelId: string): boolean {
        switch (channelId) {
            case channels.msteams:
            case channels.cortana:
            case channels.skype:
            case channels.skypeforbusiness:
                return false;
            default:
        }

        return true;
    }
}

/**
 * @private
 */
interface OAuthPromptState  {
    state: any;
    options: PromptOptions;
    expires: number;        // Timestamp of when the prompt will timeout.
}
