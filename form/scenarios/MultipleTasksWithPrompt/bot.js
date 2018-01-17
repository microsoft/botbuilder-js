export function a2x(conversationContext) {
    var a = conversationContext.taskEntities.a[0].value;
    conversationContext.contextEntities.context_x = [{ value : a }];
}

export function b2y(conversationContext) {
    var b = conversationContext.taskEntities.b[0].value;
    conversationContext.contextEntities.context_y = [{ value : b }];
}

export function contextEntities2entities(conversationContext) {
    conversationContext.taskEntities.x = conversationContext.contextEntities.context_x.map(entity => { return {value : entity.value};});
    conversationContext.taskEntities.y = conversationContext.contextEntities.context_y.map(entity => { return {value: entity.value};});
}

export function recognize_1(conversationContext) {
    return conversationContext.request.text === '1';
}

export function recognize_2(conversationContext) {
    return conversationContext.request.text === '2';
}

export function recognize_3(conversationContext) {
    return conversationContext.request.text === '3';
}

export function entity_a(conversationContext) {
    conversationContext.addTaskEntity('a', conversationContext.request.text);
    return true;
}

export function entity_b(conversationContext) {
    conversationContext.addTaskEntity('b', conversationContext.request.text);
    return true;
}
