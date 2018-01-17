module.exports.func = function (conversationContext) {
    throw 'user thrown error';
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}
