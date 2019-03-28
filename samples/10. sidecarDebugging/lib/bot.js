"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
const botframework_schema_1 = require("botframework-schema");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const slotFillingDialog_1 = require("./slotFillingDialog");
const slotDetails_1 = require("./slotDetails");
const DIALOG_STATE_PROPERTY = 'dialogState';
class EmulatorAwareBot {
    /**
     * SampleBot defines the core business logic of this bot.
     * @param {ConversationState} conversationState A ConversationState object used to store dialog state.
     */
    constructor(conversationState) {
        this.conversationState = conversationState;
        // Create a property used to store dialog state.
        // See https://aka.ms/about-bot-state-accessors to learn more about bot state and state accessors.
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        // Create a dialog set to include the dialogs used by this bot.
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogState);
        // Set up a series of questions for collecting the user's name.
        const fullnameSlots = [
            new slotDetails_1.SlotDetails('first', 'text', 'Please enter your first name.'),
            new slotDetails_1.SlotDetails('last', 'text', 'Please enter your last name.')
        ];
        // Set up a series of questions to collect a street address.
        const addressSlots = [
            new slotDetails_1.SlotDetails('street', 'text', 'Please enter your street address.'),
            new slotDetails_1.SlotDetails('city', 'text', 'Please enter the city.'),
            new slotDetails_1.SlotDetails('zip', 'text', 'Please enter your zipcode.')
        ];
        // Link the questions together into a parent group that contains references
        // to both the fullname and address questions defined above.
        const slots = [
            new slotDetails_1.SlotDetails('fullname', 'fullname'),
            new slotDetails_1.SlotDetails('age', 'number', 'Please enter your age.'),
            new slotDetails_1.SlotDetails('shoesize', 'shoesize', 'Please enter your shoe size.', 'You must enter a size between 0 and 16. Half sizes are acceptable.'),
            new slotDetails_1.SlotDetails('address', 'address')
        ];
        // Add the individual child dialogs and prompts used.
        // Note that the built-in prompts work hand-in-hand with our custom SlotFillingDialog class
        // because they are both based on the provided Dialog class.
        this.dialogs.add(new slotFillingDialog_1.SlotFillingDialog('address', addressSlots));
        this.dialogs.add(new slotFillingDialog_1.SlotFillingDialog('fullname', fullnameSlots));
        this.dialogs.add(new botbuilder_dialogs_1.TextPrompt('text'));
        this.dialogs.add(new botbuilder_dialogs_1.NumberPrompt('number'));
        this.dialogs.add(new botbuilder_dialogs_1.NumberPrompt('shoesize', this.shoeSizeValidator));
        this.dialogs.add(new slotFillingDialog_1.SlotFillingDialog('slot-dialog', slots));
        // Finally, add a 2-step WaterfallDialog that will initiate the SlotFillingDialog,
        // and then collect and display the results.
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog('root', [
            this.startDialog.bind(this),
            this.processResults.bind(this)
        ]));
    }
    // This is the first step of the WaterfallDialog.
    // It kicks off the dialog with the multi-question SlotFillingDialog,
    // then passes the aggregated results on to the next step.
    async startDialog(step) {
        return await step.beginDialog('slot-dialog');
    }
    // This is the second step of the WaterfallDialog.
    // It receives the results of the SlotFillingDialog and displays them.
    async processResults(step) {
        // Each "slot" in the SlotFillingDialog is represented by a field in step.result.values.
        // The complex that contain subfields have their own .values field containing the sub-values.
        const values = step.result.values;
        const fullname = values['fullname'].values;
        await step.context.sendActivity(`Your name is ${fullname['first']} ${fullname['last']}.`);
        await step.context.sendActivity(`You wear a size ${values['shoesize']} shoes.`);
        const address = values['address'].values;
        await step.context.sendActivity(`Your address is: ${address['street']}, ${address['city']} ${address['zip']}`);
        return await step.endDialog();
    }
    // Validate that the provided shoe size is between 0 and 16, and allow half steps.
    // This is used to instantiate a specialized NumberPrompt.
    async shoeSizeValidator(prompt) {
        if (prompt.recognized.succeeded) {
            const shoesize = prompt.recognized.value;
            // Shoe sizes can range from 0 to 16.
            if (shoesize >= 0 && shoesize <= 16) {
                // We only accept round numbers or half sizes.
                if (Math.floor(shoesize) === shoesize || Math.floor(shoesize * 2) === shoesize * 2) {
                    // Indicate success.
                    return true;
                }
            }
        }
        return false;
    }
    /**
     *
     * @param {TurnContext} turnContext A TurnContext object representing an incoming message to be handled by the bot.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === botframework_schema_1.ActivityTypes.Message) {
            // Create dialog context.
            const dc = await this.dialogs.createContext(turnContext);
            const utterance = (turnContext.activity.text || '').trim().toLowerCase();
            if (utterance === 'cancel') {
                if (dc.activeDialog) {
                    await dc.cancelAllDialogs();
                    await dc.context.sendActivity(`Ok... canceled.`);
                }
                else {
                    await dc.context.sendActivity(`Nothing to cancel.`);
                }
            }
            if (!dc.context.responded) {
                // Continue the current dialog if one is pending.
                await dc.continueDialog();
            }
            if (!dc.context.responded) {
                // If no response has been sent, start the onboarding dialog.
                await dc.beginDialog('root');
            }
        }
        else if (turnContext.activity.type === botframework_schema_1.ActivityTypes.ConversationUpdate &&
            turnContext.activity.membersAdded[0].name !== 'Bot') {
            // Send a "this is what the bot does" message.
            const description = [
                'This is a bot that demonstrates an alternate dialog system',
                'which uses a slot filling technique to collect multiple responses from a user.',
                'Say anything to continue.'
            ];
            await turnContext.sendActivity(description.join(' '));
        }
        await this.conversationState.saveChanges(turnContext);
    }
}
exports.EmulatorAwareBot = EmulatorAwareBot;
//# sourceMappingURL=bot.js.map