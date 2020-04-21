/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import * as path from 'path';
import { TestRunner } from './testing';

describe('RegexRecognizerTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  '../resources/RegexRecognizerTests'));

    it('Entities', async () => {
        await testRunner.runTestScript('RegexRecognizerTests_Entities');
    });
});
