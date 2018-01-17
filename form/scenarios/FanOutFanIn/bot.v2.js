function recognize(entityName, activity, conversationContext) {
    var matchValues = activity.text.match(/^\d+$/);
    if (matchValues !== null) {
        conversationContext.local[entityName] = matchValues[0];
        return true;
    }
    else {
        return false;
    }
}

function recognize_x(conversationCore) {
    var activity = conversationCore.request;
    return recognize('x', conversationCore.request, conversationCore);
}

function recognize_a(conversationCore) {
    return recognize('a', conversationCore.request, conversationCore);
}

function recognize_b(conversationCore) {
    return recognize('b', conversationCore.request, conversationCore);
}

function recognize_c(conversationCore) {
    return recognize('c', conversationCore.request, conversationCore);
}

function decision1(conversationContext) {
    var x = Number(conversationContext.local.x);
    if (x < 10) {
        return 'left';
    }
    else {
        return 'right';
    }
}

function decision2(conversationContext) {
    var b = Number(conversationContext.local.b);
    if (b < 10) {
        return 'left';
    }
    else {
        return 'right';
    }
}

module.exports = {
    recognize : recognize,
    recognize_a : recognize_a,
    recognize_b : recognize_b,
    recognize_c : recognize_c,
    recognize_x : recognize_x,
    decision1 : decision1,
    decision2 : decision2
};