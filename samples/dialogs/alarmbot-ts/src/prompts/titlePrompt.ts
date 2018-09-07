import { TextPrompt } from 'botbuilder-dialogs';

export class TitlePrompt extends TextPrompt {
    constructor(dialogId: string) {
        super(dialogId, async (context, prompt) => {
            // Validate that the user enetered a long enough title
            const value = (prompt.recognized.value || '').trim();
            if (value.length >= 3) {
                prompt.end(value);
            } else {
                await context.sendActivity(`Title should be at least 3 characters long.`);
            }
        }); 
    }
}