const {
    AliasPathResolver,
    AtAtPathResolver,
    AtPathResolver,
    DollarPathResolver,
    HashPathResolver,
    PercentPathResolver,
} = require('../');
const assert = require('assert');

describe('Memory - Path Resolvers', function () {
    this.timeout(5000);

    it('AliasPathResolver should should prefix paths.', function () {
        const resolver = new AliasPathResolver('@', 'turn.recognized.entities.');
        const path = resolver.transformPath('@test');
        assert(path == 'turn.recognized.entities.test', `path: ${path}`);
    });

    it('AliasPathResolver should should prefix and postfix paths.', function () {
        const resolver = new AliasPathResolver('@', 'turn.recognized.entities.', '.first()');
        const path = resolver.transformPath('@test');
        assert(path == 'turn.recognized.entities.test.first()', `path: ${path}`);
    });

    it('AliasPathResolver should ignore non-matching aliases.', function () {
        const resolver = new AliasPathResolver('@', 'turn.recognized.entities.', '.first()');
        const path = resolver.transformPath('$test');
        assert(path == '$test', `path: ${path}`);
    });

    it('AtAtPathResolver should transform @@ aliases.', function () {
        const resolver = new AtAtPathResolver();
        const path = resolver.transformPath('@@test');
        assert(path == 'turn.recognized.entities.test', `path: ${path}`);
    });

    it('AtPathResolver should transform @ aliases.', function () {
        const resolver = new AtPathResolver();
        assert.equal(resolver.transformPath('@test'), 'turn.recognized.entities.test.first()');
        assert.equal(resolver.transformPath('@test.bar'), 'turn.recognized.entities.test.first().bar');
    });

    it('DollarPathResolver should transform $ aliases.', function () {
        const resolver = new DollarPathResolver();
        const path = resolver.transformPath('$test');
        assert(path == 'dialog.test', `path: ${path}`);
    });

    it('HashPathResolver should transform # aliases.', function () {
        const resolver = new HashPathResolver();
        const path = resolver.transformPath('#test');
        assert(path == 'turn.recognized.intents.test', `path: ${path}`);
    });

    it('PercentPathResolver should transform % aliases.', function () {
        const resolver = new PercentPathResolver();
        const path = resolver.transformPath('%test');
        assert(path == 'class.test', `path: ${path}`);
    });
});
