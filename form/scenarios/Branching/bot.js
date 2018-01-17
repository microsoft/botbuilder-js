export function func(conversationContext) {
    if (conversationContext.containsTaskEntity('a' ,'0')) {
        return 'yes';
    }
    else if (conversationContext.containsTaskEntity({type: 'a', value: '1'})) {
        return 'no';
    }
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function entity_a(conversationContext) {
    conversationContext.addTaskEntity('a', conversationContext.request.text);
    return true;
}
