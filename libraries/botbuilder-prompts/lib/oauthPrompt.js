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
 * Creates a new prompt that asks the user to enter some text.
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