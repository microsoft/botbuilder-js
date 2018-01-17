export function dec(conversationContext) {
    if ( conversationContext.taskEntities['a'] === undefined) {
        conversationContext.addTaskEntity("a", "1");
        return 'No';
    }
    else {
        return 'Yes';
    }
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function entity_a(conversationContext) {
    conversationContext.addTaskEntity('a', conversationContext.request.text);
    return true;
}
