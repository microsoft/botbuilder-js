export function decision1(conversationContext) {
    return conversationContext.taskEntities['entity1'][0].value;
}

export function decision2(conversationContext) {
    return conversationContext.taskEntities['entity2'][0].value;
}

export function decision3(conversationContext) {
    return conversationContext.taskEntities['entity3'][0].value;
}

export function decision4(conversationContext) {
    return conversationContext.taskEntities['entity4'][0].value;
}

export function decision5(conversationContext) {
    return conversationContext.taskEntities['entity5'][0].value;
}

export function decision6(conversationContext) {
    return conversationContext.taskEntities['entity6'][0].value;
}

export function decision7(conversationContext) {
    return conversationContext.taskEntities['entity7'][0].value;
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function entity_entity1(conversationContext) {
    conversationContext.addTaskEntity('entity1', conversationContext.request.text);
    return true;
}

export function entity_entity2(conversationContext) {
    conversationContext.addTaskEntity('entity2', conversationContext.request.text);
    return true;
}

export function entity_entity3(conversationContext) {
    conversationContext.addTaskEntity('entity3', conversationContext.request.text);
    return true;
}

export function entity_entity4(conversationContext) {
    conversationContext.addTaskEntity('entity4', conversationContext.request.text);
    return true;
}

export function entity_entity5(conversationContext) {
    conversationContext.addTaskEntity('entity5', conversationContext.request.text);
    return true;
}

export function entity_entity6(conversationContext) {
    conversationContext.addTaskEntity('entity6', conversationContext.request.text);
    return true;
}

export function entity_entity7(conversationContext) {
    conversationContext.addTaskEntity('entity7', conversationContext.request.text);
    return true;
}
