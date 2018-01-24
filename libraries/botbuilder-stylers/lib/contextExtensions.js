"use strict";
/**
 * @module botbuilder-stylers
 */
/** second comment block */
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
botbuilder_1.BotContext.prototype.reply = function reply(textOrActivity, speak, additional) {
    this.throwIfDisposed('reply()');
    // Check other parameters
    if (!additional && typeof speak === 'object') {
        additional = speak;
        speak = undefined;
    }
    if (typeof textOrActivity === 'object') {
        if (!textOrActivity.type) {
            textOrActivity.type = botbuilder_1.ActivityTypes.message;
        }
        this.responses.push(textOrActivity);
    }
    else {
        const activity = Object.assign({
            type: botbuilder_1.ActivityTypes.message,
            text: textOrActivity || '',
        }, additional || {});
        if (typeof speak === 'string') {
            activity.speak = speak;
        }
        this.responses.push(activity);
    }
    return this;
};
botbuilder_1.BotContext.prototype.delay = function delay(duration) {
    this.throwIfDisposed('delay()');
    this.responses.push({ type: 'delay', value: duration });
    return this;
};
botbuilder_1.BotContext.prototype.endOfConversation = function endOfConversation(code) {
    this.throwIfDisposed('endOfConversation()');
    const activity = {
        type: botbuilder_1.ActivityTypes.endOfConversation,
        code: code || botbuilder_1.EndOfConversationCodes.completedSuccessfully
    };
    this.responses.push(activity);
    return this;
};
botbuilder_1.BotContext.prototype.showTyping = function showTyping() {
    this.throwIfDisposed('showTyping()');
    this.responses.push({ type: botbuilder_1.ActivityTypes.typing });
    return this;
};
//# sourceMappingURL=contextExtensions.js.map