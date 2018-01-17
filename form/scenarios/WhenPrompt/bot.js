export function funcPromptWhen(conversationContext) {
    if (conversationContext.taskEntities.x[0].value === 'AA') {
        conversationContext.addTaskEntity('y', 'BB');
        return false;
    }
    return true;
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function recognize_entity_x(conversationContext) {
    conversationContext.addTaskEntity('x', conversationContext.request.text);
    return true;
}

export function recognize_entity_y(conversationContext) {
    conversationContext.addTaskEntity('y', conversationContext.request.text);
    return true;
}
