const OperationCommandMap = {
    g: 'get',
    get: 'get',

    l: 'list',
    list: 'list',

    c: 'create',
    create: 'create',
    post: 'create',

    p: 'patch',
    patch: 'patch',

    u: 'update',
    update: 'update',
    put: 'update',

    d: 'delete',
    'delete': 'delete'
};
Object.freeze(OperationCommandMap);
module.exports = {OperationCommandMap};
