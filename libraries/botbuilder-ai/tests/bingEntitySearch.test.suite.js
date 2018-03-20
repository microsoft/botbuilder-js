const assert = require('assert');
const ai = require('../');
const builder = require('botbuilder');

const subscriptionKey = process.env.BINGENTITYSEARCHKEY;

/*
describe('BingEntitySearch', function () {
    this.timeout(10000);
    if (!subscriptionKey) {
        console.warn('WARNING: skipping BingEntitySearch test suite because BINGENTITYSEARCHKEY environment variable is not defined');
        return;
    }

    var entitySearch = new ai.BingEntitySearch({
        subscriptionKey: subscriptionKey
    });

    // API doesn't seem to resolve nearest starbucks anymore :(
    it('location search', function () {
        return entitySearch.search({ q: 'nearest starbucks', mkt: 'en-us', latitude: 47.61002, longitude: -122.1879, radius: 22 })
            .then(res => {
                assert(res);
                assert(res.places);
                assert(res.places.value[0].address.addressLocality == "Bellevue");
            });
    });

    it('BingEntitySearch-mispelled', function () {
        return entitySearch.search({ q: 'space nedle' })
            .then(res => {
                assert(res);
                assert(res.entities.value[0].name == "Space Needle");
            });
    });


    let spaceNeedle = "**Space Needle**\n\nThe Space Needle is an observation tower in Seattle, Washington, a landmark of the Pacific Northwest, and an icon of Seattle. It was built in the Seattle Center for the 1962 World's Fair, which drew over 2.3 million visitors, when nearly 20,000 people a day used its elevators.\n\nhttp://www.spaceneedle.com/";

})
*/