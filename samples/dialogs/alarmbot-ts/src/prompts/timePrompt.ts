import { DateTimePrompt } from 'botbuilder-dialogs';

export class TimePrompt extends DateTimePrompt {
    constructor(dialogId: string) {
        super(dialogId, async (context, prompt) => {
            try {
                // Validate that a time was specified and that its in the future.
                const times = prompt.recognized.value || [];
                if (times.length == 0) { throw new Error('missing time') }
                if (times[0].type !== 'datetime') { throw new Error('unsupported type') }
                const value = new Date(times[0].value);
                if (value.getTime() < new Date().getTime()) { throw new Error('in the past') }

                // Return converted date to caller
                prompt.end(value);
            } catch (err) {
                // Re-prompt
                await context.sendActivity(`Please enter a valid time in the future like "tomorrow at 9am" or say "cancel".`);
            }
        }); 
    }
}