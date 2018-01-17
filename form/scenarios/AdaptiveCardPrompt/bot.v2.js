module.exports.greeting_func = function (conversationContext) {
    var activity = conversationContext.request;
    conversationContext.local.a = '1';
    if (/(hi|hello|g'day mate)/.test(activity.text)) {
        return true;
    }
    else {
        return false;
    }
}

module.exports.partySize_func = function (conversationContext) {
    var activity = conversationContext.request;
    var match = activity.text.match(/\d+/);
    if (match !== null) {
        var partySize = match[0];
        conversationContext.local.entity_partySize = partySize;
        return true;
    }
    else {
        return false;
    }
}
