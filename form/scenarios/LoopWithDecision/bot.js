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
