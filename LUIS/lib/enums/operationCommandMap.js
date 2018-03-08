const OperationCommandMap = {
    g: 'get',
    get: 'get',

    l: 'list',
    list: 'list',

    c: 'create',
    create: 'create',

    p: 'patch',
    patch: 'patch',

    u: 'update',
    update: 'update',

    d: 'delete',
    'delete': 'delete'
};
Object.freeze(OperationCommandMap);
module.exports = {OperationCommandMap};
