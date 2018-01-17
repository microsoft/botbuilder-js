
module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.conversationUpdateRecognizeFunc = function (conversationContext) {
    return conversationContext.request.text === 'TEST';
}
