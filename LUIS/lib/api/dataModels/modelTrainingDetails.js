/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class ModelTrainingDetails {
    
    /**
    * @property {integer} statusId
    */

    /**
    * @property {undefined} status
    */

    /**
    * @property {integer} exampleCount
    */

    /**
    * @property {string} trainingDateTime
    */

    /**
    * @property {string} failureReason
    */

    
    constructor({statusId /* integer */,status /* undefined */,exampleCount /* integer */,trainingDateTime /* string */,failureReason /* string */} = {}) {
        Object.assign(this, {statusId /* integer */,status /* undefined */,exampleCount /* integer */,trainingDateTime /* string */,failureReason /* string */});
    }
}
ModelTrainingDetails.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ModelTrainingDetails.fromJSON);
    }
    
    const {statusId /* integer */,status /* undefined */,exampleCount /* integer */,trainingDateTime /* string */,failureReason /* string */} = source;
    return new ModelTrainingDetails({statusId /* integer */,status /* undefined */,exampleCount /* integer */,trainingDateTime /* string */,failureReason /* string */});
};

module.exports = ModelTrainingDetails;
