module.exports.funcPromptWhen = function funcPromptWhen(conversationContext) {
    conversationContext.addTaskEntity('promptWhen', { value : 'called', score: 0.9});
    return true;
}

module.exports.funcRepromptWhen = function funcRepromptWhen(conversationContext) {
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

module.exports.hi = function (conversationContext) {
    return conversationContext.request.text === 'hi';
}

module.exports.recognize_entity_a = function (conversationContext) {
    const s = conversationContext.request.text;
    if (s.startsWith('value')) {
        conversationContext.addTaskEntity('a', s.substring(6));
        return true;
    }
    return false;
}
