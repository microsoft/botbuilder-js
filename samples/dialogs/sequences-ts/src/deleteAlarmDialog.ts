import { DialogContainer, ChoicePrompt, ConfirmPrompt, Sequence, CodeStep } from 'botbuilder-dialogs';
import { UserState } from 'botbuilder';
import { Alarm, AlarmUser } from './models';

export class DeleteAlarmDialog extends DialogContainer {
    constructor(userState: UserState) {
        super('deleteAlarm');

        this.dialogs.add('deleteAlarm', new Sequence([
            new CodeStep(async (dc, step) => {
                // Divert to appropriate dialog
                const user = userState.get(dc.context) as AlarmUser;
                if (user.alarms.length > 1) {
                    return await dc.begin('deleteAlarmMulti');
                } else if (user.alarms.length === 1) {
                    return await dc.begin('deleteAlarmSingle');
                } else {
                    await dc.context.sendActivity(`No alarms set to delete.`);
                    return await dc.end();
                }
            })
        ]));
        
        this.dialogs.add('deleteAlarmMulti', new Sequence([
            new CodeStep('choice', async (dc, step) => {
                // Compute list of choices based on alarm titles
                const user = userState.get(dc.context) as AlarmUser;
                const choices = user.alarms.map((value) => value.title);
        
                // Prompt user for choice (force use of "list" style)
                const prompt = `Which alarm would you like to delete? Say "cancel" to quit.`;
                return await dc.prompt('choicePrompt', prompt, choices);
            }),
            new CodeStep(async (dc, step) => {
                // Delete alarm by position
                const choice = step.values['choice'];
                const user = userState.get(dc.context);
                if (choice.index < user.alarms.length) { user.alarms.splice(choice.index, 1) }
        
                // Notify user of delete
                await dc.context.sendActivity(`Deleted "${choice.value}" alarm.`);
                return await dc.end();
            })
        ]));

        this.dialogs.add('deleteAlarmSingle', new Sequence([
            new CodeStep('confirm', async (dc, step) => {
                const user = userState.get(dc.context) as AlarmUser;
                const alarm = user.alarms[0];
                return await dc.prompt('confirmPrompt', `Are you sure you want to delete the "${alarm.title}" alarm?`);
            }),
            new CodeStep(async (dc, step) => {
                const confirm = step.values['confirm'];
                if (confirm) {
                    const user = userState.get(dc.context) as AlarmUser;
                    user.alarms = [];
                    await dc.context.sendActivity(`alarm deleted...`);
                } else {
                    await dc.context.sendActivity(`ok...`);
                }
                return await dc.end();
            })
        ]));
        
        this.dialogs.add('choicePrompt', new ChoicePrompt());
        this.dialogs.add('confirmPrompt', new ConfirmPrompt());
    }
}