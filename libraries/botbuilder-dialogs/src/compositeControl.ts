/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Promiseable, TurnContext } from 'botbuilder';
import { Dialog, DialogInstance } from './dialog';
import { DialogContext, DialogResult } from './dialogContext';
import { DialogSet } from './dialogSet';


/**
 * :package: **botbuilder-dialogs**
 * 
 * A `CompositeControl` makes it easy to take an existing set of dialogs and package them up as a 
 * control that can be used within another bot. The control can be used either as a dialog added
 * to the other bots `DialogSet` or on its own for bots that are using some other conversation
 * management system.
 * 
 * ### Control Packaging
 * 
 * You'll typically want to package your control as a new class derived from `CompositeControl`.
 * Within your controls constructor you'll pass the `DialogSet` containing your controls dialogs
 * and the `ID` of the initial dialog that should be started anytime a caller calls the dialog.  
 * 
 * If your control needs to be configured then you can pass through the configuration settings as 
 * a set of `defaultOptions` which will be merged with any options passed in by the caller when 
 * they call `begin()`. These will then be passed as arguments to the initial dialog that gets 
 * started.
 * 
 * Here's a fairly simple example of a `ProfileControl` that's designed to prompt the user to 
 * enter their name and phone number which it will return as a JSON object to the caller:
 * 
 * ```JavaScript
 * const { CompositeControl, DialogSet, TextPrompt } = require('botbuilder-dialogs');
 * 
 * const dialogs = new DialogSet();
 * 
 * class ProfileControl extends CompositeControl {
 *     constructor() {
 *         super(dialogs, 'fillProfile');
 *     }
 * }
 * module.exports.ProfileControl = ProfileControl;
 * 
 * dialogs.add('fillProfile', [
 *     async function (dc, options) {
 *         dc.instance.state = {};
 *         return dc.prompt('textPrompt', `What's your name?`);
 *     },
 *     async function (dc, name) {
 *         dc.instance.state.name = name;
 *         return dc.prompt('textPrompt', `What's your phone number?`);
 *     },
 *     async function (dc, phone) {
 *         dc.instance.state.phone = phone;
 * 
 *         // Return completed profile
 *         return dc.end(dc.instance.state); 
 *     }
 * ]);
 * 
 * dialogs.add('textPrompt', new TextPrompt());
 * ```
 * 
 * ### Consume as Dialog
 * 
 * On the consumption side the control we created can be used by a bot in much the same way they 
 * would use any other prompt. They can add a new instance of the control as a named dialog to  
 * their bots `DialogSet` and then start it using a call to `DialogContext.begin()`.  If the 
 * control accepts options these can be passed in to the `begin()` call as well.
 * 
 * ```JavaScript
 * const { DialogSet } = require('botbuilder-dialogs');
 * const { ProfileControl } = require('./profileControl');
 * 
 * const dialogs = new DialogSet();
 * 
 * dialogs.add('getProfile', new ProfileControl());
 * 
 * dialogs.add('firstrun', [
 *      async function (dc) {
 *          await dc.context.sendActivity(`Welcome! We need to ask a few questions to get started.`);
 *          return dc.begin('getProfile');
 *      },
 *      async function (dc, profile) {
 *          await dc.context.sendActivity(`Thanks ${profile.name}!`);
 *          return dc.end();
 *      }
 * ]);
 * ```
 * 
 * ### Control Usage
 * 
 * If the consuming bot isn't dialog based they can still use your control. They will just need 
 * start the control from somewhere within their bots logic by calling the controls `begin()` 
 * method:
 * 
 * ```JavaScript
 * const state = {};
 * const control = new ProfileControl();
 * await prompt.begin(context, state);
 * ```
 * 
 * The control will populate the `state` object passed in with information it needs to process
 * the users response. This should be saved off with the bots conversation state as it needs to be
 * passed into the controls `continue()` method on the next turn of conversation with the user:
 * 
 * ```JavaScript
 * const control = new ProfileControl();
 * const result = await control.continue(context, state);
 * if (!result.active) {
 *     const profile = result.result;
 * }
 * ```
 * 
 * The `continue()` method returns a `DialogResult` object which can be used to determine when 
 * the control is finished and then to access any results it might have returned. To interrupt or 
 * cancel the control simply delete the `state` object the bot has been persisting.
 * @param R (Optional) type of result that's expected to be returned by the control.
 * @param O (Optional) options that can be passed into the [begin()](#begin) method.
 */
export class CompositeControl<R = any, O = {}> implements Dialog<TurnContext> {

    /**
     * Creates a new `CompositeControl` instance.
     * @param dialogs Controls dialog set.
     * @param dialogId ID of the root dialog that should be started anytime the control is started.
     * @param defaultOptions (Optional) set of default options that should be passed to controls root dialog. These will be merged with arguments passed in by the caller.
     */
    constructor(protected dialogs: DialogSet<TurnContext>, protected dialogId: string, protected defaultOptions?: O) { }

    /**
     * Starts the control. Depending on the control, its possible for the control to finish 
     * immediately so it's advised to check the result object returned by `begin()` and ensure that
     * the control is still active before continuing.
     * 
     * **Usage Example:**
     *
     * ```JavaScript
     * const state = {};
     * const result = await control.begin(context, state);
     * if (!result.active) {
     *     const value = result.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that the control will use to persist its current state. This should be an empty object which the control will populate. The bot should persist this with its other conversation state for as long as the control is still active.
     * @param options (Optional) additional options supported by the control.
     */
    public begin(context: TurnContext, state: object, options?: O): Promise<DialogResult<R>> {
        const cdc = this.dialogs.createContext(context, state);
        return cdc.begin(this.dialogId, Object.assign({}, this.defaultOptions, options))
                  .then(() => cdc.dialogResult);
    }

    /**
     * Passes a users reply to the control for further processing. The bot should keep calling 
     * `continue()` for future turns until the control returns a result with `Active == false`.
     * To cancel or interrupt the prompt simply delete the `state` object being persisted.  
     * 
     * **Usage Example:**
     *
     * ```JavaScript
     * const result = await control.continue(context, state);
     * if (!result.active) {
     *     const value = result.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that was previously initialized by a call to [begin()](#begin).
     */
    public continue(context: TurnContext, state: object): Promise<DialogResult<R>> {
        const cdc = this.dialogs.createContext(context, state);
        return cdc.continue()
                  .then(() => cdc.dialogResult);         
    }

    public dialogBegin(dc: DialogContext<TurnContext>, dialogArgs?: any): Promise<any> {
        // Start the controls entry point dialog. 
        const cdc = this.dialogs.createContext(dc.context, dc.instance.state);
        return cdc.begin(this.dialogId, Object.assign({}, this.defaultOptions, dialogArgs)).then(() => {
            // End if the controls dialog ends.
            if (!cdc.dialogResult.active) {
                return dc.end(cdc.dialogResult.result);
            }
        });
    }

    public dialogContinue(dc: DialogContext<TurnContext>): Promise<any> {
        // Continue controls dialog stack.
        const cdc = this.dialogs.createContext(dc.context, dc.instance.state);
        return cdc.continue().then(() => {
            // End if the controls dialog ends.
            if (!cdc.dialogResult.active) {
                return dc.end(cdc.dialogResult.result);
            }
        });
    }
}
