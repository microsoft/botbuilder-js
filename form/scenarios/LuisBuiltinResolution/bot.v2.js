module.exports.func = function (context) {
    if (context.local['@current']['builtin.datetime.date'] && context.local['@current']['builtin.datetime.date'][0][0].resolution) {
        context.responses.push({
            text: 'date resolution is present'
        });
    }
    if (context.local['@current']['builtin.datetime.time'] && context.local['@current']['builtin.datetime.time'][0][0].resolution) {
        context.responses.push({
            text: 'time resolution is present'
        });
    }
}