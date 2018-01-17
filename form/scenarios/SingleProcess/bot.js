export function func(conversationContext) {
    conversationContext.contextEntities.x = [{value : '1'}, {value : '2'}];
    conversationContext.addContextEntity('x', '3');
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}
