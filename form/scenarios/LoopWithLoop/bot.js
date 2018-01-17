function increment(conversationContext, type) {
    var entities = conversationContext.contextEntities;
    if (typeof entities[type] === 'undefined') {
        conversationContext.addContextEntity(type, '0');
    }

    var entity = entities[type];
    var valueOld = Number(entity[0].value);
    var valueNew = valueOld + 1;
    entity[0].value = String(valueNew);
    return valueNew;
}

export function decision1(conversationContext) {
    var one = increment(conversationContext, 'one');

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

export function decision2(conversationContext) {
    var two = increment(conversationContext, 'two');

    if ((two % 2) !== 0) {
        return 'No';
    }
    else {
        return 'Yes';
    }
}

export function hi(conversationContext) {
    return conversationContext.request.text === 'hi';
}
