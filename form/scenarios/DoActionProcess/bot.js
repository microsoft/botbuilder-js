export function func1(conversationContext) {
    conversationContext.contextEntities.x1 = [{value : '1'}];
}

export function func2(conversationContext) {
    conversationContext.contextEntities.x2 = [{value : '2'}];
}

export function func3(conversationContext) {
    conversationContext.contextEntities.x3 = [{value : '3'}];
}

export function recognize1(conversationContext) {
    return conversationContext.request.text === '1';
}

export function recognize2(conversationContext) {
    return conversationContext.request.text === '2';
}

export function recognize3(conversationContext) {
    return conversationContext.request.text === '3';
}

