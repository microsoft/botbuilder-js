const assert = require('assert');
const luisClient = require('../');

const luisAppId = process.env.LUISAPPID;
const subscriptionKey = process.env.LUISAPPKEY;

describe('GetIntentAndEntities', function() {
    if (!luisAppId) 
    {
        console.warn('WARNING: skipping LuisRecognizer test suite because LUISAPPID environment variable is not defined');
        return;
    }
    if (!subscriptionKey) 
    {
        console.warn('WARNING: skipping LuisRecognizer test suite because LUISAPPKEY environment variable is not defined');
        return;
    }

    this.timeout(10000);
    it('should return intent and entities', function(done) {
        var client = new luisClient();
        client.getIntentsAndEntitiesV2(luisAppId, subscriptionKey, 'hello', { verbose : true })
        .then(res => {
            assert(res);
            assert(res.topScoringIntent);
            assert(res.intents.length > 0);
            done(); 
        });
    });
})