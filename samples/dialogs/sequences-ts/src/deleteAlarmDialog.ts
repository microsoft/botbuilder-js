import { ComponentDialog, ChoicePrompt, ConfirmPrompt, SequenceDialog, CodeStep } from 'botbuilder-dialogs';
import { UserState } from 'botbuilder';
import { AlarmUser } from './models';

const DELETE_ALARM_DLG = 'deleteAlarm';
const DELETE_ALARM_MULTI_DLG = 'deleteAlarmMulti';
const DELETE_ALARM_SINGLE_DLG = 'deleteAlarmSingle';
const CHOICE_PROMPT_DLG = 'choicePrompt';
const CONFIRM_PROMPT_DLG = 'confirmPrompt';

export class DeleteAlarmDialog extends ComponentDialog {
    constructor(dialogId: string, userState: UserState) {
        super(dialogId);

        // Add control flow dialogs (first added is initial dialog)
        this.add(new SequenceDialog(DELETE_ALARM_DLG, [
            new CodeStep(async (dc, step) => {
                // Divert to appropriate dialog
                const user = userState.get(dc.context) as AlarmUser;
                if (user.alarms.length > 1) {
                    return await dc.begin(DELETE_ALARM_MULTI_DLG);
                } else if (user.alarms.length === 1) {
                    return await dc.begin(DELETE_ALARM_SINGLE_DLG);
                } else {
                    await dc.context.sendActivity(`No alarms set to delete.`);
                    return await dc.end();
                }
            })
        ]));
        
        this.add(new SequenceDialog(DELETE_ALARM_MULTI_DLG, [
            new CodeStep('choice', async (dc, step) => {
                // Compute list of choices based on alarm titles
                const user = userState.get(dc.context) as AlarmUser;
                const choices = user.alarms.map((value) => value.title);
        
                // Prompt user for choice (force use of "list" style)
                const prompt = `Which alarm would you like to delete? Say "cancel" to quit.`;
                return await dc.prompt(CHOICE_PROMPT_DLG, prompt, choices);
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

        this.add(new SequenceDialog(DELETE_ALARM_SINGLE_DLG, [
            new CodeStep('confirm', async (dc, step) => {
                const user = userState.get(dc.context) as AlarmUser;
                const alarm = user.alarms[0];
                return await dc.prompt(CONFIRM_PROMPT_DLG, `Are you sure you want to delete the "${alarm.title}" alarm?`);
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

        // Add prompts
        this.add(new ChoicePrompt(CHOICE_PROMPT_DLG));
        this.add(new ConfirmPrompt(CONFIRM_PROMPT_DLG));
    }
}