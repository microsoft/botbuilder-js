module.exports.func = function func(conversationContext) {
    conversationContext.taskEntities.x = [{ value: 42 }];
};

module.exports.conditional_func = function conditional_func(conversationContext) {
    return 'large';
}

module.exports.conditional_func_no_match = function conditional_func_no_match(conversationContext) {
    return 'tiny';
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}
