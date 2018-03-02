const {ServiceBase} = require('./api/serviceBase');
const api = require('./api');

module.exports = async function luis(config) {
    Object.defineProperty(ServiceBase.prototype, 'config', {
        value: config, writable: false, configurable: false
    });
};