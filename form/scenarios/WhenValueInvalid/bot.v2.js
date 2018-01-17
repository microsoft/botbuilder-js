module.exports.func = function func(conversationContext) {
    return 'invalid';
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}
