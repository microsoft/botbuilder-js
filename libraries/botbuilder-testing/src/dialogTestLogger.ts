import { Middleware, TurnContext, ResourceResponse, ActivityTypes } from "botbuilder-core";
import * as mlog from 'mocha-logger';

export class DialogTestLogger implements Middleware {
    private _logger = mlog;
    private _stopwatchStateKey = Symbol('stopwatch');

    constructor(logger?: {log: (any)=>void }) {
        if (logger) {
            this._logger = logger;
        }
    }

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        // log incoming
        // todo: catch timestamp, etc
        if (context.activity.type == ActivityTypes.Message) {
            this._logger.log(`User: Text = ${ context.activity.text }`);
        } else {
            this._logger.log(`User: Activity = ${ context.activity.type }`);
            JSON.stringify(context.activity,null,2).split(/\n/).forEach((line) =>{ this._logger.log(line) });
        }
        let now = new Date();
        context.turnState[this._stopwatchStateKey] = now;
        let timestamp = `${ now.getHours() }:${ now.getMinutes() }:${ now.getSeconds() }`;
        this._logger.log(`-> ts: ${ timestamp }`);

        context.onSendActivities(async(context, activities, next): Promise<ResourceResponse[]> => {
            // log outgoing
            activities.forEach((activity) => {
                if (activity.type == ActivityTypes.Message) {
                    this._logger.log(`Bot: Text      = ${ activity.text }`);
                    this._logger.log(`     Speak     = ${ activity.speak }`);
                    this._logger.log(`     InputHint = ${ activity.inputHint }`);
                } else {
                    this._logger.log(`Bot: Activity = ${ activity.type }`);
                    JSON.stringify(activity,null,2).split(/\n/).forEach((line) =>{ this._logger.log(line) });
                }
            });
            let now = new Date();
            let stopwatch = context.turnState[this._stopwatchStateKey];
            let mms = now.getTime() - stopwatch.getTime();
            let timestamp = `${ now.getHours() }:${ now.getMinutes() }:${ now.getSeconds() }`;
            this._logger.log(`-> ts: ${ timestamp } elapsed ${ mms } ms`);

            return next();
        });
        await next();
    }

}