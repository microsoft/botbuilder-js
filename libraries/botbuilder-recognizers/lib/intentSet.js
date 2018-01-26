"use strict";
/**
 * @module botbuilder-recognizers
 */
/** second comment block */
Object.defineProperty(exports, "__esModule", { value: true });
class IntentSet {
    constructor() {
        this.intents = [];
    }
    get all() {
        return this.intents;
    }
    top() {
        // Find top
        let top;
        this.intents.forEach((intent) => {
            if (intent.score > 0.0 && (!top || intent.score > top.score)) {
                top = intent;
            }
        });
        return top;
    }
}
exports.IntentSet = IntentSet;
//# sourceMappingURL=intentSet.js.map