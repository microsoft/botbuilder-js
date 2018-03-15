const assert = require('assert');
const builder = require('../');

describe('JSON Templates', function() {
    this.timeout(5000);

    it('should compile and execute plain JSON.', function (done) { 
        const tmpl = builder.JsonTemplates.compile({ foo: 'bar', bar: "foo" });
        const txt = tmpl({});
        assert(typeof txt === 'string');
        const obj = JSON.parse(txt);
        assert(obj.foo === 'bar');
        assert(obj.bar === 'foo');
        done();
    });

    it('should replace a ${property}.', function (done) { 
        const tmpl = builder.JsonTemplates.compile({ name: '${name}', age: 27 });
        const obj = JSON.parse(tmpl({ name: 'john' }));
        assert(obj.name === 'john');
        assert(obj.age === 27);
        done();
    });

    it('should replace a !literal.', function (done) { 
        const tmpl = builder.JsonTemplates.compile({ name: '${name}', age: '!age' });
        const obj = JSON.parse(tmpl({ name: 'john', age: 27 }));
        assert(obj.name === 'john');
        assert(obj.age === 27);
        done();
    });

     it('should replace multiple properties.', function (done) { 
        const tmpl = builder.JsonTemplates.compile({ name: '${last}, ${first}', age: 27 });
        const obj = JSON.parse(tmpl({ first: 'john', last: 'smith' }));
        assert(obj.name === 'smith, john');
        assert(obj.age === 27);
        done();
    });
    
    it('should render a named template.', function (done) {
        const templates = new builder.JsonTemplates();
        templates.add('profile', { name: '${name}', age: '!age' });
        const obj = templates.renderAsJSON('profile', { name: 'john', age: 27 });
        assert(obj.name === 'john');
        assert(obj.age === 27);
        done();
    });

    it('should render a child template.', function (done) {
        const templates = new builder.JsonTemplates();
        templates.add('profile', { name: '${name}', age: '!age' })
                 .add('user', { profile: '!profile()', enabled: true });
        const obj = templates.renderAsJSON('user', { name: 'john', age: 27 });
        assert(obj.profile);
        assert(obj.profile.name === 'john');
        assert(obj.profile.age === 27);
        assert(obj.enabled === true);
        done();
    });

    it('should render an array of child objects using a template.', function (done) {
        const templates = new builder.JsonTemplates();
        templates.add('profile', { name: '${name}', age: '!age' })
                 .add('users', { profiles: '!profile(members)', enabled: true });
        const obj = templates.renderAsJSON('users', { members: [{ name: 'john', age: 27 }, { name: 'tom', age: 50 }] });
        assert(obj.profiles);
        assert(obj.profiles.length == 2)
        assert(obj.profiles[0].name === 'john');
        assert(obj.profiles[1].name === 'tom');
        done();
    });

    it('should call an external function.', function (done) {
        const templates = new builder.JsonTemplates();
        templates.add('profile', { name: '${name}', age: '!age' })
                 .add('users', { profiles: '!profile(members)', enabled: true, roles: '${roles()}' })
                 .addFunction('roles', (data) => 'admin');
        const obj = templates.renderAsJSON('users', { members: [{ name: 'john', age: 27 }, { name: 'tom', age: 50 }] });
        assert(obj.profiles);
        assert(obj.profiles.length == 2)
        assert(obj.profiles[0].name === 'john');
        assert(obj.profiles[1].name === 'tom');
        assert(obj.roles === 'admin');
        done();
    });

    it('should call an external function with args.', function (done) {
        const templates = new builder.JsonTemplates();
        templates.add('test', { 
                     test: "${eval('This is the number %d'.replace('%d', data.value))}" 
                 })
                 .addFunction('eval', (data, args) => eval(`((data) => (${args}))(${JSON.stringify(data)})`));
        const obj = templates.renderAsJSON('test', { value: 5 });
        assert(obj.test == 'This is the number 5');
        done();
    });

    it('should pass through array properties.', function (done) {
        const templates = new builder.JsonTemplates();
        templates.add('test', { 
                     test: '!values' 
                 })
                 .addFunction('eval', (data, args) => eval(`((data) => (${args}))(${JSON.stringify(data)})`));
        const obj = templates.renderAsJSON('test', { values: ['foo','bar'] });
        assert(Array.isArray(obj.test));
        assert(obj.test.length == 2);
        assert(obj.test[0] == 'foo');
        assert(obj.test[1] == 'bar');
        done();
    });

    it('should pass through object properties.', function (done) {
        const templates = new builder.JsonTemplates();
        templates.add('test', { 
                     test: '!value' 
                 })
                 .addFunction('eval', (data, args) => eval(`((data) => (${args}))(${JSON.stringify(data)})`));
        const obj = templates.renderAsJSON('test', { value: { 'foo': true, 'bar': false } });
        assert(typeof obj.test === 'object');
        assert(obj.test.foo === true);
        assert(obj.test.bar === false);
        done();
    });

    it('should @prune null members.', function (done) {
        const templates = new builder.JsonTemplates();
        templates.add('profile', { name: '${name}', age: '!age', image: '${image}' })
                 .add('users', {
                        '@prune': { nullMembers: true, emptyStrings: true },
                        profiles: '!profile(members)', 
                        enabled: true, 
                        roles: '${roles()}' 
                    })
                 .addFunction('roles', (data) => 'admin');
        const obj = templates.renderAsJSON('users', { members: [{ name: 'john', age: 27 }, { name: 'tom', age: 50 }] });
        assert(obj.profiles);
        assert(obj.profiles.length == 2)
        assert(!obj.profiles[0].hasOwnProperty('image'));
        done();
    });

    it('should @prune empty arrays.', function (done) {
        const templates = new builder.JsonTemplates();
        templates.add('profile', { name: '${name}', age: '!age', image: '${image}' })
                 .add('users', {
                        '@prune': { emptyArrays: true },
                        profiles: '!profile(members)', 
                        enabled: true, 
                        roles: '${roles()}' 
                    })
                 .addFunction('roles', (data) => 'admin');
        const obj = templates.renderAsJSON('users', { members: [] });
        assert(!obj.hasOwnProperty('profiles'));
        done();
    });

    it('should process @if conditions.', function (done) {
        const templates = new builder.JsonTemplates();
        templates.add('profile', { 
                        '@if': 'image',
                        name: '${name}', 
                        age: '!age', 
                        image: '${image}' 
                    })
                 .add('users', {
                        '@prune': { nullMembers: true, emptyStrings: true },
                        profiles: '!profile(members)', 
                        enabled: true, 
                        roles: '${roles()}' 
                    })
                 .addFunction('roles', (data) => 'admin');
        const obj = templates.renderAsJSON('users', { 
            members: [
                { name: 'john', age: 27, image: 'http://example.com/profile.jpg' }, 
                { name: 'tom', age: 50 }
            ] 
        });
        assert(obj.profiles);
        assert(obj.profiles.length == 1)
        assert(obj.profiles[0].hasOwnProperty('image'));
        done();
    });
});