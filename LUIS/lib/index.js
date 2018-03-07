const {ServiceBase} = require('./api/serviceBase');
const api = require('./api');
const dataModels = require('./api/dataModels');

module.exports = async function luis(config, serviceManifest, args, requestBody) {
    Object.defineProperty(ServiceBase.prototype, 'config', {
        value: config, writable: false, configurable: false
    });
    const {entityType, identifier, identifierPath, operation} = serviceManifest;
    let requestBodyDataModel;
    if (requestBody) {
        requestBodyDataModel = dataModels[entityType].fromJSON(requestBody);
    }
    const service = new api[identifierPath][identifier]();
    const mappedParams = Object.assign(mapParams(operation, args['--']), args);
    const response = await service[operation.name](mappedParams, (requestBodyDataModel || requestBody));
    return response.json();
};

function mapParams(operation, params) {
    return operation.params.reduce((map, param, index) => (map[param.name] = params[index], map), {});
}
