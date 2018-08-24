// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const mainState = require('./mainState');
 
class MainDialog {

    constructor (conversationState) {
        this.state = new mainState(conversationState);
    }

    // handle the OnTurn
    // context obj holds TuenContext for a given event 
    async onTurn(context) {
        // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
        if (context.activity.type === 'message') {
            
            // read from state.
            let count = await this.state.get(context);
            count = count === undefined ? 0 : count;
            await context.sendActivity(`${count}: You said "${context.activity.text}"`);
            // increment and set turn counter.
            this.state.set(context, ++count);
        }
        else {
            await context.sendActivity(`[${context.activity.type} event detected]`);
        }
    }
}

module.exports = MainDialog;