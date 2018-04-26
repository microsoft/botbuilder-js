/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
import { Dialog } from './dialog';
import { DialogContext, DialogResult } from './dialogContext';
/**
 * :package: **botbuilder-dialogs**
 *
 * Base class for any dialog that wants to support being used as a dialog within a bots `DialogSet`
 * or on its own as a control within a bot that uses an alternate conversation management system.
 *
 * The `Control` and `CompositeControl` classes are very similar in that they both add `begin()`
 * and `continue()` methods which simplify consuming the control from a non-dialog based bot. The
 * primary difference between the two classes is that the `CompositeControl` class is designed to
 * bridge one `DialogSet` to another where the `Control` class assumes that the derived dialog can
 * be used in complete isolation without the need for any other supporting dialogs.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param R (Optional) type of result that's expected to be returned by the control.
 * @param O (Optional) options that can be passed into the [begin()](#begin) method.
 */
export declare abstract class Control<C extends TurnContext, R = any, O = {}> implements Dialog<C> {
    protected defaultOptions: O;
    /**
     * Creates a new Control instance.
     * @param defaultOptions (Optional) set of default options that should be passed to controls `dialogBegin()` method. These will be merged with arguments passed in by the caller.
     */
    constructor(defaultOptions?: O);
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
    begin(context: C, state: object, options?: O): Promise<DialogResult<R>>;
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
    continue(context: C, state: object): Promise<DialogResult<R>>;
    abstract dialogBegin(dc: DialogContext<C>, dialogArgs?: any): Promise<any>;
}
