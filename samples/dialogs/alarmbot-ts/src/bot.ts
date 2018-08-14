import { TurnContext, ConversationState, UserState, StatePropertyAccessor } from 'botbuilder';
import { DialogSet, DialogState } from 'botbuilder-dialogs';
import { AddAlarmDialog } from './dialogs/addAlarmDialog';
import { DeleteAlarmDialog } from './dialogs/deleteAlarmDialog';
import { ShowAlarmsDialog } from './dialogs/showAlarmsDialog';
import { Alarm } from './models';

const ALARMS_PROPERTY = 'alarms';
const DIALOG_STATE_PROPERTY = 'dialogState';
const ADD_ALARM_DIALOG = 'addAlarm';
const DELETE_ALARM_DIALOG = 'deleteAlarm';
const SHOW_ALARMS_DIALOG = 'showAlarms';

export class Bot {
    private readonly alarms: StatePropertyAccessor<Alarm[]>;
    private readonly dialogState: StatePropertyAccessor<DialogState>;
    private readonly dialogs: DialogSet;

    constructor(convoState: ConversationState, userState: UserState) {
        // Define state properties
        this.alarms = userState.createProperty(ALARMS_PROPERTY);
        this.dialogState = convoState.createProperty(DIALOG_STATE_PROPERTY);

        // Create top level dialogs
        this.dialogs = new DialogSet(this.dialogState);
        this.dialogs.add(new AddAlarmDialog(ADD_ALARM_DIALOG, this.alarms));
        this.dialogs.add(new DeleteAlarmDialog(DELETE_ALARM_DIALOG, this.alarms));
        this.dialogs.add(new ShowAlarmsDialog(SHOW_ALARMS_DIALOG, this.alarms));
    }

    public async dispatchActivity(context: TurnContext): Promise<void> {
        // Create dialog context
        const dc = await this.dialogs.createContext(context);

        // Check for interruptions
        const isMessage = context.activity.type === 'message';
        if (isMessage) {
            const utterance = (context.activity.text || '').trim().toLowerCase();

            // Check for add
            if (utterance.includes('add alarm')) {
                await dc.cancelAll();
                await dc.begin(ADD_ALARM_DIALOG);

            // Check for delete
            } else if (utterance.includes('delete alarm')) {
                await dc.cancelAll();
                await dc.begin(DELETE_ALARM_DIALOG);

            // Check for show
            } else if (utterance.includes('show alarms')) {
                await dc.cancelAll();
                await dc.begin(SHOW_ALARMS_DIALOG);

            // Check for cancel
            } else if (utterance === 'cancel') {
                if (dc.activeDialog) {
                    await dc.cancelAll();
                    await dc.context.sendActivity(`Ok... Cancelled.`);
                } else {
                    await dc.context.sendActivity(`Nothing to cancel.`);
                }
            }
        }

        // Route activity to current dialog if not interrupted
        if (!context.responded) {
            await dc.continue();
        } 

        // Perform fallback logic if no active dialog or interruption
        if (!context.responded && isMessage) {
            await dc.context.sendActivity(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`)
        }
    }
}