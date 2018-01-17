// Copyright (c) Microsoft Corporation. All rights reserved.

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const testLoad = require('./testLoad.js');
const testCreate = require('./testCreate.js');
const lg = require('../index.js');

//chai.Assertion.includeStack = true;
const assert = chai.assert;
const expect = chai.expect;
chai.use(chaiAsPromised);
chai.should();

describe('No Network', () => {

    describe('Intent Tips', () => {

        describe('builtin.tasktips', () => {
            const templates = testLoad.intentTips('IntentTipTask.xml');
            const feedback = testCreate.feedback('[builtin.tasktips]');
            const result = lg.languageGeneration(templates, undefined, feedback, {});
            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').be.oneOf([
                    '"type "1" to enter task 1", "type "2" to enter task 2"',
                    '"type "1" to enter task 1", "typing "2" will get you into task 2"',
                    '"type "1" to enter task 1", "for task 2 type "2""']);
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').be.oneOf([
                    '"type "1" to enter task 1", "type "2" to enter task 2"',
                    '"type "1" to enter task 1", "typing "2" will get you into task 2"',
                    '"type "1" to enter task 1", "for task 2 type "2""']);
            });
        });

        describe('multiple IntentTips in combination', () => {
            const templates = testLoad.intentTips('MultipleIntentTipTask.xml');
            const feedback = testCreate.feedback('[builtin.tasktips]');
            const result = lg.languageGeneration(templates, undefined, feedback, {});
            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').be.oneOf([
                    '"intenttip 1.1", "intenttip 2.1"',
                    '"intenttip 1.1", "intenttip 2.2"',
                    '"intenttip 1.2", "intenttip 2.1"',
                    '"intenttip 1.2", "intenttip 2.2"']);
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').be.oneOf([
                    '"intenttip 1.1", "intenttip 2.1"',
                    '"intenttip 1.1", "intenttip 2.2"',
                    '"intenttip 1.2", "intenttip 2.1"',
                    '"intenttip 1.2", "intenttip 2.2"']);
            });
        });

        describe('builtin.tasktips when there are no IntentTips', () => {
            const templates = testLoad.intentTips('EmptyIntentTipTask.xml');
            const feedback = testCreate.feedback('[builtin.tasktips]');
            const result = lg.languageGeneration(templates, undefined, feedback, {});
            it('should have text and speak properties', () => {
                return result.should.eventually.include.all.keys('text', 'speak');
            });
            it('should have text', () => {
                return result.should.eventually.have.property('text').equal('');
            });
            it('should have speak', () => {
                return result.should.eventually.have.property('speak').equal('');
            });
        });
    });
});
