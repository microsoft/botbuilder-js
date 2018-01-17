module.exports.funcPromptWhen = function (conversationContext) {
    if (conversationContext.local.x === 'AA') {
        conversationContext.local.y = 'BB';
        return false;
    }
    return true;
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.recognize_entity_x = function (conversationContext) {
    conversationContext.local.x = conversationContext.request.text;
    return true;
}

module.exports.recognize_entity_y = function (conversationContext) {
    conversationContext.local.y = conversationContext.request.text;
    return true;
}
