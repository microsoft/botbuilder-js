"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-prompts
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_1 = require("botbuilder");
const internal_1 = require("./internal");
/**
 * :package: **botbuilder-prompts**
 *
 * Creates a new prompt that asks the user to sign in using the Bot Frameworks Single Sign On (SSO)
 * service.
 *
 * **Usage Example:**
 *
 * ```JavaScript
 * async function ensureLogin(context, state, botLogic) {
 *    const now = new Date().getTime();
 *    if (state.token && now < (new Date(state.token.expiration).getTime() - 60000)) {
 *       return botLogic(context);
 *    } else {
 *       const loginPrompt = createOAuthPrompt({
 *           connectionName: 'GitConnection',
 *           title: 'Login To GitHub'
 *       });
 *       const token = await state.loginActive ? loginPrompt.recognize(context) : loginPrompt.getUserToken(context);
 *       if (token) {
 *           state.loginActive = false;
 *           state.token = token;
 *           return botLogic(context);
 *       } else if (context.activity.type === 'message') {
 *           if (!state.loginActive) {
 *               state.loginActive = true;
 *               state.loginStart = now;
 *               await loginPrompt.prompt(context);
 *           } else if (now >= (state.loginStart + (5 * 60 * 1000))) {
 *               state.loginActive = false;
 *               await context.sendActivity(`We're having a problem logging you in. Please try again later.`);
 *           }
 *       }
 *    }
 * }
 * ```
 * @param O (Optional) type of result returned by the `recognize()` method. This defaults to an instance of `TokenResponse` but can be changed by the prompts custom validator.
 * @param settings Configuration settings for the OAuthPrompt.
 * @param validator (Optional) validator for providing additional validation logic or customizing the prompt sent to the user when invalid.
 */
function createOAuthPrompt(settings, validator) {
    return {
        prompt: function prompt(context, prompt) {
            try {
                // Validate adapter type
                if (!('getUserToken' in context.adapter)) {
                    throw new Error(`OAuthPrompt.prompt(): not supported for the current adapter.`);
                }
                // Format prompt
                if (typeof prompt !== 'object') {
                    prompt = botbuilder_1.MessageFactory.attachment(botbuilder_1.CardFactory.oauthCard(settings.connectionName, settings.title, settings.text));
                }
                else {
                    // Validate prompt
                    if (!Array.isArray(prompt.attachments)) {
                        throw new Error(`OAuthPrompt.prompt(): supplied prompt missing attachments.`);
                    }
                    const found = prompt.attachments.filter(a => a.contentType === botbuilder_1.CardFactory.contentTypes.oauthCard);
                    if (found.length == 0) {
                        throw new Error(`OAuthPrompt.prompt(): supplied prompt missing OAuthCard.`);
                    }
                }
                // Send prompt
                return internal_1.sendPrompt(context, prompt);
            }
            catch (err) {
                return Promise.reject(err);
            }
        },
        recognize: function recognize(context) {
            // Validate adapter type
            if (!('getUserToken' in context.adapter)) {
                throw new Error(`OAuthPrompt.recognize(): not supported for the current adapter.`);
            }
            // Attempt to get the token
            return Promise.resolve()
                .then(() => {
                if (isTokenResponseEvent(context)) {
                    return Promise.resolve(context.activity.value);
                }
                else if (context.activity.type === botbuilder_1.ActivityTypes.Message) {
                    const matched = /(\d{6})/.exec(context.activity.text);
                    if (matched && matched.length > 1) {
                        const adapter = context.adapter;
                        return adapter.getUserToken(context, settings.connectionName, matched[1]);
                    }
                    else {
                        return Promise.resolve(undefined);
                    }
                }
            })
                .then((value) => validator ? validator(context, value) : value);
        },
        getUserToken: function getUserToken(context) {
            // Validate adapter type
            if (!('getUserToken' in context.adapter)) {
                throw new Error(`OAuthPrompt.getUserToken(): not supported for the current adapter.`);
            }
            // Get the token and call validator
            const adapter = context.adapter;
            return adapter.getUserToken(context, settings.connectionName)
                .then((value) => {
                return Promise.resolve(validator ? validator(context, value) : value);
            });
        },
        signOutUser: function signOutUser(context) {
            // Validate adapter type
            if (!('signOutUser' in context.adapter)) {
                throw new Error(`OAuthPrompt.signOutUser(): not supported for the current adapter.`);
            }
            // Sign out user
            const adapter = context.adapter;
            return adapter.signOutUser(context, settings.connectionName);
        }
    };
}
exports.createOAuthPrompt = createOAuthPrompt;
function isTokenResponseEvent(context) {
    const a = context.activity;
    return (a.type === botbuilder_1.ActivityTypes.Event && a.name === 'tokens/response');
}
//# sourceMappingURL=oauthPrompt.js.map