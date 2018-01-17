const lgEvaluate = require('./lgEvaluate.js');

const processCard = function (card, context, accessor) {
    if (card === undefined || card.content === undefined) {
        return Promise.resolve();
    }
    return processCardItem(0, card, context, accessor);
};

const processCardItem = function (i, cardItem, context, accessor) {
    var keys = Object.keys(cardItem);
    var key = keys[i];
    var toProcess = cardItem[key];

    if (toProcess == undefined) {
        return Promise.resolve();
    }

    switch (typeof toProcess) {
        case 'string':
            return processWithLG(toProcess, context, accessor).then((rsp) => {
                cardItem[key] = rsp;
                // recurse to the next item
                return processCardItem(i + 1, cardItem, context, accessor);
            });
        case 'object':
        // recurse into the new object
            return processCardItem(0, toProcess, context, accessor).then(() => {
                return processCardItem(i + 1, cardItem, context, accessor);
            });
        default:
            return processCardItem(i + 1, cardItem, context, accessor);
    }
};

const processWithLG = function (text, context, accessor) {
    return Promise.resolve(lgEvaluate.resolveEntities(text, context, accessor));
};

module.exports = {
    // todo: make own module / part of agent parser
    processCard: processCard
};
