import { DialogContext } from 'botbuilder-dialogs';
import { TemplateInterface } from '../template';
import { LanguageGenerator } from '../languageGenerator';

export class TextTemplate implements TemplateInterface<string> {

    public template: string;

    public constructor(template: string) {
        this.template = template;
    }

    public async bind(dialogContext: DialogContext, data: object): Promise<string> {
        if (!this.template) {
            throw new Error(`ArgumentNullException: ${ this.template }`);
        }

        const languageGenerator: LanguageGenerator = dialogContext.context.turnState.get('LanguageGenerator');
        if (languageGenerator !== undefined) {
            const result = languageGenerator.generate(dialogContext, this.template, data);
            return Promise.resolve(result);
        }
        
        return Promise.resolve(undefined);
    }

    public toString = (): string => { return `TextTemplate(${ this.template })`;};
}