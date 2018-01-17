
export function recognize1 (conversationContext) {
    if (/1/.test(conversationContext.request.text)) {
        conversationContext.taskEntities.x = [{value : '1'}];
        return true;
    }
    return false;
}

export function recognize2 (conversationContext) {
    if (/2/.test(conversationContext.request.text)) {
        conversationContext.taskEntities.x = [{value : '2'}];
        return true;
    }
    return false;
}

export function recognize3 (conversationContext) {
    if (/3/.test(conversationContext.request.text)) {
        conversationContext.taskEntities.x = [{value : '3'}];
        return true;
    }
    return false;
}
