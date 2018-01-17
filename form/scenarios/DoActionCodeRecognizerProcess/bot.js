
export function recognize1 (conversationContext) {
    return (/1/.test(conversationContext.request.text));
}

export function process1 (conversationContext) {
    conversationContext.contextEntities.x1 = [{value : '1'}];
    conversationContext.responses.push({ text: 'from code in process1' });
}

export function recognize2 (conversationContext) {
    return (/2/.test(conversationContext.request.text));
}

export function process2 (conversationContext) {
    conversationContext.contextEntities.x2 = [{value : '2'}];
    conversationContext.responses.push({ text: 'from code in process2' });
}

export function recognize3 (conversationContext) {
    return (/3/.test(conversationContext.request.text));
}

export function process3 (conversationContext) {
    conversationContext.contextEntities.x3 = [{value : '3'}];
    conversationContext.responses.push({ text: 'from code in process3' });
}
