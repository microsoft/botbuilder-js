/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import { TestRunner } from './testing';

describe('RegexRecognizerTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner('resources/RegexRecognizerTests');

    it('Entities', async () => {
        await testRunner.runTestScript('RegexRecognizerTests_Entities');
    });
});
