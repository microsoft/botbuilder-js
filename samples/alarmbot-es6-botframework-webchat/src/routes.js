// configure bots routing table
import {alarms} from "./alarms";
import {Prompt} from 'botbuilder-prompts';

export function routes(context) {
    if (context.ifRegExp(/(list|show) alarms/i)) {
        return alarms.sayAlarms(context);
    } else if (context.ifRegExp(/(set|create|add|new) alarm/i)) {
        Prompt.cancelActivePrompt(context);             // <-- cancel any active prompts
        return alarms.addAlarm(context, {});
    } else if (context.ifRegExp(/(delete|remove|cancel) alarm/i)) {
        Prompt.cancelActivePrompt(context);             // <-- cancel any active prompts
        return alarms.deleteAlarm(context);
    } else if (context.ifRegExp(/help/i)) {
        context.reply('Welcome to the Alarm Bot demo using the BotFramework WebChat! \nTo set an alarm, type or say: "set alarm", or "new alarm".\nTo cancel an alarm, type or say: "cancel alarm", or "delete alarm".');
    } else {
        return Prompt.routeTo(context).then((handled) => {
            if (!handled) {
                context.reply(`[Alarm Bot Example] To create a new alarm, type or say: 'set alarm' or 'new alarm'. For more details, type or say 'help'`);
            }
            return {handled: true};
        });
    }
}
