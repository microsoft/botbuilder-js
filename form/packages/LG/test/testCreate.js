// Copyright (c) Microsoft Corporation. All rights reserved.

// Various data creation functions for creating parameterized objects for testing 

// feedback related

const feedback = function (text) {
    return { type: 'Feedback', value: text };  
};

const feedbackOneOf = function () {
    const args = [];
    for(let name in arguments) {
        const value = arguments[name];
        if (typeof value === 'object') {
            args.push(feedbackPerModality(value.text, value.speak));
        }
        else {
            args.push(feedback(value));
        }
    }
    return { 
        type: 'FeedbackOneOf', values: args };
};

const feedbackPerModality = function (text, speak) {
    return { type: 'FeedbackPerModality', text: text, speak: speak }; 
};

const response = function (text, speak) {
    return { text: text, speak: (speak !== undefined) ? speak : text };
};

module.exports = {
    feedback: feedback,
    feedbackOneOf: feedbackOneOf,
    feedbackPerModality: feedbackPerModality,
    response: response
};
