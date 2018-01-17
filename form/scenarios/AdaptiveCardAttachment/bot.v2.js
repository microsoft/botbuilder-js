module.exports.func = function func(context) {
    context.local.a = "1";
    var activity = context.request;
    if (/(hi|hello|g'day mate)/.test(activity.text)) {
        return true;
    }
    return false;
}