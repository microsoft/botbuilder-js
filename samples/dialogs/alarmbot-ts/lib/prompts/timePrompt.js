"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
class TimePrompt extends botbuilder_dialogs_1.DateTimePrompt {
    constructor(dialogId) {
        super(dialogId, (context, prompt) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate that a time was specified and that its in the future.
                const times = prompt.recognized.value || [];
                if (times.length == 0) {
                    throw new Error('missing time');
                }
                if (times[0].type !== 'datetime') {
                    throw new Error('unsupported type');
                }
                const value = new Date(times[0].value);
                if (value.getTime() < new Date().getTime()) {
                    throw new Error('in the past');
                }
                // Return converted date to caller
                prompt.end(value);
            }
            catch (err) {
                // Re-prompt
                yield context.sendActivity(`Please enter a valid time in the future like "tomorrow at 9am" or say "cancel".`);
            }
        }));
    }
}
exports.TimePrompt = TimePrompt;
//# sourceMappingURL=timePrompt.js.map