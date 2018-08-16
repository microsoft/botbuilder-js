import { StatePropertyAccessor } from 'botbuilder';
import { ComponentDialog, WaterfallDialog, ChoicePrompt, ConfirmPrompt, FoundChoice } from 'botbuilder-dialogs';
import { Alarm } from '../models';

const START_DIALOG = 'start';
const DELETE_MULTI_DIALOG = 'deleteMulti';
const DELETE_SINGLE_DIALOG = 'deleteSingle';
const CHOOSE_ALARM_PROMPT = 'chooseAlarm';
const CONFIRM_DELETE_PROMPT = 'confirmDelete'; 

export class DeleteAlarmDialog extends ComponentDialog {
    constructor(dialogId: string, alarms: StatePropertyAccessor<Alarm[]>) {
        super(dialogId);

        // Add control flow dialogs
        this.addDialog(new WaterfallDialog(START_DIALOG, [
            async (dc, step) => {
                // Divert to appropriate dialog
                const list = await alarms.get(dc.context, []);
                if (list.length > 1) {
                    return await dc.begin(DELETE_MULTI_DIALOG);
                } else if (list.length === 1) {
                    return await dc.begin(DELETE_SINGLE_DIALOG);
                } else {
                    await dc.context.sendActivity(`No alarms set to delete.`);
                    return await dc.end();
                }
            } 
        ]));
        
        this.addDialog(new WaterfallDialog(DELETE_MULTI_DIALOG, [
            async (dc, step) => {
                // Compute list of choices based on alarm titles
                const list = await alarms.get(dc.context);
                const choices = list.map((value) => value.title);
        
                // Prompt user to pick from list
                return await dc.prompt(CHOOSE_ALARM_PROMPT, `Which alarm would you like to delete? Say "cancel" to quit.`, choices);
            },
            async (dc, step) => {
                // Delete alarm by position
                const choice = step.result as FoundChoice;
                const list = await alarms.get(dc.context);
                if (choice.index < list.length) { list.splice(choice.index, 1) }
        
                // Notify user of delete
                await dc.context.sendActivity(`Deleted "${choice.value}" alarm.`);
                return await dc.end();
            }
        ]));
        
        this.addDialog(new WaterfallDialog(DELETE_SINGLE_DIALOG, [
            async (dc, step) => {
                const alarm = alarms.get(dc.context)[0];
                return await dc.prompt(CONFIRM_DELETE_PROMPT, `Are you sure you want to delete the "${alarm.title}" alarm?`);
            },
            async (dc, step) => {
                if (step.result) {
                    await alarms.delete(dc.context);
                    await dc.context.sendActivity(`alarm deleted...`);
                } else {
                    await dc.context.sendActivity(`ok...`);
                }
                return await dc.end();
            }
        ]));
      
        // Add support prompts
        this.addDialog(new ChoicePrompt(CHOOSE_ALARM_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_DELETE_PROMPT));
    }
}