export function greeting_func(conversationContext) {
    var activity = conversationContext.request;
    if (/(hi|hello|g'day mate)/.test(activity.text)) {
        return true;
    }
    else {
        return false;
    }
}

export function partySize_func(conversationContext) {
    var activity = conversationContext.request;
    var match = activity.text.match(/\d+/);
    if (match !== null) {
        var partySize = match[0];
        conversationContext.addTaskEntity('entity_partySize', partySize);
        return true;
    }
    else {
        return false;
    }
}
