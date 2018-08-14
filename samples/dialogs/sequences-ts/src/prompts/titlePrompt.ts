import { TextPrompt } from 'botbuilder-dialogs';

export class TitlePrompt extends TextPrompt {
    constructor(dialogId: string) {
        super(dialogId, async (context, prompt) => {
            const result = (prompt.result || '').trim();
            if (result.length < 3) {
                await context.sendActivity(`Title should be at least 3 characters long.`);
            } else {
                prompt.end(result)
            }
        });
    }
}