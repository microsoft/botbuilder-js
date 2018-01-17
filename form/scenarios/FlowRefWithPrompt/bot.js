
export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function entity_a(conversationContext) {
    const s = conversationContext.request.text;
    if (s.startsWith('value')) {
        conversationContext.addTaskEntity('a', s.substring(6));
        return true;
    }
    return false;
}

export function entity_b(conversationContext) {
    const s = conversationContext.request.text;
    if (s.startsWith('value')) {
        conversationContext.addTaskEntity('b', s.substring(6));
        return true;
    }
    return true;
}

export function entity_c(conversationContext) {
    const s = conversationContext.request.text;
    if (s.startsWith('value')) {
        conversationContext.addTaskEntity('c', s.substring(6));
        return true;
    }
    return true;
}
