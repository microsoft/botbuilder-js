export function func(conversationContext) {
    console.log('test');
    conversationContext.contextEntities.a = conversationContext.taskEntities.a;
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function entity_a(conversationContext) {
    conversationContext.addTaskEntity('a', conversationContext.request.text);
    return true;
}
