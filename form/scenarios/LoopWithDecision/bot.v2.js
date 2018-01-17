module.exports.dec = function dec(conversationContext) {
    if (conversationContext.local.a === undefined) {
        conversationContext.local.a = '1';
        return 'No';
    }
    else {
        return 'Yes';
    }
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}
