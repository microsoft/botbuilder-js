"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dialog_1 = require("./dialog");
const dialogContext_1 = require("./dialogContext");
const dialogSet_1 = require("./dialogSet");
/**
 * The `DialogContainer` class lets you break your bots logic up into components that can be added
 * as a dialog to other dialog sets within your bots project or exported and used in other bot
 * projects.
 *
 * @remarks
 * `DialogContainers` allow for the creation of libraries of reusable dialog components.
 *
 * #### Component Creation
 *
 * To create a reusable dialog component you'll want to define a new class derived from
 * `DialogContainer`. Your component has its own `DialogSet` which you can add dialogs to from
 * within your classes constructor.  You can add as many dialogs as you like and the dialogs can
 * be waterfalls, prompts, or even other component dialogs.
 *
 * Since developers will add instances of your component to their bots as other named dialogs, the
 * DialogContainer needs to know the ID of the initial dialog it should start anytime it's started.
 *
 * Here's a fairly simple example of a `ProfileDialog` that's designed to prompt the user to
 * enter their name and phone number which it will return as a JSON object to the caller:
 *
 * ```JavaScript
 * const { DialogContainer, TextPrompt } = require('botbuilder-dialogs');
 *
 * class ProfileDialog extends DialogContainer {
 *     constructor() {
 *         super('fillProfile');
 *
 *         this.dialogs.add('fillProfile', [
 *             async function (dc, options) {
 *                 dc.instance.state = {};
 *                 await dc.prompt('textPrompt', `What's your name?`);
 *             },
 *             async function (dc, name) {
 *                 dc.instance.state.name = name;
 *                 await dc.prompt('textPrompt', `What's your phone number?`);
 *             },
 *             async function (dc, phone) {
 *                 dc.instance.state.phone = phone;
 *
 *                 // Return completed profile
 *                 await dc.end(dc.instance.state);
 *            }
 *        ]);
 *
 *        this.dialogs.add('textPrompt', new TextPrompt());
 *     }
 * }
 * module.exports.ProfileDialog = ProfileDialog;
 * ```
 *
 * We've added two dialogs to our component, a waterfall and a prompt. And we've told the
 * DialogContainer that it should start the 'fillProfile' dialog anytime an instance of the
 * `ProfileDialog` is started. The DialogContainer will manager persisting the controls dialog
 * stack to the callers dialog stack.
 *
 * #### Component Usage
 *
 * On the consumption side the dialog we created can be used by a bot in much the same way they
 * would use any other prompt. They can add a new instance of the component as a named dialog to
 * their bots `DialogSet` and then start it using a call to `DialogContext.begin()`. If the
 * dialog accepts options these can be passed in to the `begin()` call and the `DialogContainer`
 * will pass them through as args to the initial dialog it starts.
 *
 * ```JavaScript
 * const { DialogSet } = require('botbuilder-dialogs');
 * const { ProfileDialog } = require('./profileControl');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('getProfile', new ProfileDialog());
 *
 * dialogs.add('firstrun', [
 *      async function (dc) {
 *          await dc.context.sendActivity(`Welcome! We need to ask a few questions to get started.`);
 *          await dc.begin('getProfile');
 *      },
 *      async function (dc, profile) {
 *          await dc.context.sendActivity(`Thanks ${profile.name}!`);
 *          await dc.end();
 *      }
 * ]);
 * ```
 * @param R (Optional) type of result that's expected to be returned by the dialog.
 * @param O (Optional) options that can be passed into the begin() method.
 * @param C (Optional) type of `TurnContext` being passed to dialogs in the set.
 */
class DialogContainer extends dialog_1.Dialog {
    /**
     * Creates a new `DialogContainer` instance.
     * @param initialDialogId ID of the dialog, within the containers dialog set, that should be started anytime an instance of the `DialogContainer` is started.
     * @param dialogs (Optional) set of existing dialogs the container should use. If omitted an empty set will be created.
     */
    constructor(initialDialogId, dialogs) {
        super();
        this.initialDialogId = initialDialogId;
        this.dialogs = dialogs || new dialogSet_1.DialogSet();
    }
    dialogBegin(dc, dialogArgs) {
        // Start the dialogs entry point dialog.
        let result;
        const cdc = new dialogContext_1.DialogContext(this.dialogs, dc.context, dc.activeDialog.state, (r) => { result = r; });
        return cdc.begin(this.initialDialogId, dialogArgs).then(() => {
            // End if the dialogs dialog ends.
            if (!cdc.activeDialog) {
                return dc.end(result);
            }
        });
    }
    dialogContinue(dc) {
        // Continue dialogs dialog stack.
        let result;
        const cdc = new dialogContext_1.DialogContext(this.dialogs, dc.context, dc.activeDialog.state, (r) => { result = r; });
        return cdc.continue().then(() => {
            // End if the dialogs dialog ends.
            if (!cdc.activeDialog) {
                return dc.end(result);
            }
        });
    }
}
exports.DialogContainer = DialogContainer;
//# sourceMappingURL=dialogContainer.js.map