function increment(context, type) {
    context.global[type] = context.global[type] || 0;
    context.global[type]++;
    return context.global[type].toString();
}

function decision1(context) {
    var one = increment(context, 'one');
    if (one >= 9) {
        return 'Maybe';
    }
    else if ((one % 3) !== 0) {
        return 'No';
    }
    else {
        return 'Yes';
    }
}

function decision2(context) {
    var two = increment(context, 'two');

    if ((two % 2) !== 0) {
        return 'No';
    }
    else {
        return 'Yes';
    }
}

function hi(context) {
    return context.request.text === 'hi';
}

module.exports = {
    increment: increment,
    decision1: decision1,
    decision2: decision2,
    hi: hi
}