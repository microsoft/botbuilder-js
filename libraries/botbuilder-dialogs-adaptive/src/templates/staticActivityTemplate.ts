import { TemplateInterface } from '../template';
import { Activity, TurnContext } from 'botbuilder-core';

export class StaticActivityTemplate implements TemplateInterface<Partial<Activity>> {
    
    public static declarativeType: string = 'Microsoft.StaticActivityTemplate';

    public activity: Activity;

    public constructor(activity?: Activity) {
        this.activity = activity;
    };

    public async bindToData(context: TurnContext, data: object): Promise<Partial<Activity>> {
        return Promise.resolve(this.activity);
    }

    public toString = (): string => { return `${ this.activity.text }`;}
}