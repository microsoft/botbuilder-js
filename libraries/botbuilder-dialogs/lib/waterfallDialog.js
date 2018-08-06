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
/**
 * Dialog optimized for prompting a user with a series of questions.
 *
 * @remarks
 * Waterfalls accept a stack of functions which will be executed in sequence. Each waterfall step
 * can ask a question of the user and the users response will be passed as an argument to the next
 * waterfall step.
 */
class WaterfallDialog extends dialog_1.Dialog {
    /**
     * Creates a new waterfall dialog containing the given array of steps.
     * @param steps Array of waterfall steps.
     */
    constructor(dialogId, steps) {
        super(dialogId);
        this.steps = steps.slice(0);
    }
    dialogBegin(dc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize waterfall state
            const state = dc.activeDialog.state;
            state.options = options || {};
            state.values = {};
            // Run the first step
            return yield this.runStep(dc, 0, dialog_1.DialogReason.beginCalled);
        });
    }
    dialogContinue(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // Don't do anything for non-message activities
            if (dc.context.activity.type !== lib_1.ActivityTypes.Message) {
                return dialog_1.Dialog.EndOfTurn;
            }
            // Run next step with the message text as the result.
            return yield this.dialogResume(dc, dialog_1.DialogReason.continueCalled, dc.context.activity.text);
        });
    }
    dialogResume(dc, reason, result) {
        return __awaiter(this, void 0, void 0, function* () {
            // Increment step index and run step
            var state = dc.activeDialog.state;
            return yield this.runStep(dc, state.stepIndex + 1, reason, result);
        });
    }
    onStep(dc, step) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.steps[step.index](dc, step);
        });
    }
    runStep(dc, index, reason, result) {
        return __awaiter(this, void 0, void 0, function* () {
            if (index < this.steps.length) {
                // Update persisted step index
                const state = dc.activeDialog.state;
                state.stepIndex = index;
                // Create step context
                let nextCalled = false;
                const step = {
                    index: index,
                    options: state.options,
                    reason: reason,
                    result: result,
                    values: state.values,
                    next: (result) => __awaiter(this, void 0, void 0, function* () {
                        if (nextCalled) {
                            throw new Error(`WaterfallStepContext.next(): method already called for dialog and step '${this.id}[${index}]'.`);
                        }
                        return yield this.dialogResume(dc, dialog_1.DialogReason.nextCalled, result);
                    })
                };
                // Execute step
                return yield this.onStep(dc, step);
            }
            else {
                // End of waterfall so just return to parent
                return yield dc.end(result);
            }
        });
    }
}
exports.WaterfallDialog = WaterfallDialog;
//# sourceMappingURL=waterfallDialog.js.map