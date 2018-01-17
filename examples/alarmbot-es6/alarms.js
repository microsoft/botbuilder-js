const prompts = require('botbuilder-prompts');

/* START - Helper functions */
const getTitlePrompt = new prompts.Prompt('/alarms/getTitle', titleValidator, (context, promptState) => {
    promptState.with.title = promptState.value;
    alarms.addAlarm(context, promptState.with);
});

function titleValidator(context, options){
    let result = prompts.TextPrompt.validator(context, options);
    if (result.value) {
        if (result.value.length > 20) {
            context.reply("Your title must be less then 20 letters long");
            return { reason: 'toolong' };
        }
        else {
            return { 
                value: context.request.text 
            };
        }
    }
    return result;
}

const getTimePrompt = new prompts.Prompt('/alarms/getTime', dateValidator, (context, promptState) => {
    promptState.with.time = promptState.value.toDateString();
    alarms.addAlarm(context, promptState.with);
});

function dateValidator(context, options) {
    const timestamp = Date.parse(context.request.text || '');
    if (!Number.isNaN(timestamp)) {
        return { 
            value: new Date(timestamp) 
        };
    }
    return { 
        reason: 'invalid' 
    };
}

const deleteWhichAlarm = new prompts.TextPrompt('deleteWhichAlarm', (context, promptState) => {
    alarms.deleteAlarm(context, promptState.value);
});

const confirmDelete = new prompts.ConfirmPrompt('confirmDelete', (context, promptState) => {
    if (promptState.value) {
        // Delete single alarm
        return alarms.deleteAlarm(context, 0);
    } else {
        context.reply(`ok`);
    }
});

function findAlarmIndex(alarms, title) {
    for (let i = 0; i < alarms.length; i++) {
        if (alarms[i].title.toLowerCase() === title.toLowerCase()) {
            return i;
        }
    }
    return -1;
}
/* END - Helper functions */


/* START - Exported functions */
module.exports = alarms = {
    sayAlarms: function (context) {
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
    },
    addAlarm: function (context, alarm) {
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
            alarms.push(alarm);
            context.reply(`Added alarm named "${alarm.title}" set for ${alarm.time}.`);
        }
    },
    deleteAlarm: function (context, titleOrIndex) {
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
}
/* END - Exported functions */


// END OF LINE
