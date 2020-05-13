import { TurnContext, Activity, ActivityFactory, MessageFactory } from 'botbuilder-core';
import { TemplateInterface } from 'botbuilder-dialogs';
import { LanguageGenerator } from '../languageGenerator';

export class ActivityTemplate implements TemplateInterface<Partial<Activity>> {
    public template: string;

    public constructor(template: string) {
        this.template = template;
    }

    public async bindToData(context: TurnContext, data: object): Promise<Partial<Activity>> {
        if(this.template) {
            const languageGenerator: LanguageGenerator = context.turnState.get('LanguageGenerator');
            if (languageGenerator) {
                const lgStringResult = await languageGenerator.generate(context, this.template, data);
                const result = ActivityFactory.fromObject(lgStringResult);
                return Promise.resolve(result);
            } else {
                const message = MessageFactory.text(this.template, this.template);
                return Promise.resolve(message);
            }  
        }

        return Promise.resolve(undefined);
    }

    public toString = (): string => { return `ActivityTemplate(${ this.template })`;};
}