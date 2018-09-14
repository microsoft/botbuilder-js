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
class GoodbyeMiddleware {
    constructor(conversationState) {
        this.conversationState = conversationState;
        this.dialogs = new botbuilder_dialogs_1.DialogSet();
        // Add private dialogs for confirming goodbye
        this.dialogs.add('confirmGoodbye', [
            function (dc) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield dc.prompt('confirmPrompt', `This will end any active tasks. Are you sure?`);
                });
            },
            function (dc, value) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (value) {
                        // Clear conversation state
                        yield dc.context.sendActivity(`Ok... Goodbye`);
                        conversationState.clear(dc.context);
                    }
                    else {
                        yield dc.context.sendActivity(`Ok...`);
                    }
                    return dc.endDialog();
                });
            }
        ]);
        this.dialogs.add('confirmPrompt', new botbuilder_dialogs_1.ConfirmPrompt());
    }
    onTurn(context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.activity.type === 'message') {
                // Create dialog context using our middlewares private dialog stack
                const state = yield this.conversationState.read(context);
                if (!state['goodbyeMiddlewareState']) {
                    state['goodbyeMiddlewareState'] = {};
                }
                const dc = this.dialogs.createContext(context, state['goodbyeMiddlewareState']);
                // Intercept the message if we're prompting the user
                yield dc.continueDialog();
                if (context.responded) {
                    return;
                }
                // Check for user to say "goodbye"
                const utterance = (context.activity.text || '').trim().toLowerCase();
                if (utterance === 'goodbye') {
                    // Start confirmation dialog
                    yield dc.beginDialog('confirmGoodbye');
                }
                else {
                    // Let bot process request
                    yield next();
                }
            }
            else {
                // Let bot process request
                yield next();
            }
        });
    }
}
exports.GoodbyeMiddleware = GoodbyeMiddleware;
//# sourceMappingURL=goodbyeMiddleware.js.map