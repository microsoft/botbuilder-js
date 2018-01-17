// Copyright (c) Microsoft Corporation. All rights reserved.

var _readFeedback = function (feedbackBase) {
    const feedback = { type: 'Feedback' };
    if (feedbackBase.hasChildNodes()) {
        feedback.value = feedbackBase.firstChild.nodeValue;    
    }
    else {
        feedback.value = '';
    }
    return feedback;
};

var readFeedbackOneOf = function (feedbackBase) {
    return {
        type: 'FeedbackOneOf',
        values: readFeedbackBaseCollection(feedbackBase, false)
    };
};

var readFeedbackPerModality = function (feedbackBase) {
    const getSingleChildElement = function (node, name) {
        var childNodes = node.getElementsByTagName(name);
        if (childNodes.length === 1 && childNodes.item(0).firstChild !== undefined) {
            return childNodes.item(0).firstChild.nodeValue;
        }
        else {
            return undefined;
        }
    };
    const feedbackPerModality = { type: 'FeedbackPerModality' };
    const text = getSingleChildElement(feedbackBase, 'Display');
    if (text !== undefined) {
        feedbackPerModality.text = text;
    }
    const speak = getSingleChildElement(feedbackBase, 'Speak');
    if (speak !== undefined) {
        feedbackPerModality.speak = speak;
    }
    return feedbackPerModality;
};

var readFeedbackBase = function (feedbackBase, allowFeedbackOneOf) {
    switch (feedbackBase.tagName) {
        case 'Feedback':
            return _readFeedback(feedbackBase);
        case 'FeedbackOneOf':
            if (allowFeedbackOneOf) {
                return readFeedbackOneOf(feedbackBase);
            }
            else {
                throw new Error('unexpected element FeedbackOneOf');
            }
        case 'FeedbackPerModality':
            return readFeedbackPerModality(feedbackBase);
        default:
            return undefined;
    }
};

var readFeedbackBaseCollection = function (node, allowFeedbackOneOf) {
    const result = [];
    for (let i=0; i<node.childNodes.length; i++) {
        const childNode = node.childNodes.item(i);
        if (childNode.nodeType === 1) {
            const feedback = readFeedbackBase(childNode, allowFeedbackOneOf);
            if (feedback) {
                const forTurn = childNode.getAttributeNode('forTurn');
                if (forTurn) {
                    const value = parseInt(forTurn.value);
                    feedback.forTurn = isNaN(value) ? 0 : value;
                }
                const adaptiveCardSrc = childNode.getAttributeNode('adaptiveCardSrc');
                if (adaptiveCardSrc) {
                    feedback.adaptiveCard = adaptiveCardSrc.value;
                }
                result.push(feedback);
            }
        }
    }
    result.sort((a, b) => { 
        if (a.forTurn === undefined || b.forTurn === undefined) {
            return 0;
        }
        return a.forTurn - b.forTurn;
    });
    return result;
};

const readFeedback = function (node) {
    const feedbackBaseCollection = readFeedbackBaseCollection(node, true);
    if (feedbackBaseCollection.length === 0) {
        return undefined;
    }
    if (feedbackBaseCollection.length > 1) {
        throw new Error('expected a single child element of Feedback, FeedbackOneOf or FeedbackModality');
    }
    return feedbackBaseCollection[0];
};

module.exports = {
    readFeedback: readFeedback,
    readFeedbackBaseCollection: readFeedbackBaseCollection
};

