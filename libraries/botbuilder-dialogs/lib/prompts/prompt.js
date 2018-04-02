"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const control_1 = require("../control");
class Prompt extends control_1.Control {
    constructor(validator) {
        super();
        this.validator = validator;
    }
    dialogBegin(dc, options) {
        // Persist options
        const instance = dc.instance;
        instance.state = options || {};
        // Send initial prompt
        return this.onPrompt(dc, instance.state, false);
    }
    dialogContinue(dc) {
        // Recognize value
        const instance = dc.instance;
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