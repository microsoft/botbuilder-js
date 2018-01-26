"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-recognizers
 */
/** second comment block */
const botbuilder_1 = require("botbuilder");
const intentSet_1 = require("./intentSet");
Object.defineProperty(botbuilder_1.BotContext.prototype, 'intents', {
    get: function getIntents() {
        const context = this;
        if (!context.has('intents')) {
            context.set('intents', new intentSet_1.IntentSet());
        }
        return context.get('intents');
    }
});
//# sourceMappingURL=contextExtensions.js.map