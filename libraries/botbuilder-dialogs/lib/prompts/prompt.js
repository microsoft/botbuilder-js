"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Prompt {
    constructor(validator) {
        this.validator = validator;
    }
    begin(dc, options) {
        // Persist options
        const instance = dc.instance;
        instance.state = options || {};
        // Send initial prompt
        return this.onPrompt(dc, instance.state, false);
    }
    continue(dc) {
        // Recognize value
        return this.onRecognize(dc, dc.instance.state)
            .then((recognized) => {
            if (this.validator) {
                // Call validator
                return Promise.resolve(this.validator(dc, recognized));
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
                return this.onPrompt(dc, dc.instance.state, true);
            }
        });
    }
}
exports.Prompt = Prompt;
//# sourceMappingURL=prompt.js.map