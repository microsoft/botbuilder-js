// Copyright (c) Microsoft Corporation. All rights reserved.

const readPerTaskIntentTips = function (task, templates) {
    const intentTips = task.getElementsByTagName('IntentTip');
    if (intentTips.length > 0) {
        const name = task.getAttribute('name');
        const template = {
            type: 'SimpleResponseTemplate',
            name: `builtin.tasktips.${name}`,
            feedback: { type: 'FeedbackOneOf', values: [] }
        };
        for (let i=0; i<intentTips.length; i++) {
            const intentTip = intentTips.item(i);
            const value = intentTip.hasChildNodes() ? intentTip.firstChild.nodeValue : '';
            template.feedback.values.push({ type: 'Feedback', value: `"${value}"` });
        }
        templates[template.name] = template;
    }
};

const readTasksIntentTips = function (agent, templates) {
    const tasks = agent.getElementsByTagName('Task');
    for (let i=0; i<tasks.length; i++) {
        const task = tasks.item(i);
        readPerTaskIntentTips(task, templates);
    }
};

const createBuiltInTaskTips = function (templates) {
    const value = Object.keys(templates)
        .map((name) => { return `[${name}]`; })
        .join(', ');
    const template = {
        type: 'SimpleResponseTemplate',
        name: 'builtin.tasktips',
        feedback: { type: 'Feedback', value: value }
    };
    templates[template.name] = template;
};

const readIntentTips = function (agent) {
    const templates = {};
    readTasksIntentTips(agent, templates);
    createBuiltInTaskTips(templates);
    return templates;
};

module.exports = {
    readIntentTips: readIntentTips
};
