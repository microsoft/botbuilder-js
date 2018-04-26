"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_1 = require("botbuilder");
const prompts = require("botbuilder-prompts");
const dialog_1 = require("../dialog");
/**
 * :package: **botbuilder-dialogs**
 *
 * Creates a new prompt that asks the user to sign in using the Bot Frameworks Single Sign On (SSO)
 * service. The prompt will attempt to retrieve the users current token and if the user isn't
 * signed in, it will send them an `OAuthCard` containing a button they can press to signin.
 * Depending on the channel, the user will be sent through one of two possible signin flows:
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
 * Like other prompts, the `OAuthPrompt` can be used either as a dialog added to your bots
 * `DialogSet` or on its own as a control if your bot is using some other conversation management
 * system.
 *
 * ### Dialog Usage
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
 *
 * ### Control Usage
 *
 * If your bot isn't dialog based you can still use the prompt on its own as a control. You will
 * just need start the prompt from somewhere within your bots logic by calling the prompts
 * `begin()` method:
 *
 * ```JavaScript
 * const state = {};
 * const prompt = new OAuthPrompt({
 *    connectionName: 'GitConnection',
 *    title: 'Login To GitHub'
 * });
 * const result = await prompt.begin(context, state);
 * if (!result.active) {
 *     const token = result.result;
 * }
 * ```
 *
 * If the user is already signed into the service we will get a token back immediately. We
 * therefore need to check to see if the prompt is still active after the call to `begin()`.
 *
 * If the prompt is still active that means the user was sent an `OAuthCard` prompting the user to
 * signin and we need to pass any additional activities we receive to the `continue()` method. We
 * can't be certain which auth flow is being used so it's best to route *all* activities, regardless
 * of type, to the `continue()` method for processing.
 *
 * ```JavaScript
 * const prompt = new OAuthPrompt({
 *    connectionName: 'GitConnection',
 *    title: 'Login To GitHub'
 * });
 * const result = await prompt.continue(context, state);
 * if (!result.active) {
 *     const token = result.result;
 *     if (token) {
 *         // User has successfully signed in
 *     } else {
 *         // The signin has timed out
 *     }
 * }
 * ```
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 */
class OAuthPrompt extends dialog_1.Dialog {
    /**
     * Creates a new `OAuthPrompt` instance.
     * @param settings Settings used to configure the prompt.
     * @param validator (Optional) validator that will be called each time the user responds to the prompt. If the validator replies with a message no additional retry prompt will be sent.
     */
    constructor(settings, validator) {
        super();
        this.settings = settings;
        this.prompt = prompts.createOAuthPrompt(settings, validator);
    }
    dialogBegin(dc, options) {
        // Persist options and state
        const timeout = typeof this.settings.timeout === 'number' ? this.settings.timeout : 54000000;
        const instance = dc.instance;
        instance.state = Object.assign({
            expires: new Date().getTime() + timeout
        }, options);
        // Attempt to get the users token
        return this.prompt.getUserToken(dc.context).then((output) => {
            if (output !== undefined) {
                // Return token
                return dc.end(output);
            }
            else if (typeof options.prompt === 'string') {
                // Send supplied prompt then OAuthCard
                return dc.context.sendActivity(options.prompt, options.speak)
                    .then(() => this.prompt.prompt(dc.context));
            }
            else {
                // Send OAuthCard
                return this.prompt.prompt(dc.context, options.prompt);
            }
        });
    }
    dialogContinue(dc) {
        // Recognize token
        return this.prompt.recognize(dc.context).then((output) => {
            // Check for timeout
            const state = dc.instance.state;
            const isMessage = dc.context.activity.type === botbuilder_1.ActivityTypes.Message;
            const hasTimedOut = isMessage && (new Date().getTime() > state.expires);
            // Process output
            if (output || hasTimedOut) {
                // Return token or undefined on timeout
                return dc.end(output);
            }
            else if (isMessage && state.retryPrompt) {
                // Send retry prompt
                return dc.context.sendActivity(state.retryPrompt, state.retrySpeak, botbuilder_1.InputHints.ExpectingInput);
            }
        });
    }
    /**
     * Signs the user out of the service.
     *
     * **Usage Example:**
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
    signOutUser(context) {
        return this.prompt.signOutUser(context);
    }
}
exports.OAuthPrompt = OAuthPrompt;
//# sourceMappingURL=oauthPrompt.js.map