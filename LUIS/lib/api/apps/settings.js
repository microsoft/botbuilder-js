/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Settings extends ServiceBase {
    constructor() {
        super('/apps/{appId}/settings');
    }

    /**
    * Updates the application settings.
    */
    UpdateSettings(params , applicationSettingUpdateObject/* ApplicationSettingUpdateObject */) {
        return this.createRequest('', params, 'put', applicationSettingUpdateObject);
    }
    /**
    * Get the application settings.
    */
    GetSettings(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Settings;
