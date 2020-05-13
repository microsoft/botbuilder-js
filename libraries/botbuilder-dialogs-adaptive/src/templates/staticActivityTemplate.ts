import { TemplateInterface } from 'botbuilder-dialogs';
import { Activity, TurnContext } from 'botbuilder-core';

export class StaticActivityTemplate implements TemplateInterface<Partial<Activity>> {

    public activity: Partial<Activity>;

    public constructor(activity?: Partial<Activity>) {
        this.activity = activity;
    };

    public async bindToData(context: TurnContext, data: object): Promise<Partial<Activity>> {
        return Promise.resolve(this.activity);
    }

    public toString = (): string => { return `${ this.activity.text }`;}
}