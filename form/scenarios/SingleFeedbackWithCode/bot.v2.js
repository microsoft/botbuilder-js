module.exports.func = function func(conversationContext) {
    var response = conversationContext.responses.slice(-1).pop();
    conversationContext.global.utterance = response.text;
    conversationContext.responses[conversationContext.responses.length - 1].text = '((((' + response.text + '))))';
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}
