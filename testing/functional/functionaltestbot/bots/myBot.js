/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { ActivityHandler } = require('botbuilder');

class MyBot extends ActivityHandler {
    constructor(conversationState) {
        super();
        this.conversationState = conversationState;
        this.conversationStateAccessor = this.conversationState.createProperty('test');
        this.onMessage(async (context, next) => {

            var state = await this.conversationStateAccessor.get(context, { count: 0 });

            await context.sendActivity(`you said "${ context.activity.text }" ${ state.count }`);

            state.count++;
            await this.conversationState.saveChanges(context, false);

            await next();
        });
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(`welcome ${ membersAdded[cnt].name }`);
                }
            }
            await next();
        });        
    }
}

exports.MyBot = MyBot;