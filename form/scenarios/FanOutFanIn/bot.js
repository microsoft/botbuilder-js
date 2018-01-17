function recognize(entityName, activity, conversationContext) {
    var matchValues = activity.text.match(/^\d+$/);
    if (matchValues !== null) {
        conversationContext.addTaskEntity(entityName, matchValues[0]);
        return true;
    }
    else {
        return false;
    }
}

export function recognize_x(conversationCore) {
    var activity = conversationCore.request;
    return recognize('x', conversationCore.request, conversationCore);
}

export function recognize_a(conversationCore) {
    return recognize('a', conversationCore.request, conversationCore);
}

export function recognize_b(conversationCore) {
    return recognize('b', conversationCore.request, conversationCore);
}

export function recognize_c(conversationCore) {
    return recognize('c', conversationCore.request, conversationCore);
}

export function decision1(conversationContext) {
    var x = Number(conversationContext.taskEntities['x'][0].value);
    if (x < 10) {
        return 'left';
    }
    else {
        return 'right';
    }
}

export function decision2(conversationContext) {
    var b = Number(conversationContext.taskEntities['b'][0].value);
    if (b < 10) {
        return 'left';
    }
    else {
        return 'right';
    }
}