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
const lib_1 = require("../../botbuilder/lib");
const dialog_1 = require("./dialog");
const dialogContext_1 = require("./dialogContext");
class RootDialog {
    constructor(id = '') {
        this.id = id;
        this.dialogs = {};
        this.parent = undefined;
    }
    add(dialog) {
        if (!(dialog instanceof dialog_1.Dialog)) {
            throw new Error(`RootDialog.add(): the added dialog is not an instance of the Dialog class.`);
        }
        if (this.dialogs.hasOwnProperty(dialog.id)) {
            throw new Error(`RootDialog.add(): a dialog with an id of '${dialog.id}' has already been added.`);
        }
        this.dialogs[dialog.id] = dialog;
        return dialog;
    }
    createContext(context, state) {
        return __awaiter(this, void 0, void 0, function* () {
            return new dialogContext_1.DialogContext(this, context, state);
        });
    }
    find(dialogId) {
        return this.dialogs[dialogId];
    }
    dispatch(context, state) {
        return __awaiter(this, void 0, void 0, function* () {
            // Listen for endOfConversation sent
            let conversationEnded = context.activity.type === lib_1.ActivityTypes.EndOfConversation;
            context.onSendActivities((ctx, activities, next) => __awaiter(this, void 0, void 0, function* () {
                for (let i = 0; i < activities.length; i++) {
                    if (activities[i].type === lib_1.ActivityTypes.EndOfConversation) {
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
            const dc = yield this.createContext(context, rootState.dialogState);
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
            const isMessage = context.activity.type === lib_1.ActivityTypes.Message;
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
exports.RootDialog = RootDialog;
//# sourceMappingURL=rootDialog.js.map