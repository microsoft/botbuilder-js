import {
    Prompt, PromptOptions, PromptState, ValidatorResult,
    TextPrompt, TextPromptOptions,
    NumberPrompt, NumberPromptOptions,
    ConfirmPrompt,
    ChoicePrompt, ChoicePromptOptions,
    AttachmentPrompt
} from 'botbuilder-prompts';


export function sayAlarms(context: BotContext) {
    const alarms = context.state.user.alarms || [];
    if (alarms.length > 1) {
        let connector = '';
        let msg = `There are ${alarms.length} alarms: `;
        alarms.forEach(function (alarm) {
            msg += connector + alarm.title;
            connector = ', ';
        });
        context.reply(msg);
    } else if (alarms.length == 1) {
        context.reply(`There is one alarm named "${alarms[0].title}".`);
    } else {
        context.reply(`There are no alarms.`);
    }
}

export function addAlarm(context: BotContext, alarm: Partial<Alarm>) {
    if (!alarm.title) {
        // Prompt for missing title
        return context.begin(getTitlePrompt.with(alarm).reply(`What would you like to call your alarm?`));
    } else if (!alarm.time) {
        // Prompt for missing time
        return context.begin(getTimePrompt.with(alarm).reply(`What time would you like to set the alarm for?`));
    }
    else {
        // Ensure alarms
        let alarms = context.state.user.alarms;
        if (!alarms) {
            context.state.user.alarms = alarms = [];
        }

        // Append alarm
        alarms.push(<Alarm>alarm);
        context.reply(`Added alarm named "${alarm.title}" set for ${alarm.time}.`);
    }
}

// Simple TextPrompt
// const getTitlePrompt = new TextPrompt<Partial<Alarm>>('/alarms/getTitle', (context, promptState) => {
//     promptState.with.title = promptState.value;
//     addAlarm(context, promptState.with);
// });

const getTitlePrompt = new Prompt<string, Partial<Alarm>, TextPromptOptions>('/alarms/getTitle', titleValidator,
    (context, promptState) => {
        promptState.with.title = promptState.value;
        addAlarm(context, promptState.with);
    });

function titleValidator(context: BotContext, options: TextPromptOptions): ValidatorResult<string> {
    let result = TextPrompt.validator(context, options);
    if (result.value) {
        if (result.value.length > 20) {
            context.reply("Your title must be less then 20 letters long");
            return { reason: 'toolong' };
        }
        else {
            return { value: context.request.text };
        }
    }
    return result;
}

const getTimePrompt = new Prompt<Date, Partial<Alarm>, TextPromptOptions>('/alarms/getTime', dateValidator, (context, promptState) => {
    promptState.with.time = promptState.value.toDateString();
    addAlarm(context, promptState.with);
});

function dateValidator(context: BotContext, options: PromptOptions): ValidatorResult<Date> {
    const timestamp = Date.parse(context.request.text || '');
    if (!Number.isNaN(timestamp)) {
        return { value: new Date(timestamp) };
    }
    return { reason: 'invalid' };
}


export function deleteAlarm(context: BotContext, titleOrIndex?: string | number) {
    // Did we get passed a title?
    const alarms = context.state.user.alarms || [];
    if (titleOrIndex !== undefined) {
        // Try to delete alarm
        const index = typeof titleOrIndex === 'string' ? findAlarmIndex(alarms, titleOrIndex) : titleOrIndex;
        if (index >= 0) {
            titleOrIndex = alarms[index].title;
            alarms.splice(index, 1);
            context.reply(`Deleted alarmed named "${titleOrIndex}".`);
        } else {
            context.reply(`I couldn't find the "${titleOrIndex}" alarm.`)
        }
        return { handled: true };
    } else if (alarms.length > 1) {
        // Say list of alarms and prompt for choice.
        this.sayAlarms(context);
        return context.begin(deleteWhichAlarm.reply(`Which alarm would you like to delete?`));
    } else if (alarms.length == 1) {
        // Confirm delete
        return context.begin(confirmDelete.reply(`Would you like to delete the "${alarms[0].title}" alarm?`));
    } else {
        // Nothing to delete
        context.reply(`There are no alarms to delete.`);
    }
}

const deleteWhichAlarm = new TextPrompt('deleteWhichAlarm', (context, promptState) => {
    deleteAlarm(context, promptState.value);
});

const confirmDelete = new ConfirmPrompt('confirmDelete', (context, promptState) => {
    if (promptState.value) {
        // Delete single alarm
        return deleteAlarm(context, 0);
    } else {
        context.reply(`ok`);
    }
});

function findAlarmIndex(alarms: Alarm[], title: string): number {
    for (let i = 0; i < alarms.length; i++) {
        if (alarms[i].title.toLowerCase() === title.toLowerCase()) {
            return i;
        }
    }
    return -1;
}


//---------------------------------------------------------
// Interfaces
//---------------------------------------------------------

declare global {
    export interface UserData {
        /** Users list of active alarms. */
        alarms?: Alarm[];
    }

    export interface ConversationData {
        /** Current alarm being set. */
        alarm?: Partial<Alarm>;
    }
}


export interface Alarm {
    title: string;
    time: string;
}

