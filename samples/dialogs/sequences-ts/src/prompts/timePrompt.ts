import { DatetimePrompt } from 'botbuilder-dialogs';

export class TimePrompt extends DatetimePrompt {
    constructor(dialogId: string) {
        super(dialogId, async (context, prompt) => {
            try {
                const result = prompt.result || [];
                if (result.length < 0) { throw new Error('missing time') }
                if (result[0].type !== 'datetime') { throw new Error('unsupported type') }
                const value = new Date(result[0].value);
                if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }
                prompt.end(result);
            } catch (err) {
                await context.sendActivity(`Please enter a valid time in the future like "tomorrow at 9am" or say "cancel".`);
            }
        });
    }
}