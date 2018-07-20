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
const dialog_1 = require("./dialog");
const dialogContext_1 = require("./dialogContext");
class DialogDispatcher {
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
        dialog.parent = this;
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
            const dState = state;
            if (!dState.dialogState) {
                newConversation = true;
                dState.dialogState = {};
            }
            // Create dialog context
            const dc = yield this.createContext(context, dState.dialogState);
            // Signal start of conversation
            if (!context.responded) {
                if (newConversation && !conversationEnded) {
                    yield this.onConversationBegin(dc);
                }
            }
            else {
                console.warn(`RootDialogContainer.continue(): the root dialog was called and 'context.responded' is already true.`);
            }
            // Dispatch activity
            if (!conversationEnded && !context.responded) {
                // Check for interruptions and handle non-message activities
                yield this.onActivity(dc);
                if (!conversationEnded && !context.responded) {
                    // Continue existing dialog
                    yield dc.continue();
                    if (!conversationEnded && !context.responded && context.activity.type === botbuilder_1.ActivityTypes.Message) {
                        // Run fallback logic
                        yield this.onNoResponse(dc);
                    }
                }
            }
            // Signal end of conversation
            if (conversationEnded) {
                delete dState.dialogState;
                yield this.onConversationEnd(dc);
            }
        });
    }
    onActivity(dc) {
        switch (dc.context.activity.type) {
            case botbuilder_1.ActivityTypes.ContactRelationUpdate:
                return this.onContactRelationUpdate(dc);
            case botbuilder_1.ActivityTypes.ConversationUpdate:
                return this.onConversationUpdate(dc);
            case botbuilder_1.ActivityTypes.Event:
                return this.onEvent(dc);
            case botbuilder_1.ActivityTypes.Invoke:
                return this.onInvoke(dc);
            case botbuilder_1.ActivityTypes.Message:
                return this.onMessage(dc);
        }
    }
    onContactRelationUpdate(dc) {
        return Promise.resolve();
    }
    onConversationBegin(dc) {
        return Promise.resolve();
    }
    onConversationEnd(dc) {
        return Promise.resolve();
    }
    onConversationUpdate(dc) {
        return Promise.resolve();
    }
    onEvent(dc) {
        return Promise.resolve();
    }
    onInvoke(dc) {
        return Promise.resolve();
    }
    onMessage(dc) {
        return Promise.resolve();
    }
    onNoResponse(dc) {
        return Promise.resolve();
    }
}
exports.DialogDispatcher = DialogDispatcher;
//# sourceMappingURL=dialogDispatcher.js.map