// configure bots routing table
import * as addAlarm from './alarms/addAlarm';
import * as showAlarms from './alarms/showAlarms';
import * as deleteAlarm from './alarms/deleteAlarm';
import * as cancel from './alarms/cancel';

export function routes(context) {
    if (context.activity.type === 'message') {
        // Check for the triggering of a new topic
        const utterance = (context.activity.text || '').trim().toLowerCase();
        if (utterance.includes('add alarm')) {
            return addAlarm.begin(context);
        } else if (utterance.includes('delete alarm')) {
            return deleteAlarm.begin(context);
        } else if (utterance.includes('show alarms')) {
            return showAlarms.begin(context);
        } else if (utterance === 'cancel') {
            return cancel.begin(context);
        } else {
            // Continue the current topic
            switch (context.state.conversation.topic) {
                case 'addAlarm':
                    return addAlarm.routeReply(context);
                case 'deleteAlarm':
                    return deleteAlarm.routeReply(context);
                default:
                    context.reply(`Hi! I'm a simple alarm bot. Say "add alarm", "delete alarm", or "show alarms".`);
                    return Promise.resolve();
            }
        }
    }
}