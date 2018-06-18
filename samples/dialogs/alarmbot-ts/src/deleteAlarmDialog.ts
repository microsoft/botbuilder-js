import { DialogContainer, ChoicePrompt, ConfirmPrompt, FoundChoice } from 'botbuilder-dialogs';
import { UserState } from 'botbuilder';
import { Alarm, AlarmUser } from './models';

export class DeleteAlarmDialog extends DialogContainer {
    constructor(userState: UserState) {
        super('deleteAlarm');

        this.dialogs.add('deleteAlarm', [
            async function (dc) {
                // Divert to appropriate dialog
                const user = userState.get(dc.context) as AlarmUser;
                if (user.alarms.length > 1) {
                    await dc.begin('deleteAlarmMulti');
                } else if (user.alarms.length === 1) {
                    await dc.begin('deleteAlarmSingle');
                } else {
                    await dc.context.sendActivity(`No alarms set to delete.`);
                    await dc.end();
                }
            } 
        ]);
        
        this.dialogs.add('deleteAlarmMulti', [
            async function (dc) {
                // Compute list of choices based on alarm titles
                const user = userState.get(dc.context) as AlarmUser;
                const choices = user.alarms.map((value) => value.title);
        
                // Prompt user for choice (force use of "list" style)
                const prompt = `Which alarm would you like to delete? Say "cancel" to quit.`;
                await dc.prompt('choicePrompt', prompt, choices);
            },
            async function (dc, choice: FoundChoice) {
                // Delete alarm by position
                const user = userState.get(dc.context);
                if (choice.index < user.alarms.length) { user.alarms.splice(choice.index, 1) }
        
                // Notify user of delete
                await dc.context.sendActivity(`Deleted "${choice.value}" alarm.`);
                await dc.end();
            }
        ]);
        
        this.dialogs.add('deleteAlarmSingle', [
            async function (dc) {
                const user = userState.get(dc.context) as AlarmUser;
                const alarm = user.alarms[0];
                await dc.prompt('confirmPrompt', `Are you sure you want to delete the "${alarm.title}" alarm?`);
            },
            async function (dc, confirm: boolean) {
                if (confirm) {
                    const user = userState.get(dc.context) as AlarmUser;
                    user.alarms = [];
                    await dc.context.sendActivity(`alarm deleted...`);
                } else {
                    await dc.context.sendActivity(`ok...`);
                }
            }
        ]);
        
        this.dialogs.add('choicePrompt', new ChoicePrompt());
        this.dialogs.add('confirmPrompt', new ConfirmPrompt());
    }
}