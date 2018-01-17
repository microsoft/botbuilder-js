export function func1(conversationContext) {
    conversationContext.taskEntities.a = [ { value: '"' + conversationContext.taskEntities.a[0].value + '"' } ];
}

export function func2(conversationContext) {
    conversationContext.taskEntities.b = [ { value: '"' + conversationContext.taskEntities.b[0].value + '"' } ];
}

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
