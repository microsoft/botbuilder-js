
export function recognize_1(conversationContext) {
    return conversationContext.request.text === '1';
}

export function recognize_2(conversationContext) {
    return conversationContext.request.text === '2';
}

export function recognize_help(conversationContext) {
    return conversationContext.request.text === 'help';
}
