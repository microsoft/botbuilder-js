import { ConnectionStatus } from 'botframework-webchat';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

export class WebChatAdapter {
    constructor() {
        this.activity$ = new Subject();
        this.botConnection = {
            connectionStatus$: new BehaviorSubject(ConnectionStatus.Uninitialized),
            activity$: this.activity$.share(),
            end() {
                debugger
            },
            postActivity: activity => {
                const id = Date.now().toString();
                return Observable.fromPromise(this
                    .onReceive(Object.assign({}, activity, {
                        id,
                        conversation: { id: "bot" },
                        channelId: 'WebChat'
                    }))
                    .then(() => id)
                )
            }
        }
    }

    post(activities) {
        let sentActivities = activities.map(activity => Object.assign({}, activity, {
            id: Date.now().toString(),
            channelId: 'WebChat',
            conversation: { id: 'bot' },
            from: { id: 'bot' }
        }));

        sentActivities.forEach(activity => this.activity$.next(activity));

        return Promise.resolve(sentActivities.map(activity => {
            id: activity.id
        }));
    }

    onReceive(activity) {
        // overwritten by bot
        return Promise.resolve();
    }
}
