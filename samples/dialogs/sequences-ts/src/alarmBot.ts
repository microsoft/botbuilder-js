import { UserState } from 'botbuilder';
import { RootDialogContainer, DialogContext } from 'botbuilder-dialogs';
import { AddAlarmDialog } from './addAlarmDialog';
import { DeleteAlarmDialog } from './deleteAlarmDialog';
import { ShowAlarmsDialog } from './showAlarmsDialog';

export class AlarmBot extends RootDialogContainer {
    constructor (userState: UserState) {
        super();

        // Add dialogs
        this.dialogs.add('addAlarm', new AddAlarmDialog(userState));
        this.dialogs.add('deleteAlarm', new DeleteAlarmDialog(userState));
        this.dialogs.add('showAlarms', new ShowAlarmsDialog(userState));
    }

    protected async onInterruption(dc: DialogContext): Promise<void> {
        const utterance = (dc.context.activity.text || '').trim().toLowerCase();

        // Start addAlarm dialog
        if (utterance.includes('add alarm')) {
            await dc.cancel();
            await dc.begin('addAlarm');

        // Start deleteAlarm dialog
        } else if (utterance.includes('delete alarm')) {
            await dc.cancel();
            await dc.begin('deleteAlarm');

        // Start showAlarms
        } else if (utterance.includes('show alarms')) {
            await dc.cancel();
            await dc.begin('showAlarms');

        // Check for cancel
        } else if (utterance === 'cancel') {
            if (dc.activeDialog) {
                await dc.context.sendActivity(`Ok... Cancelled.`);
                await dc.cancel();
            } else {
                await dc.context.sendActivity(`Nothing to cancel.`);
            }
        }
    }

    protected async onFallback(dc: DialogContext): Promise<void> {
        await dc.context.sendActivity(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`)
    }
}