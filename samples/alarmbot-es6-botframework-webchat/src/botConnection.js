import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export class BotConnection {
    constructor(botMessagePipeline) {
        this.botMessagePipeline = botMessagePipeline;
        this.connectionStatus$ = new BehaviorSubject("Uninitialized");
        this.connectionStatus$.next("Online");
        this.activity$ = Observable.create(observer => this.messagePipelineToWebchat = observer).share();
    }

    // connectionStatus$ /*: BehaviorSubject<ConnectionStatus>*/;
    // activity$ /*: Observable<Activity>*/;
    end() {
        debugger
    }

    postActivity(activity) /* : Observable<string>; */ {
        this.botMessagePipeline(activity).then(this.handleActivitiesFromBot.bind(this));
        return Observable.of(Date.now()); // id - can be an ordinal or computed
    }

    handleActivitiesFromBot(activities) {
        activities.forEach(activity => this.messagePipelineToWebchat.next(activity));
    }
}