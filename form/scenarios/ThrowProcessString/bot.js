export function func(conversationContext) {
    throw 'user thrown error';
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}
