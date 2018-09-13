let assert = require('assert');
let bf = require('../lib');
let fs = require('fs');
let path = require('path');
let txtfile = require('read-text-file');


describe("Service Tests", () => {
    it("Luis.getEndpoint() returns correct url for region", async () => {
        let luis = new bf.LuisService({ region: "westus" });
        assert.equal(luis.getEndpoint(),  `https://westus.api.cognitive.microsoft.com/luis/v2.0/`);
    });
});

