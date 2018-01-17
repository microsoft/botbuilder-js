
module.exports.func1 = function (conversationContext) {
    conversationContext.local.a = '"' + conversationContext.local.a + '"';
}

module.exports.func2 = function func2(conversationContext) {
    conversationContext.local.b = '"' + conversationContext.local.b + '"';
}

module.exports.hi = function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.entity_a = function entity_a(conversationContext) {
    conversationContext.local.a = conversationContext.request.text;
    return true;
}

module.exports.entity_b = function entity_b(conversationContext) {
    conversationContext.local.b = conversationContext.request.text;
    return true;
}
