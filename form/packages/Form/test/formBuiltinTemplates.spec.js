
const chai = require('chai');

const builtin = require('../src/formBuiltinTemplates.js');

const assert = chai.assert;
const expect = chai.expect;
chai.should();

describe('No Network', () => {
    describe('Form', () => {
        describe('builtin templates from set of fields', () => {

            // the form definition
            const fields = [
                { entity: 'x0', displayName: 'X0', required: true },
                { entity: 'x1', displayName: 'X1', required: true },
                { entity: 'x2', displayName: 'X2' },
                { entity: 'y0', required: true },
                { entity: 'y1' },
                { entity: 'z0', required: true },
                { entity: 'z1' }
            ];
            
            describe('partially filled form fields', () => {
   
                // the local state
                const context = {
                    local: {
                        x0: '42',
                        z0: '64',
                        z1: 'hello world',
                        a: 'in local state but not in form'
                    }
                };
    
                it('required', () => {
                    const builtinTemplates = builtin.createTemplates(fields, context);
                    builtinTemplates.should.have.property('builtin.requiredFieldsMissing');

                    builtinTemplates['builtin.requiredFieldsMissing'].should.have.property('type', 'SimpleResponseTemplate');
                    builtinTemplates['builtin.requiredFieldsMissing'].should.have.property('name', 'builtin.requiredFieldsMissing');
                    builtinTemplates['builtin.requiredFieldsMissing'].should.have.property('feedback');
                    builtinTemplates['builtin.requiredFieldsMissing'].feedback.should.have.property('value', '"X1" and "y0"');
                });
                it('optional', () => {
                    const builtinTemplates = builtin.createTemplates(fields, context);
                    builtinTemplates.should.have.property('builtin.optionalFieldsMissing');

                    builtinTemplates['builtin.optionalFieldsMissing'].should.have.property('type', 'SimpleResponseTemplate');
                    builtinTemplates['builtin.optionalFieldsMissing'].should.have.property('name', 'builtin.optionalFieldsMissing');
                    builtinTemplates['builtin.optionalFieldsMissing'].should.have.property('feedback');
                    builtinTemplates['builtin.optionalFieldsMissing'].feedback.should.have.property('value', '"X2" and "y1"');
                });
                it('filled', () => {
                    const builtinTemplates = builtin.createTemplates(fields, context);
                    builtinTemplates.should.have.property('builtin.filledFields');

                    builtinTemplates['builtin.filledFields'].should.have.property('type', 'SimpleResponseTemplate');
                    builtinTemplates['builtin.filledFields'].should.have.property('name', 'builtin.filledFields');
                    builtinTemplates['builtin.filledFields'].should.have.property('feedback');
                    builtinTemplates['builtin.filledFields'].feedback.should.have.property('value', '"X0 = 42", "z0 = 64" and "z1 = hello world"');
                });
            });
            describe('empty local state', () => {
                
                // the local state
                const context = {
                    local: {
                        a: 'in local state but not in form'
                    }
                };
    
                it('required', () => {
                    const builtinTemplates = builtin.createTemplates(fields, context);
                    builtinTemplates.should.have.property('builtin.requiredFieldsMissing');

                    builtinTemplates['builtin.requiredFieldsMissing'].should.have.property('type', 'SimpleResponseTemplate');
                    builtinTemplates['builtin.requiredFieldsMissing'].should.have.property('name', 'builtin.requiredFieldsMissing');
                    builtinTemplates['builtin.requiredFieldsMissing'].should.have.property('feedback');
                    builtinTemplates['builtin.requiredFieldsMissing'].feedback.should.have.property('value', '"X0", "X1", "y0" and "z0"');
                });
                it('optional', () => {
                    const builtinTemplates = builtin.createTemplates(fields, context);
                    builtinTemplates.should.have.property('builtin.optionalFieldsMissing');

                    builtinTemplates['builtin.optionalFieldsMissing'].should.have.property('type', 'SimpleResponseTemplate');
                    builtinTemplates['builtin.optionalFieldsMissing'].should.have.property('name', 'builtin.optionalFieldsMissing');
                    builtinTemplates['builtin.optionalFieldsMissing'].should.have.property('feedback');
                    builtinTemplates['builtin.optionalFieldsMissing'].feedback.should.have.property('value', '"X2", "y1" and "z1"');
                });
                it('filled', () => {
                    const builtinTemplates = builtin.createTemplates(fields, context);
                    builtinTemplates.should.have.property('builtin.filledFields');

                    builtinTemplates['builtin.filledFields'].should.have.property('type', 'SimpleResponseTemplate');
                    builtinTemplates['builtin.filledFields'].should.have.property('name', 'builtin.filledFields');
                    builtinTemplates['builtin.filledFields'].should.have.property('feedback');
                    builtinTemplates['builtin.filledFields'].feedback.should.have.property('value', '');
                });
            });
            describe('full local state', () => {
                
                // the local state
                const context = {
                    local: {
                        x0: '1',
                        x1: '2',
                        x2: '3',
                        y0: '4',
                        y1: '5',
                        z0: '6',
                        z1: '7',
                        a: 'in local state but not in form'
                    }
                };
    
                it('required', () => {
                    const builtinTemplates = builtin.createTemplates(fields, context);
                    builtinTemplates.should.have.property('builtin.requiredFieldsMissing');

                    builtinTemplates['builtin.requiredFieldsMissing'].should.have.property('type', 'SimpleResponseTemplate');
                    builtinTemplates['builtin.requiredFieldsMissing'].should.have.property('name', 'builtin.requiredFieldsMissing');
                    builtinTemplates['builtin.requiredFieldsMissing'].should.have.property('feedback');
                    builtinTemplates['builtin.requiredFieldsMissing'].feedback.should.have.property('value', '');
                });
                it('optional', () => {
                    const builtinTemplates = builtin.createTemplates(fields, context);
                    builtinTemplates.should.have.property('builtin.optionalFieldsMissing');

                    builtinTemplates['builtin.optionalFieldsMissing'].should.have.property('type', 'SimpleResponseTemplate');
                    builtinTemplates['builtin.optionalFieldsMissing'].should.have.property('name', 'builtin.optionalFieldsMissing');
                    builtinTemplates['builtin.optionalFieldsMissing'].should.have.property('feedback');
                    builtinTemplates['builtin.optionalFieldsMissing'].feedback.should.have.property('value', '');
                });
                it('filled', () => {
                    const builtinTemplates = builtin.createTemplates(fields, context);
                    builtinTemplates.should.have.property('builtin.filledFields');

                    builtinTemplates['builtin.filledFields'].should.have.property('type', 'SimpleResponseTemplate');
                    builtinTemplates['builtin.filledFields'].should.have.property('name', 'builtin.filledFields');
                    builtinTemplates['builtin.filledFields'].should.have.property('feedback');
                    builtinTemplates['builtin.filledFields'].feedback.should.have.property('value', '"X0 = 1", "X1 = 2", "X2 = 3", "y0 = 4", "y1 = 5", "z0 = 6" and "z1 = 7"');
                });
            });
        });
        describe('builtin templates from empty set of fields', () => {
            
            // the empty form definition
            const fields = [];
            
            describe('partially filled form fields', () => {
    
                // the local state
                const context = {
                    local: {
                        x0: '42',
                        z0: '64',
                        z1: 'hello world',
                        a: 'in local state but not in form'
                    }
                };
    
                it('required', () => {
                    const builtinTemplates = builtin.createTemplates(fields, context);
                    builtinTemplates.should.have.property('builtin.requiredFieldsMissing');

                    builtinTemplates['builtin.requiredFieldsMissing'].should.have.property('type', 'SimpleResponseTemplate');
                    builtinTemplates['builtin.requiredFieldsMissing'].should.have.property('name', 'builtin.requiredFieldsMissing');
                    builtinTemplates['builtin.requiredFieldsMissing'].should.have.property('feedback');
                    builtinTemplates['builtin.requiredFieldsMissing'].feedback.should.have.property('value', '');
                });
                it('optional', () => {
                    const builtinTemplates = builtin.createTemplates(fields, context);
                    builtinTemplates.should.have.property('builtin.optionalFieldsMissing');

                    builtinTemplates['builtin.optionalFieldsMissing'].should.have.property('type', 'SimpleResponseTemplate');
                    builtinTemplates['builtin.optionalFieldsMissing'].should.have.property('name', 'builtin.optionalFieldsMissing');
                    builtinTemplates['builtin.optionalFieldsMissing'].should.have.property('feedback');
                    builtinTemplates['builtin.optionalFieldsMissing'].feedback.should.have.property('value', '');
                });
                it('filled', () => {
                    const builtinTemplates = builtin.createTemplates(fields, context);
                    builtinTemplates.should.have.property('builtin.filledFields');

                    builtinTemplates['builtin.filledFields'].should.have.property('type', 'SimpleResponseTemplate');
                    builtinTemplates['builtin.filledFields'].should.have.property('name', 'builtin.filledFields');
                    builtinTemplates['builtin.filledFields'].should.have.property('feedback');
                    builtinTemplates['builtin.filledFields'].feedback.should.have.property('value', '');
                });
            });
        });                    
        describe('builtin templates for single entity prompt (used in reprompt)', () => {
            
            // form definition
            const fields = [
                { entity: 'x0', displayName: 'Display-X0' },
                { entity: 'z0', displayName: 'Display-Z0' },
                { entity: 'z1', displayName: 'Display-Z1' },
                { entity: 'a', displayName: 'Display-A' }
            ];
    
            // local state
            const context = {
                local: {
                    x0: '42',
                    z0: '64',
                    z1: 'hello world',
                    a: 'in local state but not in form'
                }
            };
    
            context.flow = { stack: [{ type: 'SingleEntityPrompt', entityName: 'z1' }]};

            it('lastPrompt', () => {
    
                // local state
                const context = {
                    local: {
                        x0: '42',
                        z0: '64',
                        z1: 'hello world',
                        a: 'in local state but not in form'
                    }
                };

                // last prompt was a single entity prompt
                context.flow = { stack: [{ type: 'SingleEntityPrompt', entityName: 'z1' }]};
    
                const builtinTemplates = builtin.createTemplates(fields, context);
                builtinTemplates.should.have.property('builtin.lastPrompt');

                builtinTemplates['builtin.lastPrompt'].should.have.property('type', 'SimpleResponseTemplate');
                builtinTemplates['builtin.lastPrompt'].should.have.property('name', 'builtin.lastPrompt');
                builtinTemplates['builtin.lastPrompt'].should.have.property('feedback');
                builtinTemplates['builtin.lastPrompt'].feedback.should.have.property('value', 'Display-Z1');
            });
            it('no lastPrompt', () => {
                
                // local state
                const context = {
                    local: {
                        x0: '42',
                        z0: '64',
                        z1: 'hello world',
                        a: 'in local state but not in form'
                    }
                };

                // last prompt was a single entity prompt
                context.flow = { stack: [] };
    
                const builtinTemplates = builtin.createTemplates(fields, context);
                builtinTemplates.should.not.have.property('builtin.lastPrompt');
            });
        });                    
    });
});
