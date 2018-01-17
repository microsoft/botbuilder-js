export function func(conversationContext) {
    var activity = conversationContext.request;
    if (/(hi|hello|g'day mate)/.test(activity.text)) {
        return true;
    }
    else {
        return false;
    }
}