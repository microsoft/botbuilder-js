export function func(conversationContext) {
    conversationContext.taskEntities.x = [{value : 42}];
}

export function conditional_func(conversationContext) {
    return 'large';
}

export function conditional_func_no_match(conversationContext) {
    return 'tiny';
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}
