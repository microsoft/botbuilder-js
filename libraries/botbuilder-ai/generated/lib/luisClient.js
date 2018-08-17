/*
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is
 * regenerated.
 */

/* jshint latedef:false */
/* jshint forin:false */
/* jshint noempty:false */

'use strict';

const msRest = require('ms-rest');
const ServiceClient = msRest.ServiceClient;

const models = require('./models');
const operations = require('./operations');


/** Class representing a LuisClient. */
class LuisClient extends ServiceClient {
  /**
   * Create a LuisClient.
   * @param {azureRegions} azureRegion - Supported Azure regions for Cognitive Services endpoints. Possible values include: 'westus', 'westeurope', 'southeastasia', 'eastus2', 'westcentralus', 'westus2', 'eastus', 'southcentralus', 'northeurope', 'eastasia', 'australiaeast', 'brazilsouth'
   * @param {object} [options] - The parameter options
   * @param {Array} [options.filters] - Filters to be added to the request pipeline
   * @param {object} [options.requestOptions] - Options for the underlying request object
   * {@link https://github.com/request/request#requestoptions-callback Options doc}
   * @param {boolean} [options.noRetryPolicy] - If set to true, turn off default retry policy
   */
  constructor(azureRegion, options) {
    if (azureRegion === null || azureRegion === undefined) {
      throw new Error('\'azureRegion\' cannot be null.');
    }

    if (!options) options = {};

    super(null, options);

    this.baseUri = 'https://{AzureRegion}.api.cognitive.microsoft.com/luis/v2.0/apps';
    this.azureRegion = azureRegion;

    let packageInfo = this.getPackageJsonInfo(__dirname);
    this.addUserAgentInfo(`${packageInfo.name}/${packageInfo.version}`);
    this.prediction = new operations.Prediction(this);
    this.models = models;
    msRest.addSerializationMixin(this);
  }

}

module.exports = LuisClient;
module.exports['default'] = LuisClient;
module.exports.LuisClient = LuisClient;
module.exports.LuisModels = models;
