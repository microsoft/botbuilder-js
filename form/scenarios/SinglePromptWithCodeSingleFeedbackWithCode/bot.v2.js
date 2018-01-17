module.exports.prompt_func = function prompt_func(context) {
    var response = context.responses.slice(-1).pop();
    context.global.text = response.text;
    context.responses[context.responses.length - 1].text = response.text + "-- modified in prompt_func";
}

module.exports.feedback_func = function feedback_func(context) {
    var response = context.responses.slice(-1).pop();
    context.responses[context.responses.length - 1].text = response.text + "-- feedback_func called!";
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.entity_a = function (conversationContext) {
    conversationContext.local.a = conversationContext.request.text;
    return true;
}
