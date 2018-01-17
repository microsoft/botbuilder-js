export function func(conversationContext) {
    var a = conversationContext.taskEntities.a;
    var entity = a[0].value;
    if (entity.length < 2 && conversationContext.request.text.length < 2) {
        return 'small';
    }
    else if (entity.length >= 2 && entity.length < 4) {
        return 'medium';
    }
    return 'large';
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function entity_a(conversationContext) {
    conversationContext.addTaskEntity('a', conversationContext.request.text);
    return true;
}
