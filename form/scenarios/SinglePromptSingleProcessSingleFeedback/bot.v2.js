module.exports.func = function(context) {
    context.global.a = context.local.a;
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.entity_a = function (conversationContext) {
    conversationContext.local.a = conversationContext.request.text;
    return true;
}

