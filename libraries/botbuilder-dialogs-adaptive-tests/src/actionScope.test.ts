/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import * as path from 'path';
import { TestRunner } from './testing';

describe('ActionScopeTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  '../resources/ActionScopeTests'));

    it('Break', async () => {
        await testRunner.runTestScript('ActionScope_Break');
    });

    it('Continue', async () => {
        await testRunner.runTestScript('ActionScope_Continue');
    });

    it('Goto_Nowhere', async () => {
        await testRunner.runTestScript('ActionScope_Goto_Nowhere');
    });

    it('Goto_OnIntent', async () => {
        await testRunner.runTestScript('ActionScope_Goto_OnIntent');
    });

    it('Goto_Parent', async () => {
        await testRunner.runTestScript('ActionScope_Goto_Parent');
    });

    it('Goto_Switch', async () => {
        await testRunner.runTestScript('ActionScope_Goto_Switch');
    });

    it('Goto', async () => {
        await testRunner.runTestScript('ActionScope_Goto');
    });
});