export function funcPromptWhen(conversationContext) {
    conversationContext.addTaskEntity('promptWhen', { value : 'called', score: 0.9});
    return true;
}

export function funcRepromptWhen(conversationContext) {
    var toBot = conversationContext.request;
    var turn = conversationContext.getCurrentTurn();
    if(turn === 1) {
        if(conversationContext.taskEntities.promptWhen[0].score == 0.9) {
            conversationContext.removeTaskEntity('promptWhen', 'called');
        }
    }

    if(turn === 2 && toBot.text === "C") {
        conversationContext.addTaskEntity('a', toBot.text);
        return false;
    }

    conversationContext.taskEntities.repromptWhen = [{value: turn}];
    return true;
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