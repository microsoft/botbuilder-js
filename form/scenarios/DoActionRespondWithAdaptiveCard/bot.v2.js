
module.exports.recognize1 = function (conversationContext) {
    if (/1/.test(conversationContext.request.text)) {
        conversationContext.local.x = '1';
        return true;
    }
    return false;
}

module.exports.recognize2 = function (conversationContext) {
    if (/2/.test(conversationContext.request.text)) {
        conversationContext.local.x = '2';
        return true;
    }
    return false;
}

module.exports.recognize3 = function (conversationContext) {
    if (/3/.test(conversationContext.request.text)) {
        conversationContext.local.x = '3';
        return true;
    }
    return false;
}
