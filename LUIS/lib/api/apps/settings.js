const {ServiceBase} = require('../serviceBase');

class Settings extends ServiceBase {
    constructor() {
        super('/apps/{appId}/settings');
    }

    /**
     * Updates the application settings
     */
    async updateApplicationSettings(params, applicationSettingUpdateObject/* ApplicationSettingUpdateObject */) {
        return this.createRequest('', params, 'put', applicationSettingUpdateObject);
    }

    /**
     * Get the application settings
     */
    async getApplicationSettings(params) {
        return this.createRequest('', params, 'get');
    }
}

module.exports = Settings;
