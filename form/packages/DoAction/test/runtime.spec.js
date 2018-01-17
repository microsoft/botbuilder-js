// Copyright (c) Microsoft Corporation. All rights reserved.

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const DispatcherFactory = require('../index.js').DispatcherFactory;
const evaluate = require('../index.js').evaluate;

//chai.Assertion.includeStack = true;
const assert = chai.assert;
const expect = chai.expect;
chai.use(chaiAsPromised);
chai.should();

describe('No Network', () => {
    describe('If Do', () => {
        describe('DispatcherFactory', () => {
            describe('success', () => {

                const metadata = require('./data/simple.json');

                it('should create a Dispatch Table', () => {
                    
                    // in a functioning dispatch table these strings would be functions
                    const factory = new DispatcherFactory();
                    factory.register('X', (obj, name) => { return `function ${obj.value}`; });
                    factory.register('Y', (obj, name) => { return `function ${obj.value}`; });
        
                    const dispatchTable = factory.makeDispatcher(metadata);

                    // ensure we have an array
                    dispatchTable.should.be.an('array').lengthOf(3);

                    // now lets verify the shape of the first element
                    dispatchTable[0].should.have.all.keys('condition', 'action');
                    dispatchTable[0]['condition'].should.have.all.keys('execute');
                    dispatchTable[0]['action'].should.have.all.keys('name', 'execute');

                    dispatchTable[0]['condition'].should.have.property('execute', 'function 1');
                    dispatchTable[0]['action'].should.have.property('name', 'Entry1');
                    dispatchTable[0]['action'].should.have.property('execute', 'function 2');
                });
            });
            describe('empty', () => {

                it('should create an empty Dispatch Table', () => {
                    
                    const factory = new DispatcherFactory();
                    const dispatchTable = factory.makeDispatcher([]);

                    // ensure we have an empty array
                    dispatchTable.should.be.an('array').lengthOf(0);
                });
            });
            describe('failure due to registration', () => {
                
                const metadata = require('./data/simple.json');

                it('should fail to create a Dispatch Table', () => {
                    const factory = new DispatcherFactory();
                    expect(() => { factory.makeDispatcher(metadata); }).to.throw();
                });
            });
            describe('failure due to metadata missing type', () => {
                
                const metadata = require('./data/missingType.json');

                it('should fail to create a Dispatch Table', () => {
                    const factory = new DispatcherFactory();
                    factory.register('X', (obj, name) => { return `function ${obj.value}`; });
                    factory.register('Y', (obj, name) => { return `function ${obj.value}`; });
                    expect(() => { factory.makeDispatcher(metadata); }).to.throw();
                });
            });
            describe('failure due to metadata missing name', () => {
                
                const metadata = require('./data/missingName.json');

                it('should fail to create a Dispatch Table', () => {
                    const factory = new DispatcherFactory();
                    factory.register('X', (obj, name) => { return `function ${obj.value}`; });
                    factory.register('Y', (obj, name) => { return `function ${obj.value}`; });
                    expect(() => { factory.makeDispatcher(metadata); }).to.throw();
                });
            });
        });
        describe('evaluate', () => {
            describe('success', () => {
                    
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return obj.value === context.value; }; });
                factory.register('Y', (obj, name) => { return (context) => { context.responses.push({ value: obj.value }); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { value: '3', responses: [] };
                const result = evaluate(dispatchTable, context).then(function (result) {
                    context.responses.should.be.an('array').lengthOf(1);
                    context.responses[0].should.have.property('value', '4');
                });

                it('should succeed', () => {
                    return result.should.eventually.be.fulfilled;
                });
            });
            describe('empty', () => {

                const factory = new DispatcherFactory();
                const dispatchTable = factory.makeDispatcher([]);

                const context = {};
                const result = evaluate(dispatchTable, context).then(function (result) {

                    // ensure the context is clear
                    Object.keys(context).should.be.empty;
                    return;
                });
                
                it('should succeed on doing nothing', () => {
                    return result.should.eventually.be.fulfilled;
                });
            });
            describe('sticky', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return obj.value === context.value; }; });
                factory.register('Y', (obj, name) => { return (context) => { context.responses.push({ value: obj.value }); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { sticky: 'Entry1', value: '3', responses: [] };
                const result = evaluate(dispatchTable, context).then(function (result) {
                    context.responses.should.be.an('array').lengthOf(1);
                    context.responses[0].should.have.property('value', '2');
                });

                it('should succeed with the sticky entry executed', () => {
                    return result.should.eventually.be.fulfilled;
                });
            });
            describe('execution pattern', () => {
                
                const metadata = require('./data/pattern.json');

                let countConditionA = 0;
                let countConditionB = 0;
                let countConditionC = 0;
                let countActionA = 0;
                let countActionB = 0;
                let countActionC = 0;

                const factory = new DispatcherFactory();
                factory.register('ConditionA', (obj, name) => { return (context) => { countConditionA++; return false; }; });
                factory.register('ConditionB', (obj, name) => { return (context) => { countConditionB++; return true; }; });
                factory.register('ConditionC', (obj, name) => { return (context) => { countConditionC++; return false; }; });
                factory.register('ActionA', (obj, name) => { return (context) => { countActionA++; }; });
                factory.register('ActionB', (obj, name) => { return (context) => { countActionB++; }; });
                factory.register('ActionC', (obj, name) => { return (context) => { countActionC++; }; });

                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { };
                const result = evaluate(dispatchTable, context).then(function (result) {
                    expect(countConditionA).to.equal(3);
                    expect(countConditionB).to.equal(1);
                    expect(countConditionC).to.equal(0);
                    expect(countActionA).to.equal(0);
                    expect(countActionB).to.equal(1);
                    expect(countActionC).to.equal(0);
                });

                it('should succeed', () => {
                    return result.should.eventually.be.fulfilled;
                });
            });
            describe('execution pattern with Promise', () => {
                
                const metadata = require('./data/pattern.json');

                let countConditionA = 0;
                let countConditionB = 0;
                let countConditionC = 0;
                let countActionA = 0;
                let countActionB = 0;
                let countActionC = 0;

                const factory = new DispatcherFactory();
                factory.register('ConditionA', (obj, name) => { return (context) => { countConditionA++; return Promise.resolve(false); }; });
                factory.register('ConditionB', (obj, name) => { return (context) => { countConditionB++; return Promise.resolve(true); }; });
                factory.register('ConditionC', (obj, name) => { return (context) => { countConditionC++; return Promise.resolve(false); }; });
                factory.register('ActionA', (obj, name) => { return (context) => { countActionA++; return Promise.resolve(); }; });
                factory.register('ActionB', (obj, name) => { return (context) => { countActionB++; return Promise.resolve(); }; });
                factory.register('ActionC', (obj, name) => { return (context) => { countActionC++; return Promise.resolve(); }; });

                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { };
                const result = evaluate(dispatchTable, context).then(function (result) {
                    expect(countConditionA).to.equal(3);
                    expect(countConditionB).to.equal(1);
                    expect(countConditionC).to.equal(0);
                    expect(countActionA).to.equal(0);
                    expect(countActionB).to.equal(1);
                    expect(countActionC).to.equal(0);
                });

                it('should succeed', () => {
                    return result.should.eventually.be.fulfilled;
                });
            });
            describe('condition rejects', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return Promise.reject(new Error('Failure executing X')); }; });
                factory.register('Y', (obj, name) => { return (context) => { context.responses.push({ value: obj.value }); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { responses: [] };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('operation: "condition", task: "Entry1", reason: "Error: Failure executing X"');
                });
            });
            describe('condition rejects undefined', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return Promise.reject(); }; });
                factory.register('Y', (obj, name) => { return (context) => { context.responses.push({ value: obj.value }); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { responses: [] };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('operation: "condition", task: "Entry1", reason: "undefined"');
                });
            });
            describe('condition throws', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { throw new Error('Failure executing X'); }; });
                factory.register('Y', (obj, name) => { return (context) => { context.responses.push({ value: obj.value }); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { responses: [] };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('operation: "condition", task: "Entry1", reason: "Error: Failure executing X"');
                });
            });
            describe('condition throws undefined', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { throw undefined; }; });
                factory.register('Y', (obj, name) => { return (context) => { context.responses.push({ value: obj.value }); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { responses: [] };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('operation: "condition", task: "Entry1", reason: "undefined"');
                });
            });
            describe('action rejects', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return obj.value === context.value; }; });
                factory.register('Y', (obj, name) => { return (context) => { return Promise.reject(new Error('Failure executing Y')); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { value: '1', responses: [] };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('operation: "action", task: "Entry1", reason: "Error: Failure executing Y"');
                });
            });
            describe('action rejects undefined', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return obj.value === context.value; }; });
                factory.register('Y', (obj, name) => { return (context) => { return Promise.reject(); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { value: '1', responses: [] };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('operation: "action", task: "Entry1", reason: "undefined"');
                });
            });
            describe('action throws', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return obj.value === context.value; }; });
                factory.register('Y', (obj, name) => { return (context) => { throw new Error('Failure executing Y'); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { value: '1', responses: [] };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('operation: "action", task: "Entry1", reason: "Error: Failure executing Y"');
                });
            });
            describe('action throws undefined', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return obj.value === context.value; }; });
                factory.register('Y', (obj, name) => { return (context) => { throw undefined; }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { value: '1', responses: [] };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('operation: "action", task: "Entry1", reason: "undefined"');
                });
            });
            describe('no matching condition', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return false; }; });
                factory.register('Y', (obj, name) => { return (context) => { context.responses.push({ value: obj.value }); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { value: '1', responses: [] };
                const result = evaluate(dispatchTable, context).then(function (result) {
                    context.responses.should.be.an('array').that.is.empty;
                    return;
                });

                it('should succeed', () => {
                    return result.should.eventually.be.fulfilled;
                });
            });
            describe('sticky not found', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return obj.value === context.value; }; });
                factory.register('Y', (obj, name) => { return (context) => { context.responses.push({ value: obj.value }); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { sticky: 'EntryNotFound', value: '3', responses: [] };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('context.sticky: "EntryNotFound" was not found.');
                });
            });
            describe('sticky resumption with reject', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return obj.value === context.value; }; });
                factory.register('Y', (obj, name) => { return (context) => { return Promise.reject(new Error('Failure executing action.')); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { sticky: 'Entry1', responses: [] };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('operation: "action", task: "Entry1", reason: "Error: Failure executing action."');
                });
            });
            describe('sticky resumption with reject undefined', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return obj.value === context.value; }; });
                factory.register('Y', (obj, name) => { return (context) => { return Promise.reject(); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { sticky: 'Entry1', responses: [] };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('operation: "action", task: "Entry1", reason: "undefined"');
                });
            });
            describe('sticky resumption with exception', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return obj.value === context.value; }; });
                factory.register('Y', (obj, name) => { return (context) => { throw new Error('Failure executing action.'); }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { sticky: 'Entry1', responses: [] };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('operation: "action", task: "Entry1", reason: "Error: Failure executing action."');
                });
            });
            describe('sticky resumption with exception undefined', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();
                factory.register('X', (obj, name) => { return (context) => { return obj.value === context.value; }; });
                factory.register('Y', (obj, name) => { return (context) => { throw undefined; }; });
                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { sticky: 'Entry1', responses: [] };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('operation: "action", task: "Entry1", reason: "undefined"');
                });
            });
            describe('action returns continue', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();

                factory.register('X', (obj, name) => { return (context) => { 
                    context.taskEntities.x = 123; return obj.value === context.value; 
                }; });

                factory.register('Y', (obj, name) => { return (context) => { 
                    if (context.taskEntities.x !== 123) {
                        throw new Error('did not get the expected taskEntities');
                    }
                    return { status: 'continue' }; 
                }; });

                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { value: '3', taskEntities: {} };
                const result = evaluate(dispatchTable, context).then(function (result) {
                    context.sticky.should.equal('Entry2');
                    context.taskEntities.x.should.equal(123);
                });

                it('should succeed with the context sticky set to the task that indicated continue', () => {
                    return result.should.eventually.be.fulfilled;
                });
            });
            describe('action returns complete', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();

                factory.register('X', (obj, name) => { return (context) => { 
                    context.local.x = 123; return obj.value === context.value; 
                }; });

                factory.register('Y', (obj, name) => { return (context) => { 
                    if (context.local.x !== 123) {
                        throw new Error('did not get the expected taskEntities');
                    }
                    return { status: 'complete' }; 
                }; });

                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { value: '3', local: {} };
                const result = evaluate(dispatchTable, context).then(function (result) {
                    context.should.not.have.property('sticky');
                    Object.keys(context.local).should.be.empty;
                });

                it('should succeed with the context clear', () => {
                    return result.should.eventually.be.fulfilled;
                });
            });
            describe('action returns unrecognized status', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();

                factory.register('X', (obj, name) => { return (context) => { 
                    context.local.x = 123; return obj.value === context.value; 
                }; });

                factory.register('Y', (obj, name) => { return (context) => { 
                    if (context.local.x !== 123) {
                        throw new Error('did not get the expected taskEntities');
                    }
                    return { status: 'unrecognized' }; 
                }; });

                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { value: '3', local: {} };

                it('should be rejected', () => {
                    return evaluate(dispatchTable, context).should.be.rejectedWith('Unknown status from action');
                });
            });
            describe('task entities should be deleted if a recognizer returns false', () => {
                
                const metadata = require('./data/simple.json');
                const factory = new DispatcherFactory();

                factory.register('X', (obj, name) => { return (context) => {
                    context.local['entity_' + obj.value] = 'entity value from recognizer';
                    return obj.value === context.value;
                }; });

                factory.register('Y', (obj, name) => { return (context) => {
                    context.local.should.not.have.property('entity_1');
                    context.local.should.have.property('entity_3');
                }; });

                const dispatchTable = factory.makeDispatcher(metadata);

                const context = { value: '3', local: {} };

                it('should succeed', () => {
                    return evaluate(dispatchTable, context).should.eventually.be.fulfilled;
                });
            });
        });
    });
});
