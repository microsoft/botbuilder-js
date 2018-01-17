
module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.recognize_entity_a = function (conversationContext) {
    const s = conversationContext.request.text;
    if (s.startsWith('value')) {
        conversationContext.local.a = s.substring(6);
        return true;
    }
    return false;
}
