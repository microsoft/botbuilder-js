// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ConnectionStatus } from 'botframework-webchat';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { BotAdapter, TurnContext } from 'botbuilder';

export class WebChatAdapter extends BotAdapter {
    constructor() {
        super();
        this.activity$ = new Subject();
        this.botConnection = {
            connectionStatus$: new BehaviorSubject(ConnectionStatus.Online),
            activity$: this.activity$.share(),
            end() {
                debugger
            },
            postActivity: activity => {
                const id = Date.now().toString();
                return Observable.fromPromise(this
                    .onReceive(Object.assign({}, activity, {
                        id,
                        conversation: { id: 'bot' },
                        channelId: 'WebChat'
                    }))
                    .then(() => id)
                )
            }
        }
    }

    // This WebChatAdapter implements the sendActivities method which is called by the TurnContext class
    // See: https://github.com/Microsoft/botbuilder-js/blob/master/libraries/botbuilder-core/src/turnContext.ts#L222
    // It's also possible to write a custom Context class with different methods of accessing an adapter
    sendActivities(context, activities) {
        console.log(Date.now().toString())
        const sentActivities = activities.map(activity => Object.assign({}, activity, {
            id: Date.now().toString(),
            channelId: 'WebChat',
            conversation: { id: 'bot' },
            from: { id: 'bot' },
            timestamp: Date.now()
        }));

        sentActivities.forEach(activity => this.activity$.next(activity));

        return Promise.resolve(sentActivities.map(activity => {
            id: activity.id
        }));
    }

    // Used to register business logic for the bot, it takes a handler that takes a context object as a parameter
    processActivity(logic) {
        this.logic = logic;
        return this;
    }

    onReceive(activity) {
        const context = new TurnContext(this, activity);
        return this.runMiddleware(context, this.logic || function () { });
    }
}
