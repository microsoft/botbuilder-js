const manifest = require('../api/luis');
const { OperationCommandMap } = require('../enums/operationCommandMap');

function getServiceManifest(args, includeAllOperations) {
    if (args._.length < 2)
        return null; //bail show help
    let verb = args._[0];
    let target = args._[1];
    let arguments = (args._.length > 2) ? args._.slice(2) : [];

    let payload = getOperation(verb, target);

    // if (includeAllOperations) {
    //     payload.operations = operations;
    // }

    // if (!operation) {
    //     payload.closestMatches = operationCandidates || operations; // used to produce error details.
    // }
    return payload;
}


function getOperation(verb, target ) {
    let operation;
    let apiGroups = ['apps', 'examples', 'features', 'models', 'permissions', 'train', 'user', 'versions']
    for (let iGroup in apiGroups) {
        let apiGroupName = apiGroups[iGroup];
        const apiGroup = getCategoryManifest(apiGroupName);

        for (let iCategory in apiGroup) {
            let category = apiGroup[iCategory];

            for (let iOperation in category.operations) {
                let operation = category.operations[iOperation];
                
                if ((operation.methodAlias == verb) && 
                    (operation.target.indexOf(target.toLowerCase()) >=0 ))
                    {
                        const {operations, entityType, className: identifier, category: identifierPath} = category;
                        const payload = {
                            key: (category || apiGroup),
                            entityType,
                            identifier,
                            identifierPath,
                            operation,
                        };
                        return payload;
                    }
            }
        }
    }
    return null;
}

function getNamedArgsMap(args) {
    const thisArgs = args._ || [];
    // The methodAlias can be anywhere since its an
    // enum and easy to find. If we find it out of
    // position, place it back into position 1
    const methodAliasIndex = thisArgs.findIndex(arg => OperationCommandMap[arg]);
    // also The method alias may be missing when
    // help is used on an api group or target
    if (methodAliasIndex === -1 && thisArgs[1] !== '') {
        thisArgs.splice(1, 0, '');
    } else if (methodAliasIndex !== 1 && methodAliasIndex !== -1) {
        const methodAlias = thisArgs.splice(methodAliasIndex, 1)[0];
        thisArgs.splice(1, 0, methodAlias);
    }
    let [verb, target] = thisArgs;
    return { verb, target };
}

function getCategoryManifest(apiGroup) {
    return manifest[apiGroup];
}

module.exports = {
    getNamedArgsMap,
    getServiceManifest,
    getCategoryManifest
};