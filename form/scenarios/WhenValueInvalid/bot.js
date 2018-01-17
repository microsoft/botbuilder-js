export function func(conversationContext) {
    return 'invalid';
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}
