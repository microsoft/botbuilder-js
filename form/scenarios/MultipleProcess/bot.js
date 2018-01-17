export function Process1_onRun(conversationContext) {
    conversationContext.responses.push({text: 'process1', type: 'message'});
    conversationContext.addContextEntity('x', '1');
}

export function Process2_onRun(conversationContext) {
    conversationContext.responses.push({text: 'process2', type: 'message'});
    conversationContext.addContextEntity('x', '2');
}

export function Process3_onRun(conversationContext) {
    conversationContext.responses.push({text: 'process3', type: 'message'});
    conversationContext.addContextEntity('x', '3');
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}