
export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function recognize_entity_a(conversationContext) {
    const s = conversationContext.request.text;
    if (s.startsWith('value')) {
        conversationContext.addTaskEntity('a', s.substring(6));
        return true;
    }
    return false;
}
