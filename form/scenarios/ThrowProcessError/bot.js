export function func(conversationContext) {
    throw new Error('user thrown error');
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}
