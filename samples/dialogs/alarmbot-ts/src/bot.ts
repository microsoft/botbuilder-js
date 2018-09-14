import { ActivityTypes, ConversationState, StatePropertyAccessor, TurnContext, UserState } from 'botbuilder';
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
    private readonly alarmsProperty: StatePropertyAccessor<Alarm[]>;
    private readonly dialogStateProperty: StatePropertyAccessor<DialogState>;
    private readonly dialogs: DialogSet;

    constructor(conversationState: ConversationState, userState: UserState) {
        // Define state properties
        this.alarmsProperty = userState.createProperty(ALARMS_PROPERTY);
        this.dialogStateProperty = conversationState.createProperty(DIALOG_STATE_PROPERTY);

        // Create top level dialogs
        this.dialogs = new DialogSet(this.dialogStateProperty);
        this.dialogs.add(new AddAlarmDialog(ADD_ALARM_DIALOG, this.alarmsProperty));
        this.dialogs.add(new DeleteAlarmDialog(DELETE_ALARM_DIALOG, this.alarmsProperty));
        this.dialogs.add(new ShowAlarmsDialog(SHOW_ALARMS_DIALOG, this.alarmsProperty));
    }

    public async onActivity(context: TurnContext): Promise<void> {
        // Create dialog context
        const dc = await this.dialogs.createContext(context);

        // Check for interruptions
        switch (context.activity.type) {
            case ActivityTypes.Message:
                const utterance = (context.activity.text || '').trim().toLowerCase();

                // normally invoke LUIS to get language understanding of input
                // ... instead we will use simple pattern matching...

                // Check for start commands or interruptions 
                if (utterance.includes('add alarm')) {
                    // cancel any running dialogs
                    await dc.cancelAll();
                    await dc.beginDialog(ADD_ALARM_DIALOG);

                    // Check for delete
                } else if (utterance.includes('delete alarm')) {
                    // cancel any running dialogs
                    await dc.cancelAll();
                    await dc.beginDialog(DELETE_ALARM_DIALOG);

                    // Check for show
                } else if (utterance.includes('show alarms')) {
                    // cancel any running dialogs
                    await dc.cancelAll();
                    await dc.beginDialog(SHOW_ALARMS_DIALOG);

                    // Check for cancel
                } else if (utterance === 'cancel') {
                    if (dc.activeDialog) {
                        await dc.cancelAll();
                        await dc.context.sendActivity(`Ok... Cancelled.`);
                    } else {
                        await dc.context.sendActivity(`Nothing to cancel.`);
                    }
                }

                // Route activity to current dialog if not interrupted
                if (!context.responded) {
                    await dc.continueDialog();
                }

                // Perform fallback logic if no active dialog or interruption
                if (!context.responded) {
                    await dc.context.sendActivity(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`)
                }
                break;

            case ActivityTypes.Event:
                break;

            default:
                break;
        }

    }
}