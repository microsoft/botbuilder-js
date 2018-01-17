
module.exports.decision = function (conversationContext) {
    var entity = conversationContext.local.entity;
    switch (entity) {
        case '1':
            return 'a';
        case '2':
            return 'b';
        case '3':
            return 'c';
        case '4':
            return 'd';
        default:
            throw "unexpected input";
    }
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.entity = function (conversationContext) {
    conversationContext.local.entity = conversationContext.request.text;
    return true;
}
