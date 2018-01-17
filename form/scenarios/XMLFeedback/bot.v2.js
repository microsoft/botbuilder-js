
module.exports.func = function (conversationContext) {
    conversationContext.local.url = 'http://hello';
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}
