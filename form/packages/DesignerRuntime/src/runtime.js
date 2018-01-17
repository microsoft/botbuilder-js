// Copyright (c) Microsoft Corporation. All rights reserved.

const getCurrentTurn = function () {
    if (this.flow.stack === undefined) {
        return 0;
    }
    if (this.flow.stack.length === undefined || this.flow.stack.length < 1) {
        return 0;
    }
    const top = this.flow.stack[this.flow.stack.length - 1];
    return top.turn;
};

const addActivityInputHints = function (context) {
    if (context.responses.length > 0) {
        for (let i = 0; i < context.responses.length - 1; i++) {
            context.responses[i].inputHint = 'ignoringInput';
        }
        let isPrompt = context.flow !== undefined && context.flow.stack.length > 0;
        context.responses[context.responses.length - 1].inputHint = isPrompt ? 'expectingInput' : 'acceptingInput';
    }
};

const evaluate = function (dispatcher, context, options) {
    context.responses = [];
    context.getCurrentTurn = getCurrentTurn;

    return dispatcher(context, options).then((res) => {
        addActivityInputHints(context);
        return res;
    });
};

module.exports.evaluate = evaluate;
