module.exports.decision = function decision(context) {
    var task = context.local;
    var path = task.path[0];
    if (path.length > 0) {
        var next = path[0];
        context.global.next = context.global.next || [];
        context.global.next.push(next);
        task.path[0] = path.substring(1);
        return next;
    }
    else {
        throw new Error();
    }
}

module.exports.hi = function (context) {
    const s = context.request.text;
    context.local.path = context.local.path || [];

    if (s.startsWith('hi')) {
        context.local.path.push(s.substring(3));
        return true;
    }
    return false;
}
