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
/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_1 = require("botbuilder");
const dialogSet_1 = require("./dialogSet");
class RootDialogContainer {
    constructor() {
        /** The containers dialog set. */
        this.dialogs = new dialogSet_1.DialogSet();
    }
    continue(context, state) {
        return __awaiter(this, void 0, void 0, function* () {
            // Listen for endOfConversation sent
            let conversationEnded = context.activity.type === botbuilder_1.ActivityTypes.EndOfConversation;
            context.onSendActivities((ctx, activities, next) => __awaiter(this, void 0, void 0, function* () {
                for (let i = 0; i < activities.length; i++) {
                    if (activities[i].type === botbuilder_1.ActivityTypes.EndOfConversation) {
                        conversationEnded = true;
                    }
                }
                return yield next();
            }));
            // Initialize state object
            let newConversation = false;
            const rootState = state;
            if (!rootState.dialogState) {
                newConversation = true;
                rootState.dialogState = {};
            }
            // Create dialog context
            const dc = yield this.dialogs.createContext(context, rootState.dialogState);
            const wasActive = !!dc.activeDialog;
            // Signal start of conversation
            if (!context.responded) {
                if (newConversation && !conversationEnded) {
                    yield this.onConversationBegin(dc);
                }
            }
            else {
                console.warn(`RootDialogContainer.continue(): the root dialog was called and 'context.responded' is already true.`);
            }
            // Check for interruptions
            let result;
            const isMessage = context.activity.type === botbuilder_1.ActivityTypes.Message;
            if (!context.responded && !conversationEnded && isMessage) {
                yield this.onInterruption(dc);
            }
            // Continue existing dialog
            if (!context.responded && !conversationEnded) {
                yield dc.continue();
            }
            // Run fallback logic
            if (!context.responded && !conversationEnded && isMessage) {
                yield this.onFallback(dc);
            }
            // Signal end of conversation
            if (conversationEnded) {
                delete rootState.dialogState;
                yield this.onConversationEnd(dc);
            }
        });
    }
    onConversationBegin(dc) {
        return Promise.resolve();
    }
    onInterruption(dc) {
        return Promise.resolve();
    }
    onFallback(dc) {
        return Promise.resolve();
    }
    onConversationEnd(dc) {
        return Promise.resolve();
    }
}
exports.RootDialogContainer = RootDialogContainer;
//# sourceMappingURL=rootDialogContainer.js.map