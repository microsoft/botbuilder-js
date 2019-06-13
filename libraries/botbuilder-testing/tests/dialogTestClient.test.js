const { DialogTestClient } = require('../');
const assert = require('assert');


describe('DialogTestClient', function() {

    it('should create a DialogTestClient', async function() {
        let client = new DialogTestClient();
        assert(client instanceof DialogTestClient, 'Created an invalid object');
    });

});