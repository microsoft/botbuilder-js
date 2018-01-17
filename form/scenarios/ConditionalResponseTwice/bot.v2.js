module.exports.func = function(conversationContext) {
    var entity = conversationContext.local.a;
    if (entity.length < 2 && conversationContext.request.text.length < 2) {
        return 'small';
    }
    else if (entity.length >= 2 && entity.length < 4) {
        return 'medium';
    }
    return 'large';
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.entity_a = function (conversationContext) {
    conversationContext.local.a =  conversationContext.request.text;
    return true;
}
