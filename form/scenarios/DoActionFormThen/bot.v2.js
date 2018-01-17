
const recognizeFunc = function (context) {
    return context.request.text === 'hi';
};

const addOrUpdateRecognizer = function (context) {

    const text = context.request.text.toLowerCase();

    if (text.includes('number')) {
        const tokens = text.split(' ');
        const entity = tokens[1];

        if (Number(entity) % 2 === 0) {
            context.local.even = entity;
        }
        else {
            context.local.odd = entity;
        }
        return true;
    }
     return false;
};

const func = function (context) {
    context.global.sum = (Number(context.local.odd) + Number(context.local.even)).toString();
};

module.exports = {
    recognizeFunc: recognizeFunc,
    addOrUpdateRecognizer: addOrUpdateRecognizer,
    func: func
};
