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
/**
 * Dialog optimized for prompting a user with a series of questions.
 *
 * @remarks
 * Waterfalls accept a stack of functions which will be executed in sequence. Each waterfall step
 * can ask a question of the user and the users response will be passed as an argument to the next
 * waterfall step.
 *
 * For simple text questions you can send the user a message and then process their answer in the
 * next step:
 *
 * ```JavaScript
 *  dialogs.add('namePrompt', [
 *      async function (dc) {
 *          dc.activeDialog.state.profile = { first: '', last: '', full: '' };
 *          await dc.context.sendActivity(`What's your first name?`);
 *      },
 *      async function (dc, firstName) {
 *          dc.activeDialog.state.profile.first = firstName;
 *          await dc.context.sendActivity(`Great ${firstName}! What's your last name?`);
 *      },
 *      async function (dc, lastName) {
 *          const profile = dc.activeDialog.state.profile;
 *          profile.last = lastName;
 *          profile.full = profile.first + ' ' + profile.last;
 *          await dc.end(profile);
 *      }
 *  ]);
 * ```
 *
 * For more complex sequences you can call other dialogs from within a step and the result returned
 * by the dialog will be passed to the next step:
 *
 * ```JavaScript
 *  dialogs.add('survey', [
 *      async function (dc) {
 *          dc.activeDialog.state.survey = { name: undefined, languages: '', years: 0 };
 *          await dc.begin('namePrompt');
 *      },
 *      async function (dc, name) {
 *          dc.activeDialog.state.survey.name = name;
 *          await dc.context.sendActivity(`Ok ${name.full}... What programming languages do you know?`);
 *      },
 *      async function (dc, languages) {
 *          dc.activeDialog.state.survey.languages = languages;
 *          await dc.prompt('yearsPrompt', `Great. So how many years have you been programming?`);
 *      },
 *      async function (dc, years) {
 *          dc.activeDialog.state.survey.years = years;
 *          await dc.context.sendActivity(`Thank you for taking our survey.`);
 *          await dc.end(dc.activeDialog.survey);
 *      }
 *  ]);
 *
 *  dialogs.add('yearsPrompt', new NumberPrompt(async (dc, value) => {
 *      if (value === undefined || value < 0 || value > 110) {
 *          await dc.context.sendActivity(`Enter a number from 0 to 110.`);
 *      } else {
 *          return value;
 *      }
 *  }));
 * ```
 *
 * The example builds on the previous `namePrompt` sample and shows how you can call another dialog
 * which will ask its own sequence of questions. The dialogs library provides a built-in set of
 * prompt classes which can be used to recognize things like dates and numbers in the users response.
 *
 * You should generally call `dc.end()` or `dc.replace()` from your last waterfall step but if you fail
 * to do that the dialog will be automatically ended for you on the users next reply.  The users
 * response will be passed to the calling dialogs next waterfall step if there is one.
 */
class Waterfall extends dialog_1.Dialog {
    /**
     * Creates a new waterfall dialog containing the given array of steps.
     * @param steps Array of waterfall steps.
     */
    constructor(steps) {
        super();
        this.steps = steps.slice(0);
    }
    dialogBegin(dc, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = dc.activeDialog;
            instance.step = 0;
            return yield this.runStep(dc, args);
        });
    }
    dialogContinue(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // Don't do anything for non-message activities
            if (dc.context.activity.type === botbuilder_1.ActivityTypes.Message) {
                const instance = dc.activeDialog;
                instance.step += 1;
                return yield this.runStep(dc, dc.context.activity.text);
            }
        });
    }
    dialogResume(dc, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = dc.activeDialog;
            instance.step += 1;
            return yield this.runStep(dc, result);
        });
    }
    runStep(dc, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = dc.activeDialog;
            const step = instance.step;
            if (step >= 0 && step < this.steps.length) {
                // Execute step
                return yield this.steps[step](dc, result, (r) => __awaiter(this, void 0, void 0, function* () {
                    // Skip to next step
                    instance.step += 1;
                    return yield this.runStep(dc, r);
                }));
            }
            else {
                // End of waterfall so just return to parent
                return yield dc.end(result);
            }
        });
    }
}
exports.Waterfall = Waterfall;
//# sourceMappingURL=waterfall.js.map