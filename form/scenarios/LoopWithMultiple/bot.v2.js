module.exports.proc = function proc(conversationContext) {
}

module.exports.dec = function dec(conversationContext) {
    if ( conversationContext.local.a === undefined) {
        conversationContext.local.a = '1';
        return 'No';
    }
    else {
        return 'Yes';
    }
}

module.exports.hi = function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.entity_a = function entity_a(conversationContext) {
    conversationContext.local.a = conversationContext.request.text;
    return true;
}
