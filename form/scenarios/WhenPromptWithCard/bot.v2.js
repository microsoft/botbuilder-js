module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.recognize_entity_x = function (conversationContext) {
    return true;
}
