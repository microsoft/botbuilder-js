const duration = 'builtin.datetimeV2.duration';

module.exports.func = function (context) {
    if (Array.isArray(context.local[duration])) {
        context.local[duration].forEach(function (obj) {
            context.responses.push({ text: obj });
        });
    }
    else {
        context.responses.push({ text : context.local[duration]});
    }
};
