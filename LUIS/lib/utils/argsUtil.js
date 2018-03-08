const manifest = require('../api/manifest');
const {OperationCommandMap} = require('../enums/operationCommandMap');

function getServiceManifest(args, includeAllOperations) {
    const thisArgs = args._ || [];
    // The method alias will be missing when
    // help is used on an api group or target
    if (!OperationCommandMap[thisArgs[1]]) {
        thisArgs.splice(1, 0, '');
    }
    let [apiGroup, methodAlias, target, subTarget] = thisArgs;
    methodAlias = OperationCommandMap[methodAlias];
    const {'--': params} = args;
    const category = getCategoryManifest(args);
    const manifestEntry = (category || {})[(target || apiGroup)];

    // Bail - shows help contents
    if (!manifestEntry) {
        return null;
    }

    const {operations, entityType, className: identifier, category: identifierPath} = manifestEntry;
    // Find all operations keys that contain matches.
    const operationCandidates = operations.slice()
        .filter(operation => operation.methodAlias === methodAlias && operation.subTarget === subTarget);

    let operation;
    if (operationCandidates.length > 1) {
        // Most of the time, the operationCandidates array will
        // contain just a single element. If it doesn't,
        // we need a heuristic to identify the correct operation
        // That matches the operation by the number of params that
        // are passed in.
        operation = operationCandidates.find(detail => (detail.params || []).length === params.length);
    } else {
        operation = operationCandidates[0];
    }

    const payload = {
        key: (target || apiGroup),
        entityType,
        identifier,
        identifierPath,
        operation,
    };

    if (includeAllOperations) {
        payload.operations = operations;
    }

    if (!operation) {
        payload.closestMatches = operationCandidates || operations; // used to produce error details.
    }
    return payload;
}

function getCategoryName(args) {
    return args._[0] || null;
}

function getCategoryManifest(args) {
    const category = getCategoryName(args);
    return manifest[category];
}

module.exports = {
    getCategoryName,
    getServiceManifest,
    getCategoryManifest
};