"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const showAlarms_1 = require("./showAlarms");
function begin(context, state) {
    // Delete any existing topic
    const conversation = state.conversation.get(context);
    conversation.topic = undefined;
    // Render list of topics to user
    return showAlarms_1.renderAlarms(context, state).then((count) => {
        if (count > 0) {
            // Set topic and prompt user for alarm to delete.
            conversation.topic = 'deleteAlarm';
            return context.sendActivity(`Which alarm would you like to delete?`);
        }
    });
}
exports.begin = begin;
function routeReply(context, state) {
    // Validate users reply and delete alarm
    let deleted = false;
    const title = context.request.text.trim();
    const list = state.user.get(context).alarms || [];
    for (let i = 0; i < list.length; i++) {
        if (list[i].title.toLowerCase() === title.toLowerCase()) {
            list.splice(i, 1);
            deleted = true;
            break;
        }
    }
    // Notify user of deletion or re-prompt
    if (deleted) {
        state.conversation.get(context).topic = undefined;
        return context.sendActivity(`Deleted the "${title}" alarm.`);
    }
    return context.sendActivity(`An alarm named "${title}" doesn't exist. Which alarm would you like to delete? Say "cancel" to quit.`);
}
exports.routeReply = routeReply;
//# sourceMappingURL=deleteAlarm.js.map