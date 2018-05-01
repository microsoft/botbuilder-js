/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, BotState, StoreItem, Activity, Promiseable } from 'botbuilder';
import { Dialog, Waterfall, WaterfallStep } from './dialog';
import { DialogContext } from './dialogContext';

/**
 * :package: **botbuilder-dialogs**
 * 
 * A related set of dialogs that can all call each other.
 * 
 * ### Overview
 * 
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
 *         dc.instance.state = {};
 *         await dc.prompt('textPrompt', `What's your name?`);
 *     },
 *     async function (dc, name) {
 *         dc.instance.state.name = name;
 *         await dc.prompt('textPrompt', `What's your phone number?`);
 *     },
 *     async function (dc, phone) {
 *         dc.instance.state.phone = phone;
 * 
 *         // Return completed profile
 *         await dc.end(dc.instance.state); 
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
 * ### Routing Requests
 * 
 * To run the 'fillProfile' dialog above we need to add a bit of fairly boilerplate code to
 * our bots routing logic:
 * 
 * ```JavaScript
 * server.post('/api/messages', (req, res) => {
 *     adapter.processActivity(req, res, async (context) => {
 *         // Continue execution if there's a "current" dialog
 *         const state = conversationState.get(context);
 *         const dc = dialogs.createContext(context, state);
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
 * The code first creates a `DialogContext` and then calls `dc.continue()` which will route the 
 * request to the "current" dialog on the top of the stack, if there is one. It's using 
 * `context.responded` to determine if anything processed the request which is reasonable given 
 * that as a best practice your bot should always reply to any message received from the user. So 
 * if nothing has responded and we've received a `message` activity we'll start the 'fillProfile' 
 * by calling `dc.begin()`.
 * 
 * ### Detecting Interruptions
 * 
 * 
 *
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 */
export class DialogSet<C extends TurnContext = TurnContext> {
    private readonly dialogs: { [id:string]: Dialog<C>; } = {};

    /**
     * Adds a new dialog to the set and returns the added dialog.
     * 
     * **Example usage:**
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
    public add(dialogId: string, dialogOrSteps: Dialog<C>): Dialog<C>;
    public add(dialogId: string, dialogOrSteps: WaterfallStep<C>[]): Waterfall<C>;
    public add(dialogId: string, dialogOrSteps: Dialog<C>|WaterfallStep<C>[]): Dialog<C> {
        if (this.dialogs.hasOwnProperty(dialogId)) { throw new Error(`DialogSet.add(): A dialog with an id of '${dialogId}' already added.`) }
        return this.dialogs[dialogId] = Array.isArray(dialogOrSteps) ? new Waterfall(dialogOrSteps as any) : dialogOrSteps;
    }

    public createContext(context: C, state: object): DialogContext<C> {
        return new DialogContext(this, context, state);
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
    public find<T extends Dialog<C> = Dialog<C>>(dialogId: string): T|undefined {
        return this.dialogs.hasOwnProperty(dialogId) ? this.dialogs[dialogId] as T : undefined;
    }
}


