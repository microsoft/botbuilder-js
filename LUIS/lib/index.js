const {ServiceBase} = require('./api/serviceBase');
const api = require('./api');
const dataModels = require('./api/dataModels');

module.exports = async function luis(config, serviceManifest, args, requestBody) {
    // Provide the config in the prototype to prevent
    // all ServiceBase subclasses from having to pass
    // in in as an argument to the constructor.
    Object.defineProperty(ServiceBase.prototype, 'config', {
        value: config, writable: false, configurable: false
    });
    // If a request body is specified and a typed data model
    // is available, create it and pass the source in.
    // This guarantees the endpoint will get only the
    // properties it expects since the user can specify
    // any json file with any number of properties that
    // may or may not be valid.
    const {identifier, identifierPath, operation} = serviceManifest;
    let requestBodyDataModel;
    if (requestBody) {
        requestBodyDataModel = dataModels[operation.entityType].fromJSON(requestBody);
    }
    // Create the target service and kick off the request.
    const service = new api[identifierPath][identifier]();
    const mappedParams = Object.assign(mapParams(operation, args['--']), args);
    const response = await service[operation.name](mappedParams, (requestBodyDataModel || requestBody));
    return response.json();
};

/**
 * Maps indexed parameters to named parameters when
 * the shorthand "--" switch is used in the command.
 * e.g. for the command: luis apps list -- 1 5
 * the -- array will be [1, 5] which maps {skip: 1, take: 5}
 *
 * @param operation The operation from the manifest that contains a named list of params
 * @param params An array of params supplied after the -- in the command.
 */
function mapParams(operation, params) {
    return operation.params.reduce((map, param, index) => (map[param.name] = params[index], map), {});
}
