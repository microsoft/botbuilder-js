const OperationCommandMap = {
    g: 'get',
    get: 'get',

    l: 'list',
    list: 'list',

    c: 'post',
    create: 'post',

    p: 'patch',
    patch: 'patch',

    u: 'put',
    update: 'put',

    d: 'delete',
    'delete': 'delete'
};
Object.freeze(OperationCommandMap);
module.exports = {OperationCommandMap};
