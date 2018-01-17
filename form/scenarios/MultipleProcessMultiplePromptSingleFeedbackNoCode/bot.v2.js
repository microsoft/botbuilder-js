module.exports.funcProcess1 = function (conversationContext) {
    conversationContext.global.process1 = 'PROCESS-ENTITY-1';
}

module.exports.funcProcess2 = function (conversationContext) {
    conversationContext.global.process2 = 'PROCESS-ENTITY-2';
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.entity1 = function (conversationContext) {
    conversationContext.local.entity1 = conversationContext.request.text;
    return true;
}

module.exports.entity2 = function (conversationContext) {
    conversationContext.local.entity2 = conversationContext.request.text;
    return true;
}
