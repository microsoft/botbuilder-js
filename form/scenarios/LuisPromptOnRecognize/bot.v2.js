
module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.onLuis = function(context) {
    context.global.count = context.global.count || 0;
    context.global.count++;
    return context.global.count > 1;
}
