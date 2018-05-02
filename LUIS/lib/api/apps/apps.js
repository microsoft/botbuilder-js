const {ServiceBase} = require('../serviceBase');
class Apps extends ServiceBase {
    constructor() {
        super('/apps/');
    }

    /**
    * Lists all of the user applications.
    */
    List(params) {
        return this.createRequest('/', params, 'get');
    }
    /**
    * Creates a new LUIS app.
    */
    Add(params , applicationCreateObject/* ApplicationCreateObject */) {
        return this.createRequest('/', params, 'post', applicationCreateObject);
    }
    /**
    * Deletes an application.
    */
    Delete(params) {
        return this.createRequest('/{appId}', params, 'delete');
    }
    /**
    * Updates the name or description of the application.
    */
    Update(params , applicationUpdateObject/* ApplicationUpdateObject */) {
        return this.createRequest('/{appId}', params, 'put', applicationUpdateObject);
    }
    /**
    * Gets the application info.
    */
    Get(params) {
        return this.createRequest('/{appId}', params, 'get');
    }
}
module.exports = Apps;
