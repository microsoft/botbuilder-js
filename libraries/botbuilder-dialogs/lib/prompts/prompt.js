"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function formatPrompt(prompt, speak) {
    const p = typeof prompt === 'string' ? { type: 'message', text: prompt } : prompt;
    if (speak) {
        p.speak = speak;
    }
    return p;
}
exports.formatPrompt = formatPrompt;
//# sourceMappingURL=prompt.js.map