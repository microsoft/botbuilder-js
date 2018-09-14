/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StatePropertyAccessor, TurnContext } from 'botbuilder-core';
import { Dialog } from './dialog';
import { DialogContext, DialogState } from './dialogContext';

/**
 * A related set of dialogs that can all call each other.
 *
 * @remarks
 * The dialogs library uses a stack based metaphor to manage a bot conversation with a user. In
 * this model the bt begins dialogs to prompt the user for information. Those dialogs will
 * typically call prompts to actually ask the user for information. A variety of typed prompts are
 * provided and are themselves just other dialogs. When a prompt recognizes a users input as being
 * valid, it will end itself and return the users input to the dialog that started it. That dialog
 * is then free to either process the users input or ask the user for more information by pushing
 * other dialogs/prompts onto the stack.  Below is a simple `Waterfall` dialog that asks the user
 * for their name and phone number:
 *
 * ```JavaScript
 * const { DialogSet, TextPrompt, WaterfallDialog, UserState, MemoryStorage } = require('botbuilder-dialogs');
 *
 * const memoryStorage = new MemoryStorage();
 * const userState = new UserState(memoryStorage);
 * const dialogs = new DialogSet();
 * const userProfile = userState.createProperty('profile');
 * 
 * dialogs.add(new WaterfallDialog('fillProfile', [
 *     async (step) => {
 *         step.values.profile = {};
 *         return await step.prompt('textPrompt', `What's your name?`);
 *     },
 *     async (step) => {
 *         step.values.profile.name = step.result;
 *         return await step.prompt('textPrompt', `What's your phone number?`);
 *     },
 *     async (step) => {
 *         step.values.profile.phone = step.result;
 *
 *         // Save completed profile to user state
 *         const user = await userProfile.get(step.context);
 *         user.profile = step.values.profile;
 *         await userProfile.set(step.context, user);
 *
 *         // Notify user and end
 *         await step.context.sendActivity(`Your profile was updated.`);
 *         return await step.endDialog();
 *     }
 * ]));
 *
 * dialogs.add(new TextPrompt('textPrompt'));
 * ```
 *
 * At first glance it probably looks like we're making this simple task of asking the user two
 * questions way harder then it needs to be. It turns out though that asking a user even one
 * question is a really hard problem. The primary issues coming from the fact that a) your bot will
 * likely be running across multiple compute nodes and the node that asked the user a question may
 * not be the one that receives their answer. and b) it could be minutes, hours, days, or even
 * weeks before the user replies to the bot. Your bots compute process could have been restarted
 * or updated any number of times before the user replies to the last question.
 *
 * The dialogs library addresses both of those issues by having you statically define and
 * explicitly name all of your bots dialogs on startups. It then uses a persisted dialog stack to
 * essentially maintain a program pointer so that any time a message is received from a user it can
 * identify the function it should run to process that message in a deterministic way.
 *
 * #### Routing Requests
 *
 * To run the 'fillProfile' dialog above we need to add a bit of fairly boilerplate code to
 * our bots routing logic:
 *
 * ```JavaScript
 * server.post('/api/messages', (req, res) => {
 *     adapter.processActivity(req, res, async (context) => {
 *         // Create DialogContext object
 *         const dc = await dialogs.createContext(context);
 *
 *         // Continue execution if there's an "active" dialog
 *         await dc.continueDialog();
 *
 *         if (!context.responded && context.activity.type === ActivityType.Message) {
 *             // No active dialogs so start 'fillProfile' dialog
 *             await dc.beginDialog('fillProfile');
 *         }
 *     });
 * });
 * ```
 *
 * This code results in a bot that loops over prompting the user to fill out their profile so
 * while not overly useful it does serve as a good starting point for understanding how to route
 * request to your bots dialogs.
 *
 * The code first retrieves the bots conversation state and then creates a `DialogContext` for
 * managing the dialog stack. It then calls `dc.continueDialog()` which will route the request to the
 * "active" dialog if there is one. The active dialog is the dialog on the top of the stack.
 *
 * Upon completion of the call to continue() we use `context.responded` to determine if anything
 * processed the request. This is a reasonable approach for determining if a dialog is active given
 * that as a best practice your bot should always reply to any message received from the user. So
 * if nothing has responded and we've received a `message` activity we'll start the 'fillProfile'
 * by calling `dc.beginDialog()`.
 *
 * #### Detecting Interruptions
 *
 * The previous routing example, while functional, has a few issues. 1) it constantly loops over
 * having the user fill in their profile which isn't super useful. And 2) it doesn't let the user
 * deviate from the bots pre-programmed conversation flow. We call this a purely "Bot Guided"
 * conversation flow and it can often lead to frustrating usage experiences for the user. To help
 * avoid a frustrating user experience and to give the user more of a feeling that they're in
 * control we can add to our routing logic the ability for the user to both initiate tasks and
 * interrupt existing tasks.
 *
 * ```JavaScript
 * server.post('/api/messages', (req, res) => {
 *     adapter.processActivity(req, res, async (context) => {
 *         // Create DialogContext object
 *         const dc = await dialogs.createContext(context);
 *
 *         // Check for any interruptions
 *         const isMessage = context.activity.type === ActivityType.Message;
 *         if (isMessage) {
 *             const utterance = context.activity.text.trim().toLowerCase();
 *             if (utterance.startsWith('edit profile')) {
 *                 return await dc.cancelAlDialogs().beginDialog('fillProfile');
 *             } else if (utterance.startsWith('cancel')) {
 *                 if (dc.activeDialog) {
 *                     await dc.cancelAllDialogs();
 *                     return await context.sendActivity(`Task canceled`);
 *                 } else {
 *                     return await context.sendActivity(`Nothing to cancel`);
 *                 }
 *             }
 *         }
 *
 *         // Continue execution if there's an "active" dialog
 *         await dc.continueDialog();
 * 
 *         if (!context.responded && isMessage) {
 *             // Greet user and fill in profile if missing
 *             const user = await userState.get(context);
 *             if (!user.profile) {
 *                 await context.sendActivity(`Hello... Lets fill out your profile to get started.`);
 *                 await dc.beginDialog('fillProfile');
 *             } else {
 *                 await context.sendActivity(`I'm sorry I didn't understand. Try saying "edit profile".`);
 *             }
 *         }
 *     });
 * });
 * ```
 *
 * Our routing logic has been updated to first check for any interruptions before routing the
 * users reply to the active dialog. The user can, at any time, say "edit profile" to change update
 * their profile info or "cancel" to abort whatever task they're in the middle of. We've also
 * changed our fallback logic to only start the 'fillProfile' dialog once when a user first
 * messages our bot.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 */
export class DialogSet {
    private readonly dialogs: { [id: string]: Dialog } = {};

    // NEW
    constructor(private readonly dialogState: StatePropertyAccessor<DialogState>) { }

    /**
     * Adds a new dialog to the set and returns the added dialog.
     *
     * @remarks
     * This example adds a waterfall dialog the greets the user with "Hello World!":
     *
     * ```JavaScript
     * dialogs.add(new Waterfall('greeting', [
     *      async function (step) {
     *          await step.context.sendActivity(`Hello world!`);
     *          await step.endDialog();
     *      }
     * ]));
     * ```
     * @param dialog The dialog being added.
     * @returns DialogSet so you can fluently add more
     */
    public add<T extends Dialog>(dialog: T): DialogSet {
        if (!(dialog instanceof Dialog)) { throw new Error(`DialogSet.add(): Invalid dialog being added.`); }
        if (typeof dialog.id !== 'string' || dialog.id.length === 0) {
            throw new Error(`DialogSet.add(): Dialog being added is missing its 'id'.`);
        }
        if (this.dialogs.hasOwnProperty(dialog.id)) {
            throw new Error(`DialogSet.add(): A dialog with an id of '${dialog.id}' already added.`);
        }

         this.dialogs[dialog.id] = dialog;
         return this;
    }

    /**
     * Creates a dialog context which can be used to work with the dialogs in the set.
     *
     * @remarks
     * This example loads in the bots conversation state and then creates a DialogContext bound to
     * that state.
     *
     * ```JavaScript
     * const dc = await dialogs.createContext(context);
     * ```
     * @param context Context for the current turn of conversation with the user.
     */
    public async createContext(context: TurnContext): Promise<DialogContext> {
        if (!this.dialogState) {
            throw new Error(`DialogSet.createContextAsync(): the dialog set was not bound to a stateProperty when constructed.`);
        }
        const state: DialogState = await this.dialogState.get(context, { dialogStack: [] } as DialogState);

        return new DialogContext(this, context, state);
    }

    /**
     * Finds a dialog that was previously added to the set using [add()](#add).
     *
     * @remarks
     * This example finds a dialog named "greeting":
     *
     * ```JavaScript
     * const dialog = dialogs.find('greeting');
     * ```
     * @param dialogId ID of the dialog/prompt to lookup.
     */
    public find(dialogId: string): Dialog|undefined {
        return this.dialogs.hasOwnProperty(dialogId) ? this.dialogs[dialogId] : undefined;
    }
}
