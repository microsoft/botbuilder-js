
const recognizeFunc = function (context) {
    return context.request.text === 'hi';
};

const addOrUpdateRecognizer = function (context) {

    const text = context.request.text.toLowerCase();

    if (text.includes('add')) {
        const tokens = text.split(' ');
        const entity = tokens[1];
        if (['white-bread', 'wheat-bread', 'sourdough-bread'].includes(entity)) {
            context.local.breadType = entity;
        }
        if (['ham', 'tuna', 'chicken', 'beef', 'vegetables'].includes(entity)) {
            context.local.proteinOption = entity;
        }
        if (['small', 'medium', 'large'].includes(entity)) {
            context.local.sandwichSize = entity;
        }
        if (['mustard'].includes(entity)) {
            context.local.mustard = entity;
        }
        if (['pickles'].includes(entity)) {
            context.local.sandwichToppings = entity;
        }
        return true;
    }
     return false;
};

module.exports = {
    recognizeFunc: recognizeFunc,
    addOrUpdateRecognizer: addOrUpdateRecognizer
};
