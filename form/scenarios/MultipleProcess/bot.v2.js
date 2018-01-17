module.exports.Process1_onRun = function (context) {
    context.responses.push({ text: 'process1', type: 'message' });
    context.global.x = 1;
}

module.exports.Process2_onRun = function (context) {
    context.responses.push({ text: 'process2', type: 'message' });
    context.global.x = 2
}

module.exports.Process3_onRun = function (context) {
    context.responses.push({ text: 'process3', type: 'message' });
    context.global.x = 3;
}

module.exports.hi = function (context) {
    return context.request.text === 'hi';
}
