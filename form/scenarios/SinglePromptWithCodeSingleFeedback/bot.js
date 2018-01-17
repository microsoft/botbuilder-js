export function func(context) {
    var response = context.responses.slice(-1).pop(); 
    context.responses[context.responses.length - 1].text = '((((' + response.text + '))))';
    context.responses.push({text: 'generated in beforeResponse function', type: 'message'});
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function recognize_entity_a(conversationContext) {
    const s = conversationContext.request.text;
    if (s.startsWith('value')) {
        conversationContext.addTaskEntity('a', s.substring(6));
        return true;
    }
    return false;
}
