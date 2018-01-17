module.exports.func = function(conversationContext) {
    // <ListenFor>(valueA {a} valueB {b}|valueA {a}|valueB {b})</ListenFor>
    var activity = conversationContext.request;
    if (/valueA .*? valueB .*?/.test(activity.text)) {
        const endIndex = activity.text.indexOf('valueB');
        const a = activity.text.substring(7, endIndex).trim();
        const b = activity.text.substr(endIndex + 7).trim();
        conversationContext.local.a = a;
        conversationContext.local.b = b;
        return true;
    }
    else if (/valueA .*?/.test(activity.text)) {
        const a = activity.text.substr(7).trim();
        conversationContext.local.a = a;
        return true;
    }
    else if (/valueB .*?/.test(activity.text)) {
        const b = activity.text.substr(7).trim();
        conversationContext.local.b = b;
        return true;
    }
    else {
        return false;
    }
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}
