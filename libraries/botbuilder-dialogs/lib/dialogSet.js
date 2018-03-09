"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const waterfall_1 = require("./waterfall");
const dialogContext_1 = require("./dialogContext");
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
class DialogSet {
    /**
     * Creates an empty dialog set. The ability to name the sets dialog stack means that multiple
     * stacks can coexist within the same bot.  Middleware can use their own private set of
     * dialogs without fear of colliding with the bots dialog stack.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * const dialogs = new DialogSet('myPrivateStack');
     * ```
     * @param stackName (Optional) name of the field to store the dialog stack in off the state bag. Defaults to 'dialogStack'.
     * @param stateName (Optional) name of state bag on the context object that will be used to store the dialog stack. Defaults to `conversationState`.
     */
    constructor(stackName, stateName) {
        this.dialogs = {};
        this.stackName = stackName || 'dialogStack';
        this.stateName = stateName || 'conversationState';
    }
    add(dialogId, dialogOrSteps) {
        if (this.dialogs.hasOwnProperty(dialogId)) {
            throw new Error(`DialogSet.add(): A dialog with an id of '${dialogId}' already added.`);
        }
        return this.dialogs[dialogId] = Array.isArray(dialogOrSteps) ? new waterfall_1.Waterfall(dialogOrSteps) : dialogOrSteps;
    }
    createContext(context, stack) {
        return new dialogContext_1.DialogContext(this, context, stack || []);
    }
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
    find(dialogId) {
        return this.dialogs.hasOwnProperty(dialogId) ? this.dialogs[dialogId] : undefined;
    }
}
exports.DialogSet = DialogSet;
//# sourceMappingURL=dialogSet.js.map