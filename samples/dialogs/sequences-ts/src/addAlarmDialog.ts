import { DialogContainer, TextPrompt, DatetimePrompt, Sequence, PromptStep, CodeStep } from 'botbuilder-dialogs';
import { UserState } from 'botbuilder';
import { Alarm, AlarmUser } from './models';
import * as moment from 'moment';

export class AddAlarmDialog extends DialogContainer {
    constructor(userState: UserState) {
        super('addAlarm');

        this.dialogs.add('addAlarm', new Sequence([
            new PromptStep('title', 'titlePrompt', `What would you like to call your alarm?`),
            new PromptStep('time', 'timePrompt', `What time would you like to set the alarm for?`),
            new CodeStep(async (dc, step) => {
                // Convert to Alarm
                const alarm: Alarm = {
                    title: step.values['title'],
                    time: step.values['time'].toISOString()
                };

                // Set alarm.
                const user = userState.get(dc.context) as AlarmUser;
                user.alarms.push(alarm);

                // Confirm to user
                await dc.context.sendActivity(`Your alarm named "${alarm.title}" is set for "${moment(alarm.time).format("ddd, MMM Do, h:mm a")}".`);
                return await dc.end();
            })
        ]));
        
        this.dialogs.add('titlePrompt', new TextPrompt(async (context, prompt) => {
            const result = (prompt.result || '').trim();
            if (result.length < 3) {
                await context.sendActivity(`Title should be at least 3 characters long.`);
            } else {
                prompt.end(result)
            }
        }));
        
        this.dialogs.add('timePrompt', new DatetimePrompt(async (context, prompt) => {
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
        }));
    }
}