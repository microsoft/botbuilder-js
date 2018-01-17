module.exports.decision1 = function (conversationContext) {
    return conversationContext.local.entity1;
}

module.exports.decision2 = function (conversationContext) {
    return conversationContext.local.entity2;
}

module.exports.decision3 = function (conversationContext) {
    return conversationContext.local.entity3;
}

module.exports.decision4 = function (conversationContext) {
    return conversationContext.local.entity4;
}

module.exports.decision5 = function (conversationContext) {
    return conversationContext.local.entity5;
}

module.exports.decision6 = function (conversationContext) {
    return conversationContext.local.entity6;
}

module.exports.decision7 = function (conversationContext) {
    return conversationContext.local.entity7;
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.entity_entity1 = function (conversationContext) {
    conversationContext.local.entity1 = conversationContext.request.text;
    return true;
}

module.exports.entity_entity2 = function (conversationContext) {
    conversationContext.local.entity2 = conversationContext.request.text;
    return true;
}

module.exports.entity_entity3 = function (conversationContext) {
    conversationContext.local.entity3 = conversationContext.request.text;
    return true;
}

module.exports.entity_entity4 = function (conversationContext) {
    conversationContext.local.entity4 = conversationContext.request.text;
    return true;
}

module.exports.entity_entity5 = function (conversationContext) {
    conversationContext.local.entity5 = conversationContext.request.text;
    return true;
}

module.exports.entity_entity6 = function (conversationContext) {
    conversationContext.local.entity6 = conversationContext.request.text;
    return true;
}

module.exports.entity_entity7 = function (conversationContext) {
    conversationContext.local.entity7 = conversationContext.request.text;
    return true;
}
