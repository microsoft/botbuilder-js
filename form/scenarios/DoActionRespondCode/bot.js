
export function recognize1(conversationContext) {
    return conversationContext.request.text === '1';
}

export function recognize2(conversationContext) {
    return conversationContext.request.text === '2';
}

export function funcBeforeResponse(conversationContext) {
    var response = conversationContext.responses.slice(-1).pop();
    conversationContext.responses[conversationContext.responses.length - 1].text = '((((' + response.text + '))))';
}