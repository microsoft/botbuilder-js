// Copyright (c) Microsoft Corporation. All rights reserved.

const evaluateAt = function (dispatchTable, index, context, messageContext, options) {
    if (context.sticky) {
        for (var item of dispatchTable) {
            if (item.action.name === context.sticky) {
                return executeAction(item, context, messageContext, options);
            }
        }
        return Promise.reject(new Error(`context.sticky: "${context.sticky}" was not found.`));
    }

    if (index === dispatchTable.length) {
        return Promise.resolve();
    }

    const element = dispatchTable[index];

    return Promise.resolve(executeCondition(element, context, messageContext))
        .then(function (conditionResult) {
            if (conditionResult) {
                options.logger.log(`Matched IF: ${element.action.name}`);
                return executeAction(element, context, messageContext, options);
            }
            else {
                context.local = {};
                return evaluateAt(dispatchTable, index + 1, context, messageContext, options);
            }
        })
        .catch((err) => {
            return Promise.reject(err);
        });
};

const rejectReason = function (operation, element, err) {
    if (err && err.reason) {
        err = err.reason;
    }
    return new Error(`operation: "${operation}", task: "${element.action.name}", reason: "${err ? err.toString() : 'undefined'}"`);
};

const executeCondition = function (element, context, messageContext) {
    try {
        return Promise.resolve(element.condition.execute(context, messageContext))
            .catch ((err) => {
                return Promise.reject(rejectReason('condition', element, err));
            });
    }
    catch (err) {
        return Promise.reject(rejectReason('condition', element, err));
    }
};

const executeAction = function (element, context, messageContext, options) {
    try
    {
        options.logger.log(`Execute DO: ${element.action.name}`);
        return Promise.resolve(element.action.execute(context, messageContext))
            .then((rsp) => {
                switch (rsp ? rsp.status : 'complete') {
                    case 'complete':
                        context.local = {};
                        delete context.sticky;
                        break;
                    case 'continue':
                        context.sticky = element.action.name;
                        break;
                    default:
                        throw new Error('Unknown status from action');
                }
            })
            .catch ((err) => {
                return Promise.reject(rejectReason('action', element, err));
            });
    }
    catch (err) {
        return Promise.reject(rejectReason('action', element, err));
    }
};

const nullLogger = {
    log : function() {}
};

const evaluate = function (dispatchTable, context, options) {
    const messageContext = {};
    options = options || {};
    options.logger = options.logger || nullLogger;
    return evaluateAt(dispatchTable, 0, context, messageContext, options);
};

module.exports.evaluate = evaluate;