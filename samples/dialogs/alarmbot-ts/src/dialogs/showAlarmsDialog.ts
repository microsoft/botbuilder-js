import { StatePropertyAccessor } from 'botbuilder';
import { ComponentDialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import * as moment from 'moment';
import { Alarm } from '../models';

const START_DIALOG = 'start';

export class ShowAlarmsDialog extends ComponentDialog {
    constructor(dialogId: string, private alarmsProperty: StatePropertyAccessor<Alarm[]>) {
        super(dialogId);
    }

    // for single turn dialog, we can do it all here.
    protected async onBeginDialog(dc: DialogContext, options: object): Promise<DialogTurnResult> {
        let msg = `No alarms found.`;
        const list = await this.alarmsProperty.get(dc.context, []);
        if (list.length > 0) {
            msg = `**Current Alarms**\n\n`;
            let connector = '';
            list.forEach((alarm) => {
                msg += connector + `- ${alarm.title} (${moment(alarm.time).format("ddd, MMM Do, h:mm a")})`;
                connector = '\n';
            });
        }
        await dc.context.sendActivity(msg);
        return await dc.endDialog();
    }

}