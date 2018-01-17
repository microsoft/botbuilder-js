export function decision(conversationContext) {
    var task = conversationContext.taskEntities;
    var path =  task.path[0].value;
    if (path.length > 0) {
        var next = path[0];

        var context = conversationContext.contextEntities;
        var key = 'next';
        context[key] = (context[key] || []);
        context[key].push({ value: next } );

        task.path[0].value = path.substring(1);
        return next;
    }
    else {
        throw new Error();
    }
}

export function hi(conversationContext) {
    const s = conversationContext.request.text;
    if (s.startsWith('hi')) {
        conversationContext.addTaskEntity('path', s.substring(3));
        return true;
    }
    return false;
}
