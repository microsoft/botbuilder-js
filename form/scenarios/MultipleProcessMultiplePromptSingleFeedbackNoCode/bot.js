export function funcProcess1(conversationContext) {
    conversationContext.addContextEntity('process1', 'PROCESS-ENTITY-1');
}

export function funcProcess2(conversationContext) {
    conversationContext.addContextEntity('process2', 'PROCESS-ENTITY-2');
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function entity1(conversationContext) {
    conversationContext.addTaskEntity('entity1', conversationContext.request.text);
    return true;
}

export function entity2(conversationContext) {
    conversationContext.addTaskEntity('entity2', conversationContext.request.text);
    return true;
}
