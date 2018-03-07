const manifest = require('../api/manifest');
const {OperationCommandMap} = require('../enums/operationCommandMap');

function getServiceManifestFromArguments(args) {
    const [methodAlias, entity, subEntity] = args._ || [];
    const {'--': params} = args;
    const category = getCategoryFromArguments(args);
    const manifestEntry = (category || {})[(entity || category)];
    if (!manifestEntry) {
        return null;
    }
    // Build a fragment from the arguments passed in
    let operationKeyFragment = OperationCommandMap[methodAlias] || methodAlias;
    if (subEntity) {
        operationKeyFragment += `:${subEntity}`;
    }
    // Find all operation keys that contain the fragment
    const operationDetails = Object.keys(manifestEntry.operations).filter(key => key.includes(operationKeyFragment));
    let operationKey;
    if (operationDetails.length > 1) {
        // Most of the time, the operationDetails array will
        // contain just a single element. If it doesn't,
        // we need a heuristic to identify the correct operation
        // That matches the operation by the number of params that
        // are passed in.
        operationKey = operationDetails.find(detail => (manifestEntry.operations[detail].params || []).length === params.length);
    } else {
        operationKey = operationDetails[0];
    }
    const operation = manifestEntry.operations[operationKey];
    const payload = {
        entityType: manifestEntry.entityName,
        identifier: manifestEntry.className,
        identifierPath: category,
        operation,
    };

    if (!operation) {
        payload.closestMatches = operationDetails; // used to produce error details.
    }
    return payload;
}

function getCategoryFromArguments(args) {
    const [category] = args._ || [];
    return manifest[category];
}

module.exports = {
    getServiceManifestFromArguments,
    getCategoryFromArguments
};