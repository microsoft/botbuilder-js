module.exports.func = function (conversationContext) {
    throw new Error('user thrown error');
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}
