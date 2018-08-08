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
class TitlePrompt extends botbuilder_dialogs_1.TextPrompt {
    constructor(dialogId) {
        super(dialogId, (context, prompt) => __awaiter(this, void 0, void 0, function* () {
            const result = (prompt.result || '').trim();
            if (result.length < 3) {
                yield context.sendActivity(`Title should be at least 3 characters long.`);
            }
            else {
                prompt.end(result);
            }
        }));
    }
}
exports.TitlePrompt = TitlePrompt;
//# sourceMappingURL=titlePrompt.js.map