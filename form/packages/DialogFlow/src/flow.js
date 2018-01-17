// Copyright (c) Microsoft Corporation. All rights reserved.

const core = require('bot-framework-core');

const executeStart = function () {
    return Promise.resolve({ status: 'complete' });
};

const getCodeBehind = function (name, codeBehind) {
    const fn = codeBehind[name];
    if (typeof fn !== 'function') {
        throw new Error(`cannot find function with name ${name}`);
    }
    return function (context) {
        try {
            return fn(context);
        }
        catch (err) {
            throw new Error(`user function "${name}" threw an exception: ${err}`);
        }
    };
};

const executeProcess = function (context, codeBehind) {
    return Promise.resolve(getCodeBehind(context.transition.onRun, codeBehind)(context)).then((rsp) => {
        return Promise.resolve({ status: 'complete' });
    });
};

const executeDecision = function (context, codeBehind) {
    return Promise.resolve(getCodeBehind(context.transition.onRun, codeBehind)(context)).then((rsp) => {
        return Promise.resolve({ when: rsp, status: 'complete' });
    });
};

const hasRequiredEntities = function (context) {
    const metadata = context.transition.entities;
    const data = context.local;
    const dataNames = new Set(Object.keys(data));
    const requiredEntities = metadata.filter((e) => e.promptIfMissing);
    for (const requiredEntity of requiredEntities) {
        if (!dataNames.has(requiredEntity.name)) {
            return false;
        }
    }
    return true;
};

const defaultPromptWhen = function (context) {
    return Promise.resolve(!hasRequiredEntities(context));
};

const executeRecognizer = function (transition, context, codeBehind, templates, options) {
    if (core.processCardAction(context)) {
        return Promise.resolve(true);
    }
    switch (transition.recognizer.type) {
        case 'CodeRecognizer':
            return core.codeRecognizer(transition.recognizer.onRun, codeBehind, context);
        case 'LUISRecognizer':
            options.luisKey = options.luisKey || transition.recognizer.key;
            return core.luisRecognizer(transition.recognizer, options, context, codeBehind);
        case 'RegexRecognizer':
            return core.regexRecognizer(transition.recognizer, context);
        default:
            throw new Error('unknown recognizer type');
    }
};

const checkResume = function (flowName, context, codeBehind, templates) {
    const stack = context.flow.stack;
    if (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top.dialogFlowName === flowName && top.stateName === context.transition.name) {
            return Promise.resolve(true);
        }
    }
    return Promise.resolve(false);
};

const getTurn = function (context) {
    const top = context.flow.stack[context.flow.stack.length - 1];
    return top !== undefined && top.type === 'PromptFrame' ? top.turn : 0;
};

const setTurn = function (context, turn) {
    context.flow.stack[context.flow.stack.length - 1].turn = turn;
};

const incrementTurn = function (context) {
    setTurn(context, getTurn(context) + 1);
};

const getPromptWhen = function (transition, codeBehind) {
    if (transition.promptWhen !== undefined && transition.promptWhen !== '') {
        return getCodeBehind(transition.promptWhen, codeBehind);
    }
    return defaultPromptWhen;
};

const executePrompt = function (flowName, context, templates, cards, codeBehind, options) {
    const promptWhen = getPromptWhen(context.transition, codeBehind);
    return checkResume(flowName, context, codeBehind, templates).then(resumeRsp => {
        if (resumeRsp) {
            return executeRecognizer(context.transition, context, codeBehind, templates, options).then((recognizerRsp) => {
                incrementTurn(context);
                if (!recognizerRsp) {
                    return executeRespond(context, templates, cards, codeBehind).then(respondRsp => {
                        return Promise.resolve({ status: 'continue' });
                    });
                }
                return Promise.resolve(promptWhen(context)).then((promptWhenRsp) => {
                    if (promptWhenRsp) {
                        return executeRespond(context, templates, cards, codeBehind).then(respondRsp => {
                            return Promise.resolve({ status: 'continue' });
                        });
                    }
                    else {
                        context.flow.stack.pop();
                        return Promise.resolve({ status: 'complete' });
                    }
                });
            });
        }
        else {
            return Promise.resolve(promptWhen(context)).then((promptWhenRsp) => {
                if (promptWhenRsp) {
                    context.flow.stack.push({
                        type: 'PromptFrame',
                        dialogFlowName: flowName,
                        stateName: context.transition.name,
                        turn: 0
                    });
                    return executeRespond(context, templates, cards, codeBehind).then(respondRsp => {
                        return Promise.resolve({ status: 'continue' });
                    });
                }
                else {
                    return Promise.resolve({ status: 'complete' });
                }
            });
        }
    });
};

const getFeedbackForTurn = function (transition, turn) {
    if (Array.isArray(transition.feedback) && transition.feedback.length > 0) {
        let feedback = transition.feedback[0];
        for (const next of transition.feedback) {
            if (feedback.forTurn >= turn) {
                break;
            }
            feedback = next;
        }
        return feedback;
    } else {
        return transition.feedback;
    }
};

const executeRespond = function (context, templates, cards, codeBehind) {
    const feedback = getFeedbackForTurn(context.transition, getTurn(context));
    return core.responder(templates, cards, feedback, context.transition.beforeResponse, context, codeBehind).then(() => {
        return Promise.resolve({ status: 'complete' });
    });
};

const executeEnd = function (context) {
    let next;
    if (context.flow.stack.length == 0) {
        // delete context.sticky;
    }
    else {
        next = context.flow.stack.pop();
    }
    return Promise.resolve({ status: 'complete', next: next });
};

const executeModule = function (flow, context) {
    const nextStateName = getNextStateName(flow, context.transition.name);
    context.flow.stack.push({
        type: 'DialogFlow',
        dialogFlowName: flow.name,
        stateName: nextStateName,
    });

    return Promise.resolve({
        status: 'complete', next: {
            dialogFlowName: context.transition.refTo,
            stateName: ''
        }
    });
};

const executeTransition = function (flow, context, templates, cards, codeBehind, options) {

    //console.info(`${context.transition.}`);

    switch (context.transition.type) {
        case 'Return':
        case 'End':
            return executeEnd(context);
        case 'Respond':
            return executeRespond(context, templates, cards, codeBehind);
        case 'Initial':
            return executeStart();
        case 'Process':
        case 'Decision':
            return executeDecision(context, codeBehind);
        case 'Prompt':
            return executePrompt(flow.name, context, templates, cards, codeBehind, options);
        case 'DialogFlowRef':
            return executeModule(flow, context);
        default:
            throw new Error('unknown transition type');
    }
};

const getFlowByName = function (name, doAction, sharedDialogFlows) {
    if (name === doAction.rootDialogFlow.name) {
        if (doAction.rootDialogFlow) {
            return doAction.rootDialogFlow;
        }
    }
    const nonRootFlow = doAction.nonRootDialogFlows[name];
    if (nonRootFlow) {
        return nonRootFlow;
    }
    const sharedFlow = sharedDialogFlows[name];
    if (sharedFlow) {
        return sharedFlow;
    }
    throw new Error(`dialog flow not found. ${name}`);
};

const getNextStateName = function (flow, transitionName, when) {
    let next = flow.stateTransitionTable.table.filter((x) => {
        if (x.from === transitionName) {
            return x;
        }
    });
    if (when !== undefined) {
        next = next.filter((x) => {
            if (x.whenValueIs === when) {
                return x;
            }
        });
        if (next.length == 0) {
            throw new Error(`Invalid decision state: ${when}`);
        }
    }
    if (next.length > 1) {
        throw new Error(`multiple next states. ${JSON.stringify(next)}`);
    }
    if (next.length === 0) {
        return undefined;
    }
    return next[0].to;
};

const runFlow = function (flow, doAction, templates, cards, sharedDialogFlows, codeBehind, context, transitionName , options) {
    if (transitionName === undefined || transitionName === '') {
        // new dialogflow
        transitionName = flow.stateTransitionTable.initialState;
    }

    context.transition = flow.transitions[transitionName];
    if (context.transition === undefined) {
        throw new Error(`Unable to find initialState "${transitionName}"`);
    }

    return executeTransition(flow, context, templates, cards, codeBehind, options).then((rsp) => {
        try {
            if (rsp.status === 'continue') {
                // reached a stop point
                return Promise.resolve(rsp);
            }
            if (rsp.next) {
                // a sub dialog has ended and popped stack. Execute the popped item from address
                let nextFlow = getFlowByName(rsp.next.dialogFlowName, doAction, sharedDialogFlows);
                return runFlow(nextFlow, doAction, templates, cards, sharedDialogFlows, codeBehind, context, rsp.next.stateName, options);
            }
            const nextStateName = getNextStateName(flow, transitionName, rsp.when);
            if (!nextStateName) {
                // no next step
                return Promise.resolve(rsp);
            }
            return runFlow(flow, doAction, templates, cards, sharedDialogFlows, codeBehind, context, nextStateName, options);
        }
        catch (err) {
            return Promise.reject(err);
        }
    });
};

const run = function (name, doAction, templates, cards, sharedDialogFlows, codeBehind, context, options) {
    try {
        if (context.flow === undefined) {
            context.flow = { stack: [] };
        }
        let transitionName = '';
        let flow = doAction.rootDialogFlow;
        const stack = context.flow.stack;
        if (stack.length > 0) {
            const top = stack[stack.length - 1];
            transitionName = top.stateName;
            flow = getFlowByName(top.dialogFlowName, doAction, sharedDialogFlows);
        }
        return runFlow(flow, doAction, templates, cards, sharedDialogFlows, codeBehind, context, transitionName, options);
    }
    catch (err) {
        return Promise.reject(err);
    }
};

module.exports = {
    run: run
};