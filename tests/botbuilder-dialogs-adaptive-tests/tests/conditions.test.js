"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const testRunner_1 = require("./testRunner");
describe('Conditions', () => {
    const testRunner = new testRunner_1.TestRunner('resources/conditionsTests');
    it('OnIntent', async () => {
        await testRunner.runTestScript('OnIntent');
    });
    it('OnIntent with entities', async () => {
        await testRunner.runTestScript('OnIntentWithEntities');
    });
    it('OnActivityTypes', async () => {
        await testRunner.runTestScript('OnActivityTypes');
    });
});
//# sourceMappingURL=conditions.test.js.map