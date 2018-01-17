function a2x(context) {
    var a = context.local.a;
    context.global.context_x = [{ value : a }];
}

function b2y(context) {
    var b = context.local.b;
    context.global.context_y = [{ value : b }];
}

function contextEntities2entities(context) {
    context.local.x = context.global.context_x.map(entity => { return entity.value;});
    context.local.y = context.global.context_y.map(entity => { return entity.value;});
}

function recognize_1(context) {
    return context.request.text === '1';
}

function recognize_2(context) {
    return context.request.text === '2';
}

function recognize_3(context) {
    return context.request.text === '3';
}

function entity_a(context) {
    context.local.a  = context.request.text;
    return true;
}

function entity_b(context) {
    context.local.b  = context.request.text;
    return true;
}

module.exports = {
    a2x: a2x,
    b2y: b2y,
    contextEntities2entities: contextEntities2entities,
    recognize_1: recognize_1,
    recognize_2: recognize_2,
    recognize_3: recognize_3,
    entity_a: entity_a,
    entity_b: entity_b
}