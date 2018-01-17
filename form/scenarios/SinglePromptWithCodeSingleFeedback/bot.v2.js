module.exports.func = function (context) {
    var response = context.responses.slice(-1).pop(); 
    context.responses[context.responses.length - 1].text = '((((' + response.text + '))))';
    context.responses.push({text: 'generated in beforeResponse function', type: 'message'});
}

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.recognize_entity_a = function (conversationContext) {
    const s = conversationContext.request.text;
    if (s.startsWith('value')) {
        conversationContext.local.a = s.substring(6);
        return true;
    }
    return false;
}
