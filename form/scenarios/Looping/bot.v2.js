module.exports.decision = function decision(context) {
    var entity =  context.local.entity[0];
    if (entity > 10) {
        return 'break';
    }
    else {
        delete context.local.entity;
        return 'continue';
    }
}

module.exports.hi = function hi(context) {
    return context.request.text === 'hi';
}

module.exports.entity = function entity(context) {
    context.local.entity = context.local.entity || [];
    context.local.entity.push( context.request.text);
    return true;
}
