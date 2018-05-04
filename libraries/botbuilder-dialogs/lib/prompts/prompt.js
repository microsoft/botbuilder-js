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
const dialog_1 = require("../dialog");
/**
 * Base class for all prompts.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 */
class Prompt extends dialog_1.Dialog {
    constructor(validator) {
        super();
        this.validator = validator;
    }
    dialogBegin(dc, options) {
        // Persist options
        const instance = dc.activeDialog;
        instance.state = options || {};
        // Send initial prompt
        return this.onPrompt(dc, instance.state, false);
    }
    dialogContinue(dc) {
        // Don't do anything for non-message activities
        if (dc.context.activity.type !== botbuilder_1.ActivityTypes.Message) {
            return Promise.resolve();
        }
        // Recognize value
        const instance = dc.activeDialog;
        return this.onRecognize(dc, instance.state)
            .then((recognized) => {
            if (this.validator) {
                // Call validator
                return Promise.resolve(this.validator(dc.context, recognized));
            }
            else {
                // Pass through recognized value
                return recognized;
            }
        }).then((output) => {
            if (output !== undefined) {
                // Return recognized value
                return dc.end(output);
            }
            else if (!dc.context.responded) {
                // Send retry prompt
                return this.onPrompt(dc, instance.state, true);
            }
        });
    }
}
exports.Prompt = Prompt;
//# sourceMappingURL=prompt.js.map