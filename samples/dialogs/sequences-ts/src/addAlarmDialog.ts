import { ComponentDialog, SequenceDialog, PromptStep, CodeStep } from 'botbuilder-dialogs';
import { UserState } from 'botbuilder';
import { Alarm, AlarmUser } from './models';
import { TitlePrompt } from './prompts/titlePrompt';
import { TimePrompt } from './prompts/timePrompt';
import * as moment from 'moment';

const ADD_ALARM_DLG = 'addAlarm';
const TITLE_PROMPT_DLG = 'titlePrompt';
const TIME_PROMPT_DLG = 'timePrompt';

export class AddAlarmDialog extends ComponentDialog {
    constructor(dialogId: string, userState: UserState) {
        super(dialogId);

        // Add control flow dialogs (first added is initial dialog)
        this.add(new SequenceDialog(ADD_ALARM_DLG, [
            new PromptStep('title', TITLE_PROMPT_DLG, `What would you like to call your alarm?`),
            new PromptStep('time', TIME_PROMPT_DLG, `What time would you like to set the alarm for?`),
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
        
        // Add prompts
        this.add(new TitlePrompt(TITLE_PROMPT_DLG));
        this.add(new TimePrompt(TIME_PROMPT_DLG));
    }
}