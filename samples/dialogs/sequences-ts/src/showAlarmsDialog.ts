import { DialogContainer, Sequence, CodeStep } from 'botbuilder-dialogs';
import { UserState } from 'botbuilder';
import { AlarmUser } from './models';
import * as moment from 'moment';

export class ShowAlarmsDialog extends DialogContainer {
    constructor(userState: UserState) {
        super('showAlarms');

        this.dialogs.add('showAlarms', new Sequence([
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