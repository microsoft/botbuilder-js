
module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}
