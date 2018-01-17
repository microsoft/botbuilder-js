module.exports.func =  function func(context) {
    if (context.local.a === '0') {
        return 'yes';
    }
    else if (context.local.a === '1') {
        return 'no';
    }
}

module.exports.hi = function (context) {
    return context.request.text === 'hi';
}

module.exports.entity_a = function entity_a(context) {
    context.local.a = context.request.text;
    return true;
}
