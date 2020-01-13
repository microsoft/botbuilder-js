import { Template } from '../template';
import { Activity, TurnContext } from 'botbuilder-core';

export class StaticActivityTemplate implements Template {
    
    public declarativeType: string = 'Microsoft.StaticActivityTemplate';

    public activity: Activity;

    public constructor(activity?: Activity) {
        this.activity = activity;
    };

    public bindToData(context: TurnContext, data: object): Promise<Activity> {
        return Promise.resolve(this.activity);
    }

    public toString = (): string => { return `${ this.activity.text }`;}
}