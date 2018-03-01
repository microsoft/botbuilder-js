const {ServiceBase} = require('./serviceBase');

class Settings extends ServiceBase {
    constructor() {
        super('/apps/{appId}/settings');
    }

    /**
     * Updates the application settings
     */
    async updateApplicationSettings(applicationSettingUpdateObject/* ApplicationSettingUpdateObject */) {
        return this.createRequest('put', [], applicationSettingUpdateObject);
    }

    /**
     * Get the application settings
     */
    async getApplicationSettings() {
        return this.createRequest('get', []);
    }

}

module.exports = {Settings};
