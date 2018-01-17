// Copyright (c) Microsoft Corporation. All rights reserved.

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const lg = require('../index.js');

//chai.Assertion.includeStack = true;
const assert = chai.assert;
const expect = chai.expect;
chai.use(chaiAsPromised);
chai.should();

describe('No Network', () => {
  
    describe('Resolve Entities', () => {

        describe('Echo', () => {
            it('should echo the string given', () => {
                expect(lg.resolveEntities('hello world')).to.equal('hello world');
            });
        });

        describe('Empty', () => {
            it('should return empty', () => {
                expect(lg.resolveEntities('')).to.equal('');
            });
        });

        describe('With Entities', () => {
            it('should subtitute a single entity', () => {
                expect(lg.resolveEntities('{x}', { x: 'hello' })).to.equal('hello');
            });
            it('should subtitute multiple entities', () => {
                expect(lg.resolveEntities('{x}{y}{z}', { x: 'hello', y: ' ', z: 'world' })).to.equal('hello world');
            });
            it('should combine text with entities', () => {
                expect(lg.resolveEntities('hello {x}', { x: 'world' })).to.equal('hello world');
            });
        });

        describe('Some Negative Scenarios', () => {

            const test_lookup = (name, entities) => { 
                switch (name) {
                    case 'x':
                    case 'y': 
                    case 'z':
                        return undefined;
                }
                return '42';
            };

            it('entity missing - default behavior', () => {
                // the default entity lookup returns '' for a missing entity 
                expect(lg.resolveEntities('hello{x}', {})).to.equal('hello');
            });
            it('entity missing - using test lookup', () => {
                expect(() => { lg.resolveEntities('hello{x}', {}, test_lookup); }).to.throw('The referenced Entities "x" could not be found.');
            });
            it('multiple entities missing - using test lookup', () => {
                expect(() => { lg.resolveEntities('{x} {y} {a}', {}, test_lookup); }).to.throw('The referenced Entities "x","y" could not be found.');
            });
        });
    });
});

