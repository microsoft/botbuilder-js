import { ComponentDialog, SequenceDialog, CodeStep } from 'botbuilder-dialogs';
import { UserState } from 'botbuilder';
import { AlarmUser } from './models';
import * as moment from 'moment';

const SHOW_ALARMS_DLG = 'showAlarms';

export class ShowAlarmsDialog extends ComponentDialog {
    constructor(dialogId: string, userState: UserState) {
        super(dialogId);

        // Add control flow dialogs (first added is initial dialog)
        this.add(new SequenceDialog(SHOW_ALARMS_DLG, [
            new CodeStep(async (dc, step) => {
                let msg = `No alarms found.`;
                const user = userState.get(dc.context) as AlarmUser;
                if (user.alarms.length > 0) {
                    msg = `**Current Alarms**\n\n`;
                    let connector = '';
                    user.alarms.forEach((alarm) => {
                        msg += connector + `- ${alarm.title} (${moment(alarm.time).format("ddd, MMM Do, h:mm a")})`;
                        connector = '\n';
                    });
                }
                await dc.context.sendActivity(msg);
                return await dc.end();
            })
        ]));
    }
}