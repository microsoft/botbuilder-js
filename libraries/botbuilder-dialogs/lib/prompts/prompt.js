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