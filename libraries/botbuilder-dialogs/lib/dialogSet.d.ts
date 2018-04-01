/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
import { Dialog } from './dialog';
import { Waterfall, WaterfallStep } from './waterfall';
import { DialogContext } from './dialogContext';
/**
 * A related set of dialogs that can all call each other.
 *
 * **Example usage:**
 *
 * ```JavaScript
 * const { Bot, MemoryStorage, BotStateManager } = require('botbuilder');
 * const { ConsoleAdapter } = require('botbuilder-node');
 * const { DialogSet } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('greeting', [
 *      function (context) {
 *          context.reply(`Hello... I'm a bot :)`);
 *          return dialogs.end(context);
 *      }
 * ]);
 *
 * const adapter = new ConsoleAdapter().listen();
 * const bot = new Bot(adapter)
 *      .use(new MemoryStorage())
 *      .use(new BotStateManager())
 *      .onReceive((context) => {
 *          return dialogs.continue(context).then(() => {
 *              // If nothing has responded start greeting dialog
 *              if (!context.responded) {
 *                  return dialogs.begin(context, 'greeting');
 *              }
 *          });
 *      });
 * ```
 */
export declare class DialogSet<C extends TurnContext = TurnContext> {
    private readonly dialogs;
    /**
     * Adds a new dialog to the set and returns the added dialog.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * dialogs.add('greeting', [
     *      function (context, user) {
     *          context.reply(`Hello ${user.name}... I'm a bot :)`);
     *          return dialogs.end(context);
     *      }
     * ]);
     * ```
     * @param T Type of the dialog being set and returned.
     * @param dialogId Unique ID of the dialog within the set.
     * @param dialogOrSteps Either a new dialog or an array of waterfall steps to execute. If waterfall steps are passed in they will automatically be passed into an new instance of a `Waterfall` class.
     */
    add(dialogId: string, dialogOrSteps: Dialog<C>): Dialog<C>;
    add(dialogId: string, dialogOrSteps: WaterfallStep<C>[]): Waterfall<C>;
    createContext(context: C, state: object): DialogContext<C>;
    /**
     * Finds a dialog that was previously added to the set using [add()](#add).
     *
     * **Example usage:**
     *
     * ```JavaScript
     * const dialog = dialogs.find('greeting');
     * ```
     * @param T (Optional) type of dialog returned.
     * @param dialogId ID of the dialog/prompt to lookup.
     */
    find<T extends Dialog<C> = Dialog<C>>(dialogId: string): T | undefined;
}
