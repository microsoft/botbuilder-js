import { Storage, UserState, ConversationState, TurnContext } from 'botbuilder';
import { DialogDispatcher, DialogContext } from 'botbuilder-dialogs';
import { AddAlarmDialog } from './addAlarmDialog';
import { DeleteAlarmDialog } from './deleteAlarmDialog';
import { ShowAlarmsDialog } from './showAlarmsDialog';

const ADD_ALARM_DLG = 'addAlarm';
const DELETE_ALARM_DLG = 'deleteAlarm';
const SHOW_ALARMS_DLG = 'slowAlarms';

export class AlarmBot extends DialogDispatcher {
    constructor (storage: Storage) {
        super();

        // Initialize state
        this.userState = new UserState(storage);
        this.convoState = new ConversationState(storage);

        // Add dialogs for top level tasks
        this.add(new AddAlarmDialog(ADD_ALARM_DLG, this.userState));
        this.add(new DeleteAlarmDialog(DELETE_ALARM_DLG, this.userState));
        this.add(new ShowAlarmsDialog(SHOW_ALARMS_DLG, this.userState));
    }

    public userState: UserState;
    public convoState: ConversationState;

    public dispatch(context: TurnContext): Promise<void> {
        // Ensure user properly initialized
        const user = this.userState.get(context);
        if (!user.alarms) { user.alarms = [] }

        // Dispatch activity
        const state = this.convoState.get(context);
        return super.dispatch(context, state);
    }

    protected async onMessage(dc: DialogContext): Promise<void> {
        const utterance = (dc.context.activity.text || '').trim().toLowerCase();

        // Start addAlarm dialog
        if (utterance.includes('add alarm')) {
            await dc.cancelAll();
            await dc.begin(ADD_ALARM_DLG);

        // Start deleteAlarm dialog
        } else if (utterance.includes('delete alarm')) {
            await dc.cancelAll();
            await dc.begin(DELETE_ALARM_DLG);

        // Start showAlarms
        } else if (utterance.includes('show alarms')) {
            await dc.cancelAll();
            await dc.begin(SHOW_ALARMS_DLG);

        // Check for cancel
        } else if (utterance === 'cancel') {
            if (dc.activeDialog) {
                await dc.context.sendActivity(`Ok... Cancelled.`);
                await dc.cancelAll();
            } else {
                await dc.context.sendActivity(`Nothing to cancel.`);
            }
        }
    }

    protected async onNoResponse(dc: DialogContext): Promise<void> {
        await dc.context.sendActivity(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`)
    }
}