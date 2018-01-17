
export function func(conversationContext) {
    conversationContext.taskEntities.url = [{value : 'http://hello'}];
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}
