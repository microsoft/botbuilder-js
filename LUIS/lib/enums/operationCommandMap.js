const OperationCommandMap = {
    add: 'add',

    get: 'get',

    list: 'list',

    create: 'create',

    clone: 'clone',

    'delete': 'delete',

    import: 'import',

    export: 'export',

    train: 'train',
    
    patch: 'patch',

    update: 'update',

    suggest: 'suggest',

    rename: 'rename'
    
};
Object.freeze(OperationCommandMap);
module.exports = { OperationCommandMap };
