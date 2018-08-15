import { StatePropertyAccessor } from 'botbuilder';
import { ComponentDialog, DialogContext, WaterfallDialog, WaterfallStepContext, DialogTurnResult } from 'botbuilder-dialogs';
import { TitlePrompt } from '../prompts/titlePrompt';
import { TimePrompt } from '../prompts/timePrompt';
import { Alarm } from '../models';
import * as moment from 'moment';

const START_DIALOG = 'start';
const TITLE_PROMPT = 'titlePrompt';
const TIME_PROMPT = 'timePrompt';
const TITLE_VALUE = 'title';
const TIME_VALUE = 'time';

export interface AddAlarmOptions {
    /** (Optional) initial alarm field values.   */
    alarm?: Alarm;
}

export class AddAlarmDialog extends ComponentDialog {
    constructor(dialogId: string, private alarms: StatePropertyAccessor<Alarm[]>) {
        super(dialogId);

        // Add control flow dialogs
        this.addDialog(new WaterfallDialog<AddAlarmOptions>(START_DIALOG, [
            this.initializeValuesStep,
            this.promptForTitleStep,
            this.promptForTimeStep,
            this.appendAlarmStep
        ]));

        // Add support prompts
        this.addDialog(new TitlePrompt(TITLE_PROMPT));
        this.addDialog(new TimePrompt(TIME_PROMPT));
    }

    private async initializeValuesStep(dc: DialogContext, step: WaterfallStepContext<AddAlarmOptions>): Promise<DialogTurnResult> {
        if (step.options && step.options.alarm) {
            step.values[TITLE_VALUE] = step.options.alarm.title;
            step.values[TIME_VALUE] = step.options.alarm.time;
        }
        return await step.next();
    }

    private async promptForTitleStep(dc: DialogContext, step: WaterfallStepContext<AddAlarmOptions>): Promise<DialogTurnResult> {
        // Prompt for title if missing
        if (!step.values[TITLE_VALUE]) {
            return await dc.prompt(TITLE_PROMPT, `What would you like to call your alarm?`);
        } else {
            return await step.next();
        }
    }

    private async promptForTimeStep(dc: DialogContext, step: WaterfallStepContext<AddAlarmOptions>): Promise<DialogTurnResult> {
        // Save title if prompted for
        if (step.result) {
            step.values[TITLE_VALUE] = step.result;
        }

        // Prompt for time if missing
        if (!step.values[TIME_VALUE]) {
            return await dc.prompt(TIME_PROMPT, `What time would you like to set the "${step.values[TITLE_VALUE]}" alarm for?`);
        } else {
            return await step.next();
        }
    }

    private async appendAlarmStep(dc: DialogContext, step: WaterfallStepContext<AddAlarmOptions>): Promise<DialogTurnResult> {
        // Save time if prompted for
        if (step.result) {
            step.values[TIME_VALUE] = step.result;
        }

        // Initialize alarm from values
        const alarm: Alarm = {
            title: step.values[TITLE_VALUE],
            time: step.values[TIME_VALUE]
        };

        // Append to alarms list
        const alarms = await this.alarms.get(dc.context, []);
        alarms.push(alarm);

        // Notify user of add and end dialog
        await dc.context.sendActivity(`Your alarm named "${alarm.title}" is set for "${moment(alarm.time).format("ddd, MMM Do, h:mm a")}".`);
        return await dc.end();
    }
}