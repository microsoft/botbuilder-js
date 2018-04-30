"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_1 = require("botbuilder");
const dialogContext_1 = require("./dialogContext");
const dialogSet_1 = require("./dialogSet");
/**
 * :package: **botbuilder-dialogs**
 *
 * Base class for all dialogs.
 *
 * The `Control` and `CompositeControl` classes are very similar in that they both add `begin()`
 * and `continue()` methods which simplify consuming the dialog from a non-dialog based bot. The
 * primary difference between the two classes is that the `CompositeControl` class is designed to
 * bridge one `DialogSet` to another where the `Control` class assumes that the derived dialog can
 * be used in complete isolation without the need for any other supporting dialogs.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param R (Optional) type of result that's expected to be returned by the dialog.
 * @param O (Optional) options that can be passed into the [begin()](#begin) method.
 */
class Dialog {
    /**
     * Starts the dialog. Depending on the dialog, its possible for the dialog to finish
     * immediately so it's advised to check the completion object returned by `begin()` and ensure
     * that the dialog is still active before continuing.
     *
     * **Usage Example:**
     *
     * ```JavaScript
     * const state = {};
     * const completion = await dialog.begin(context, state);
     * if (completion.isCompleted) {
     *     const value = completion.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that the dialog will use to persist its current state. This should be an empty object which the dialog will populate. The bot should persist this with its other conversation state for as long as the dialog is still active.
     * @param options (Optional) additional options supported by the dialog.
     */
    begin(context, state, options) {
        // Create empty dialog set and add ourselves to it
        const dialogs = new dialogSet_1.DialogSet();
        dialogs.add('dialog', this);
        // Start the dialog
        let result;
        const dc = new dialogContext_1.DialogContext(dialogs, context, state, (r) => { result = r; });
        return dc.begin('dialog', options)
            .then(() => dc.activeDialog ? { isActive: true, isCompleted: false } : { isActive: false, isCompleted: true, result: result });
    }
    /**
     * Passes a users reply to the dialog for further processing. The bot should keep calling
     * `continue()` for future turns until the dialog returns a completion object with
     * `isCompleted == true`. To cancel or interrupt the prompt simply delete the `state` object
     * being persisted.
     *
     * **Usage Example:**
     *
     * ```JavaScript
     * const completion = await dialog.continue(context, state);
     * if (completion.isCompleted) {
     *     const value = completion.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that was previously initialized by a call to [begin()](#begin).
     */
    continue(context, state) {
        // Create empty dialog set and add ourselves to it
        const dialogs = new dialogSet_1.DialogSet();
        dialogs.add('dialog', this);
        // Continue the dialog
        let result;
        const dc = new dialogContext_1.DialogContext(dialogs, context, state, (r) => { result = r; });
        if (dc.activeDialog) {
            return dc.continue()
                .then(() => dc.activeDialog ? { isActive: true, isCompleted: false } : { isActive: false, isCompleted: true, result: result });
        }
        else {
            return Promise.resolve({ isActive: false, isCompleted: false });
        }
    }
}
exports.Dialog = Dialog;
/**
 * :package: **botbuilder-dialogs**
 *
 * Dialog optimized for prompting a user with a series of questions. Waterfalls accept a stack of
 * functions which will be executed in sequence. Each waterfall step can ask a question of the user
 * and the users response will be passed as an argument to the next waterfall step.
 *
 * For simple text questions you can send the user a message and then process their answer in the
 * next step:
 *
 * ```JS
 *  dialogs.add('namePrompt', [
 *      async function (dc) {
 *          dc.instance.state = { first: '', last: '', full: '' };
 *          await dc.context.sendActivity(`What's your first name?`);
 *      },
 *      async function (dc, firstName) {
 *          dc.instance.state.first = firstName;
 *          await dc.context.sendActivity(`Great ${firstName}! What's your last name?`);
 *      },
 *      async function (dc, lastName) {
 *          const name = dc.instance.state;
 *          name.last = lastName;
 *          name.full = name.first + ' ' + name.last;
 *          await dc.end(name);
 *      }
 *  ]);
 * ```
 *
 * For more complex sequences you can call other dialogs from within a step and the result returned
 * by the dialog will be passed to the next step:
 *
 * ```JS
 *  dialogs.add('survey', [
 *      async function (dc) {
 *          dc.instance.state = { name: undefined, languages: '', years: 0 };
 *          await dc.begin('namePrompt');
 *      },
 *      async function (dc, name) {
 *          dc.instance.state.name = name;
 *          await dc.context.sendActivity(`Ok ${name.full}... What programming languages do you know?`);
 *      },
 *      async function (dc, languages) {
 *          dc.instance.state.languages = languages;
 *          await dc.prompt('yearsPrompt', `Great. So how many years have you been programming?`);
 *      },
 *      async function (dc, years) {
 *          dc.instance.state.years = years;
 *          await dc.context.sendActivity(`Thank you for taking our survey.`);
 *          await dc.end(dc.instance.state);
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
class Waterfall extends Dialog {
    /**
     * Creates a new waterfall dialog containing the given array of steps.
     * @param steps Array of waterfall steps.
     */
    constructor(steps) {
        super();
        this.steps = steps.slice(0);
    }
    dialogBegin(dc, args) {
        const instance = dc.activeDialog;
        instance.step = 0;
        return this.runStep(dc, args);
    }
    dialogContinue(dc) {
        // Don't do anything for non-message activities
        if (dc.context.activity.type === botbuilder_1.ActivityTypes.Message) {
            const instance = dc.activeDialog;
            instance.step += 1;
            return this.runStep(dc, dc.context.activity.text);
        }
        else {
            return Promise.resolve();
        }
    }
    dialogResume(dc, result) {
        const instance = dc.activeDialog;
        instance.step += 1;
        return this.runStep(dc, result);
    }
    runStep(dc, result) {
        try {
            const instance = dc.activeDialog;
            const step = instance.step;
            if (step >= 0 && step < this.steps.length) {
                // Execute step
                return Promise.resolve(this.steps[step](dc, result, (r) => {
                    // Skip to next step
                    instance.step += 1;
                    return this.runStep(dc, r);
                }));
            }
            else {
                // End of waterfall so just return to parent
                return dc.end(result);
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
}
exports.Waterfall = Waterfall;
//# sourceMappingURL=dialog.js.map