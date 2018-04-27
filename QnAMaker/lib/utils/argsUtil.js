const manifest = require('../api/qnamaker');
const cc = require('camelcase');

function getServiceManifest(args) {
    if (args._.length < 1)
        return null; //bail show help
    let verb = args._[0];
    let target = (args._.length >= 2) ? args._[1] : undefined;
    let arguments = (args._.length > 2) ? args._.slice(2) : [];

    let payload = getOperation(verb, target);
    return payload;
}


function getOperation(verb, target) {
    let operation;
    for (let apiGroupName in manifest) {
        let apiGroup = manifest[apiGroupName];
        for (let iOperation in apiGroup.operations) {
            let operation = apiGroup.operations[iOperation];

            if ((operation.methodAlias == verb) &&
                ((operation.target.length == 0 && !target) ||
                    (target && operation.target.indexOf(target.toLowerCase()) >= 0))) {
                return Object.assign({
                    operation: operation,
                    identifier: cc(apiGroup.className),
                }, apiGroup);
            }
        }
    }
    return null;
}


module.exports = {
    getServiceManifest,
    getOperation
};