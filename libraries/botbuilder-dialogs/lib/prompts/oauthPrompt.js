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
const control_1 = require("../control");
class OAuthPrompt extends control_1.Control {
    constructor(settings, validator) {
        super();
        this.settings = settings;
        this.prompt = prompts.createOAuthPrompt(settings, validator);
    }
    dialogBegin(dc, options) {
        // Persist options and state
        const timeout = typeof this.settings.timeout === 'number' ? this.settings.timeout : 5400000;
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
    signOutUser(context) {
        return this.prompt.signOutUser(context);
    }
}
exports.OAuthPrompt = OAuthPrompt;
//# sourceMappingURL=oauthPrompt.js.map