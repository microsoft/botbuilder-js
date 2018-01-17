
export function decision(conversationContext) {

    var entity = conversationContext.taskEntities['entity'][0].value;

    switch (entity)
    {
        case '1':
            return 'a';
        case '2':
            return 'b';
        case '3':
            return 'c';
        case '4':
            return 'd';
        default:
            throw "unexpected input";
    }
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function entity(conversationContext) {
    conversationContext.addTaskEntity('entity', conversationContext.request.text);
    return true;
}
