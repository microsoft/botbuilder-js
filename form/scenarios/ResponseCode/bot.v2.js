
module.exports.processFunc = function (conversationContext) {
    if ('a' in conversationContext.local && 'b' in conversationContext.local) {
        return;
    }
    conversationContext.local.c = 'C';
}

module.exports.responseFunc = function (conversationContext) {
    conversationContext.local.d = 'D';
    conversationContext.global.b = conversationContext.local.b;
    delete conversationContext.local.b;
}

module.exports.conditionalFunc = function (conversationContext) {
    delete conversationContext.local.a;
    return 'x';
}

module.exports.hi = function (conversationContext) {
    conversationContext.local.a = 'A';
    conversationContext.local.b = 'B';
    return conversationContext.request.text === 'hi';
}
