module.exports.func = function (conversationContext) {
    conversationContext.global.x = [{ value: '1' }, { value: '2' }];
    conversationContext.global.x.push({ value: '3' });
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}
