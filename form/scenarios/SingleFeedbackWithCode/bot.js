export function func(conversationContext) {
    var response = conversationContext.responses.slice(-1).pop();
    conversationContext.contextEntities.utterance = [{value: response.text}];
    conversationContext.responses[conversationContext.responses.length - 1].text = '((((' + response.text + '))))';
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}
