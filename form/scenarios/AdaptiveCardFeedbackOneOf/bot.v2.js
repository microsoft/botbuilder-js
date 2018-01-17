module.exports.func = function (conversationContext) {
    conversationContext.local.a = '1';
    var activity = conversationContext.request;
    if (/(hi|hello|g'day mate)/.test(activity.text)) {
        return true;
    }
    else {
        return false;
    }
}