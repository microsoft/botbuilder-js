const manifest = require('../api/manifest');

module.exports = function getServiceManifestFromArguments(args) {
    const argKeys = Object.keys(args || {});

    for (let i = 0; i < argKeys.length; i++) {
        const serviceName = argKeys[i];
        const manifestEntry = manifest[serviceName];
        const operationName = args[serviceName];
        if (manifestEntry) {
            const operationDetail = manifestEntry.operations.find(operation => operation.name === operationName);
            return Object.assign({serviceName, operationDetail}, manifestEntry);
        }
    }
};
