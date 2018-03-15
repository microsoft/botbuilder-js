const assert = require('assert');
const builder = require('../');

let setRequestLanguage = function (language) {
    return {
        receiveActivity(context, next) {
            context.request.locale = language;
            return next();
        }
    };
}
let templates = {
    "default": {
        "stringTemplate": (context, data) => `default: ${data.name}`,
        "activityTemplate": (context, data) => { return { type: 'message', text: `(Activity) default: ${data.name}` }; },
        "stringTemplate2": (context, data) => `default: Yo ${data.name}`,
    },
    "en": {
        "stringTemplate": (context, data) => `en: ${data.name}`,
        "activityTemplate": (context, data) => { return { type: 'message', text: `(Activity) en: ${data.name}` }; },
        "stringTemplate2": (context, data) => `en: Yo ${data.name}`,
    },
    "fr": {
        "stringTemplate": (context, data) => `fr: ${data.name}`,
        "activityTemplate": (context, data) => { return { type: 'message', text: `(Activity) fr: ${data.name}` }; },
        "stringTemplate2": (context, data) => `fr: Yo ${data.name}`
    }
};

let overrideTemplates = {
    "en": {
        "stringTemplate2": (context, data) => `en: StringTemplate2 override ${data.name}`
    }
}

describe('DictionaryRenderer', function () {
    this.timeout(5000);

    it("Simple lookup should work", function (done) {
        var engine = new builder.DictionaryRenderer(templates);
        engine.renderTemplate({}, 'en', 'stringTemplate', { name: 'joe' })
            .then(result => {
                assert.equal(result, 'en: joe');
            }).then(() => done())
    });
});

describe('ReplyWith', function () {
    this.timeout(5000);

    it('default stringTemplate should work when there is no template', function (done) {
        let tests = 0;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.DictionaryRenderer(templates))
            .onReceive((context) => {
                context.replyWith(context.request.text.trim(), { name: 'joe' });
                return { handled: true };
            });
        testAdapter.send('stringTemplate').assertReply("default: joe")
            .then(() => done());
    });

    it('en stringTemplate should activate when en', function (done) {
        let tests = 0;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.DictionaryRenderer(templates))
            .use(setRequestLanguage('en'))
            .onReceive((context) => {
                context.replyWith(context.request.text.trim(), { name: 'joe' });
                return { handled: true };
            });
        testAdapter.send('stringTemplate').assertReply("en: joe")
            .then(() => done());
    });

    it('fr stringTemplate should activate when fr', function (done) {
        let tests = 0;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.DictionaryRenderer(templates))
            .use(setRequestLanguage('fr'))
            .onReceive((context) => {
                context.replyWith(context.request.text.trim(), { name: 'joe' });
                return { handled: true };
            });
        testAdapter.send('stringTemplate').assertReply("fr: joe")
            .then(() => done());
    });

    it('activityTemplate should work', function (done) {
        let tests = 0;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.DictionaryRenderer(templates))
            .onReceive((context) => {
                context.replyWith(context.request.text.trim(), { name: 'joe' });
                return { handled: true };
            });
        testAdapter.send('activityTemplate').assertReply("(Activity) default: joe")
            .then(() => done());
    });
});

describe('useTemplates and useTemplateRenderer', function() {
    it('useTemplateRenderer should work to register renderer', function (done) {
        let tests = 0;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .useTemplateRenderer(new builder.DictionaryRenderer(overrideTemplates))
            .useTemplateRenderer(new builder.DictionaryRenderer(templates))
            .onReceive((context) => {
                context.replyWith(context.request.text.trim(), { name: 'joe' });
                return { handled: true };
            });
        testAdapter.send('stringTemplate').assertReply("default: joe")
            .then(() => done());
    });

    it('useTemplates should work to register TemplateDictionary', function (done) {
        let tests = 0;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .useTemplates(overrideTemplates)
            .useTemplates(templates)
            .onReceive((context) => {
                context.replyWith(context.request.text.trim(), { name: 'joe' });
                return { handled: true };
            });
        testAdapter.send('stringTemplate').assertReply("default: joe")
            .then(() => done());
    });

});

describe('Multiple TemplateEngines', function () {
    this.timeout(5000);

    it('override should override', function (done) {
        let tests = 0;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.DictionaryRenderer(overrideTemplates))
            .use(new builder.DictionaryRenderer(templates))
            .use(setRequestLanguage('en'))
            .onReceive((context) => {
                context.replyWith(context.request.text.trim(), { name: 'joe' });
                return { handled: true };
            });
        testAdapter
            .send('stringTemplate2').assertReply("en: StringTemplate2 override joe")
            .then(() => done());
    });

    it('french should not override', function (done) {
        let tests = 0;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.DictionaryRenderer(overrideTemplates))
            .use(new builder.DictionaryRenderer(templates))
            .use(setRequestLanguage('fr'))
            .onReceive((context) => {
                context.replyWith(context.request.text.trim(), { name: 'joe' });
                return { handled: true };
            });
        testAdapter
            .send('stringTemplate2').assertReply("fr: Yo joe")
            .then(() => done());
    });

});