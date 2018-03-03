const {ServiceBase} = require('./api/serviceBase');
const api = require('./api');
const models = require('./api/models');

module.exports = async function luis(config, serviceManifest, params, requestBody) {
    Object.defineProperty(ServiceBase.prototype, 'config', {
        value: config, writable: false, configurable: false
    });
    const {entityType, className, operationDetail} = serviceManifest;
    let requestBodyDataModel;
    if (requestBody) {
        requestBodyDataModel = models[entityType].fromJSON(requestBody);
    }
    const service = new api[className]();
    const response = await service[operationDetail.name](params, (requestBodyDataModel || requestBody));
    return response.json();
};
