
module.exports.hi = function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.entity_a = function (conversationContext) {
    const s = conversationContext.request.text;
    if (s.startsWith('value')) {
        conversationContext.local.a =  s.substring(6);
        return true;
    }
    return false;
}

module.exports.entity_b = function (conversationContext) {
    const s = conversationContext.request.text;
    if (s.startsWith('value')) {
        conversationContext.local.b =  s.substring(6);
        return true;
    }
    return true;
}

module.exports.entity_c = function (conversationContext) {
    const s = conversationContext.request.text;
    if (s.startsWith('value')) {
        conversationContext.local.c =  s.substring(6);
        return true;
    }
    return true;
}
