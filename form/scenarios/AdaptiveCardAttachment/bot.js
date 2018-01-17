export function func(conversationContext) {
    conversationContext.addTaskEntity("a", "1");
    var activity = conversationContext.request;
    if (/(hi|hello|g'day mate)/.test(activity.text)) {
        return true;
    }
    return false;
}