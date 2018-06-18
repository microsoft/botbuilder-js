/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
import { Dialog, Waterfall, WaterfallStep } from './dialog';
import { DialogContext } from './dialogContext';
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
 * const { DialogSet, TextPrompt } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('fillProfile', [
 *     async function (dc, options) {
 *         dc.activeDialog.state.profile = {};
 *         await dc.prompt('textPrompt', `What's your name?`);
 *     },
 *     async function (dc, name) {
 *         dc.activeDialog.state.profile.name = name;
 *         await dc.prompt('textPrompt', `What's your phone number?`);
 *     },
 *     async function (dc, phone) {
 *         dc.activeDialog.state.profile.phone = phone;
 *
 *         // Save completed profile to user state
 *         const user = userState.get(context);
 *         user.profile = dc.activeDialog.state.profile;
 *
 *         // Notify user and end
 *         await dc.context.sendActivity(`Your profile was updated.`);
 *         await dc.end();
 *     }
 * ]);
 *
 * dialogs.add('textPrompt', new TextPrompt());
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
 *         // Get conversation state and create DialogContext object
 *         const conversation = conversationState.get(context);
 *         const dc = dialogs.createContext(context, conversation);
 *
 *         // Continue execution if there's an "active" dialog
 *         await dc.continue();
 *         if (!context.responded && context.activity.type === ActivityType.Message) {
 *             // No active dialogs so start 'fillProfile' dialog
 *             await dc.begin('fillProfile');
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
 * managing the dialog stack. It then calls `dc.continue()` which will route the request to the
 * "active" dialog if there is one. The active dialog is the dialog on the top of the stack.
 *
 * Upon completion of the call to continue() we use `context.responded` to determine if anything
 * processed the request. This is a reasonable approach for determining if a dialog is active given
 * that as a best practice your bot should always reply to any message received from the user. So
 * if nothing has responded and we've received a `message` activity we'll start the 'fillProfile'
 * by calling `dc.begin()`.
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
 *         // Get conversation state and create DialogContext object
 *         const conversation = conversationState.get(context);
 *         const dc = dialogs.createContext(context, conversation);
 *
 *         // Check for any interruptions
 *         const isMessage = context.activity.type === ActivityType.Message;
 *         if (isMessage) {
 *             const utterance = context.activity.text.trim().toLowerCase();
 *             if (utterance.startsWith('edit profile')) {
 *                 await dc.endAll().begin('fillProfile');
 *                 return;
 *             } else if (utterance.startsWith('cancel')) {
 *                 if (dc.activeDialog) {
 *                     dc.endAll();
 *                     await context.sendActivity(`Task canceled`);
 *                 } else {
 *                     await context.sendActivity(`Nothing to cancel`);
 *                 }
 *                 return;
 *             }
 *         }
 *
 *         // Continue execution if there's an "active" dialog
 *         await dc.continue();
 *         if (!context.responded && isMessage) {
 *             // Greet user and fill in profile if missing
 *             const user = userState.get(context);
 *             if (!user.profile) {
 *                 await context.sendActivity(`Hello... Lets fill out your profile to get started.`);
 *                 await dc.begin('fillProfile');
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
export declare class DialogSet<C extends TurnContext = TurnContext> {
    private readonly dialogs;
    /**
     * Adds a new dialog to the set and returns the added dialog.
     *
     * @remarks
     * This example adds a waterfall dialog the greets the user with "Hello World!":
     *
     * ```JavaScript
     * dialogs.add('greeting', [
     *      async function (dc) {
     *          await dc.context.sendActivity(`Hello world!`);
     *          await dc.end();
     *      }
     * ]);
     * ```
     * @param dialogId Unique ID of the dialog within the set.
     * @param dialogOrSteps Either a new dialog or an array of waterfall steps to execute. If waterfall steps are passed in they will automatically be passed into an new instance of a `Waterfall` class.
     */
    add(dialogId: string, dialogOrSteps: Dialog<C>): Dialog<C>;
    add(dialogId: string, dialogOrSteps: WaterfallStep<C>[]): Waterfall<C>;
    createContext(context: C, state: object): DialogContext<C>;
    /**
     * Finds a dialog that was previously added to the set using [add()](#add).
     *
     * @remarks
     * This example finds a a dialog named "greeting":
     *
     * ```JavaScript
     * const dialog = dialogs.find('greeting');
     * ```
     * @param T (Optional) type of dialog returned.
     * @param dialogId ID of the dialog/prompt to lookup.
     */
    find<T extends Dialog<C> = Dialog<C>>(dialogId: string): T | undefined;
}
