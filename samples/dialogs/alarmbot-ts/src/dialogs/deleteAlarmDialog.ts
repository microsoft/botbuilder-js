import { StatePropertyAccessor } from 'botbuilder';
import { ChoicePrompt, ComponentDialog, ConfirmPrompt, DialogContext, DialogTurnResult, FoundChoice, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { Alarm } from '../models';

const START_DIALOG = 'start';
const DELETE_MULTI_DIALOG = 'deleteMulti';
const DELETE_SINGLE_DIALOG = 'deleteSingle';
const CHOOSE_ALARM_PROMPT = 'chooseAlarm';
const CONFIRM_DELETE_PROMPT = 'confirmDelete';

export class DeleteAlarmDialog extends ComponentDialog {
    constructor(dialogId: string, private alarmsProperty: StatePropertyAccessor<Alarm[]>) {
        super(dialogId);

        // waterfall dialog for dealing with multiple dialogs
        this.addDialog(new WaterfallDialog(DELETE_MULTI_DIALOG, [
            this.chooseAlarmStep,
            this.deleteChosenAlarmStep
        ]));

        // waterfall dialog for deleting a single dialog
        this.addDialog(new WaterfallDialog(DELETE_SINGLE_DIALOG, [
            this.confirmDeleteSingleStep,
            this.confirmedDeleteSingleAlarmStep
        ]));

        // Add support prompts
        this.addDialog(new ChoicePrompt(CHOOSE_ALARM_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_DELETE_PROMPT));
    }

    // NOTE: since waterfall steps are passed in as a function to the waterfall dialog 
    // it will be called from the context of the waterfall dialog.  With javascript/typescript
    // you need to write this function as using the lambda syntax so that it captures the context of the this pointer
    // if you don't do this, the this pointer will be incorrect for waterfall steps.

    // decide which of two waterfall flows to use
    protected async onBeginDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Divert to appropriate dialog
        const list = await this.alarmsProperty.get(dc.context, []);
        if (list.length > 1) {
            return await dc.beginDialog(DELETE_MULTI_DIALOG);
        }
        else if (list.length === 1) {
            return await dc.beginDialog(DELETE_SINGLE_DIALOG);
        }
        else {
            await dc.context.sendActivity(`No alarms set to delete.`);
            return await dc.endDialog();
        }
    }

    private chooseAlarmStep = async (dc: DialogContext, step: WaterfallStepContext): Promise<DialogTurnResult> => {
        // Compute list of choices based on alarm titles
        const list = await this.alarmsProperty.get(dc.context);
        const choices = list.map((value) => value.title);

        // Prompt user to pick from list
        return await dc.prompt(CHOOSE_ALARM_PROMPT, { prompt: `Which alarm would you like to delete? Say "cancel" to quit.`, choices: choices });
    }

    private deleteChosenAlarmStep = async (dc: DialogContext, step: WaterfallStepContext): Promise<DialogTurnResult> => {
        // Delete alarm by position
        const choice = step.result as FoundChoice;
        const list = await this.alarmsProperty.get(dc.context);
        if (choice.index < list.length) { list.splice(choice.index, 1) }

        // Notify user of delete
        await dc.context.sendActivity(`Deleted "${choice.value}" alarm.`);
        return await dc.endDialog();
    }

    private confirmDeleteSingleStep = async (dc: DialogContext, step: WaterfallStepContext): Promise<DialogTurnResult> => {
        const alarms = await this.alarmsProperty.get(dc.context);
        return await dc.prompt(CONFIRM_DELETE_PROMPT, `Are you sure you want to delete the "${alarms[0].title}" alarm?`);
    }

    private confirmedDeleteSingleAlarmStep = async (dc: DialogContext, step: WaterfallStepContext): Promise<DialogTurnResult> => {
        if (step.result) {
            await this.alarmsProperty.delete(dc.context);
            await dc.context.sendActivity(`alarm deleted...`);
        } else {
            await dc.context.sendActivity(`ok...`);
        }
        return await dc.endDialog();
    }
}