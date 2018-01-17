export function prompt_func(context) {
    var response = context.responses.slice(-1).pop();
    context.addContextEntity('text', response.text);
    context.responses[context.responses.length - 1].text = response.text + "-- modified in prompt_func";
}

export function feedback_func(context) {
    var response = context.responses.slice(-1).pop();
    context.responses[context.responses.length - 1].text = response.text + "-- feedback_func called!";
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}

export function entity_a(conversationContext) {
    conversationContext.addTaskEntity('a', conversationContext.request.text);
    return true;
}
