module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.entity_a = function (conversationContext) {
    conversationContext.local.a = conversationContext.request.text;
    return true;
}

module.exports.func1 = function(context) {
    context.local.b = 'b';
    var entity = context.local.a;
    if (entity.length < 2 && context.request.text.length < 2) {
        return 'small';
    }
    else if (entity.length >= 2 && entity.length < 4) {
        return 'medium';
    }
    return 'large';
}

module.exports.func2 = function(context) {
    if ('b' in context.local) {
        return 'yes';
    }
    return 'no';
}