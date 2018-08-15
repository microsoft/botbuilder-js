import { StatePropertyAccessor } from 'botbuilder';
import { ComponentDialog, WaterfallDialog } from 'botbuilder-dialogs';
import { Alarm } from '../models';
import * as moment from 'moment';

const START_DIALOG = 'start';

export class ShowAlarmsDialog extends ComponentDialog {
    constructor(dialogId: string, alarms: StatePropertyAccessor<Alarm[]>) {
        super(dialogId);

        // Add control flow dialogs
        this.addDialog(new WaterfallDialog(START_DIALOG, [
            async (dc, step) => {
                let msg = `No alarms found.`;
                const list = await alarms.get(dc.context, []);
                if (list.length > 0) {
                    msg = `**Current Alarms**\n\n`;
                    let connector = '';
                    list.forEach((alarm) => {
                        msg += connector + `- ${alarm.title} (${moment(alarm.time).format("ddd, MMM Do, h:mm a")})`;
                        connector = '\n';
                    });
                }
                await dc.context.sendActivity(msg);
                return await dc.end();
            }
        ]));
    }
}