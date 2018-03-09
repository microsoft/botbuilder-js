const {ServiceBase} = require('./api/serviceBase');
const api = require('./api');
const dataModels = require('./api/dataModels');

/**
 * Entry into the program flow from the CLI
 *
 * This function orchestrates the instantiation
 * of the service containing the operation to call.
 * If a body is specified, the typed data model is
 * crated and the source object containing the properties
 * is passed in. This is necessary to guarantee the
 * endpoint receives a clean data model.
 *
 * @param {*} config The .luisrc file containing the configuration options
 * @param {*} serviceManifest The manifest entry containing the details of the service to invoke.
 * @param {*} args The arguments to use as the params for the request
 * @param {*} requestBody The request body to send to the endpoint
 *
 * @returns {Promise<*|Promise|{enumerable}|void|JSON|Promise<any>>}
 */
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
    // Allow untyped request bodies to seep through unchanged
    if (requestBody && operation.entityType) {
        requestBodyDataModel = dataModels[operation.entityType].fromJSON(requestBody);
    }
    // Create the target service and kick off the request.
    const service = new api[identifierPath][identifier]();
    // Shorthand argument syntax mapping (not documented in help)
    const mappedParams = Object.assign(mapParams(operation, args['--']), args);
    const response = await service[operation.name](mappedParams, (requestBodyDataModel || requestBody));

    return response.json();
};

/**
 * Maps indexed parameters to named parameters when
 * the shorthand "--" switch is used in the command.
 * e.g. for the command: luis apps list -- 1 5
 * the "--" array will be [1, 5] which maps to {skip: 1, take: 5}
 *
 * @param operation The operation from the manifest that contains a named list of params
 * @param params An array of params supplied after the -- in the command.
 */
function mapParams(operation, params) {
    return operation.params.reduce((map, param, index) => (map[param.name] = params[index], map), {});
}
