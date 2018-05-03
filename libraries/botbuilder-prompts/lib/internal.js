"use strict";
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
/**
 * @private
 * @param context
 * @param prompt
 * @param speak
 */
function sendPrompt(context, prompt, speak) {
    // Compose activity
    const msg = typeof prompt === 'string' ? { text: prompt } : Object.assign({}, prompt);
    if (speak) {
        msg.speak = speak;
    }
    if (!msg.type) {
        msg.type = botbuilder_1.ActivityTypes.Message;
    }
    if (!msg.inputHint) {
        msg.inputHint = botbuilder_1.InputHints.ExpectingInput;
    }
    // Send activity and eat response.
    return context.sendActivity(msg).then(() => { });
}
exports.sendPrompt = sendPrompt;
//# sourceMappingURL=internal.js.map