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
/**
 * Helper function to properly format a prompt sent to a user.
 *
 * **Example usage:**
 *
 * ```JavaScript
 * const { formatPrompt } = require('botbuilder-dialogs');
 *
 * context.reply(formatPrompt(`Hi... What's your name?`, `What is your name?`));
 * ```
 * @param prompt Activity or text to prompt the user with.  If prompt is a `string` then an activity of type `message` will be created.
 * @param speak (Optional) SSML to speak to the user on channels like Cortana. The messages `inputHint` will be automatically set to `InputHints.expectingInput`.
 */
function formatPrompt(prompt, speak) {
    const p = typeof prompt === 'string' ? { type: 'message', text: prompt } : prompt;
    if (speak) {
        p.speak = speak;
    }
    if (!p.inputHint) {
        p.inputHint = botbuilder_1.InputHints.ExpectingInput;
    }
    return p;
}
exports.formatPrompt = formatPrompt;
//# sourceMappingURL=prompt.js.map