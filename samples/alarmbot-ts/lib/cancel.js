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
function begin(context, state) {
    return __awaiter(this, void 0, void 0, function* () {
        // Cancel the current topic
        const conversation = state.conversation(context);
        if (conversation.topic) {
            conversation.topic = undefined;
            yield context.sendActivity(`Ok... Canceled.`);
        }
        else {
            yield context.sendActivity(`Nothing to cancel.`);
        }
    });
}
exports.begin = begin;
//# sourceMappingURL=cancel.js.map