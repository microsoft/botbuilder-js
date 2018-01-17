
module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.entity_a = function (conversationContext) {
    conversationContext.local.a = conversationContext.request.text;
    return true;
}

module.exports.entity_b = function (conversationContext) {
    conversationContext.local.b = conversationContext.request.text;
    return true;
}

module.exports.entity_c = function (conversationContext) {
    conversationContext.local.c = conversationContext.request.text;
    return true;
}
