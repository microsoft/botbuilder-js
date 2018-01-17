export function decision(conversationContext) {
    var entity =  conversationContext.taskEntities.entity[0].value;
    if (entity > 10) {
        return 'break';
    }
    else {
        delete conversationContext.taskEntities.entity;
        return 'continue';
    }
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function entity(conversationContext) {
    conversationContext.addTaskEntity('entity', conversationContext.request.text);
    return true;
}
