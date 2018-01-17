
export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function entity_a(conversationContext) {
    conversationContext.addTaskEntity('a', conversationContext.request.text);
    return true;
}

export function entity_b(conversationContext) {
    conversationContext.addTaskEntity('b', conversationContext.request.text);
    return true;
}
