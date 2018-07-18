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
const dialog_1 = require("../dialog");
/**
 * Base class for all prompts.
 */
class Prompt extends dialog_1.Dialog {
    constructor(validator) {
        super();
        this.validator = validator;
    }
    dialogBegin(dc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // Persist options
            const instance = dc.activeDialog;
            instance.state = options || {};
            // Send initial prompt
            return yield this.onPrompt(dc, instance.state, false);
        });
    }
    dialogContinue(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // Don't do anything for non-message activities
            if (dc.context.activity.type === botbuilder_1.ActivityTypes.Message) {
                // Perform base recognition
                const options = dc.activeDialog.state;
                let recognized = yield this.onRecognize(dc, options);
                // Optionally call the configured validator
                if (this.validator) {
                    recognized = yield this.validator(dc.context, recognized);
                }
                // Return recognized value or re-prompt
                if (recognized !== undefined) {
                    return yield dc.end(recognized);
                }
                else if (!dc.context.responded) {
                    return yield this.onPrompt(dc, options, true);
                }
                else {
                    return dialog_1.Dialog.EndOfTurn;
                }
            }
        });
    }
}
exports.Prompt = Prompt;
//# sourceMappingURL=prompt.js.map