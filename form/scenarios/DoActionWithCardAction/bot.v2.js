module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.task2_recognizer = function (conversationContext) {
    return false;
}
