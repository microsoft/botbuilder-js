const { AliasPathResolver, AtAtPathResolver, AtPathResolver, 
        DollarPathResolver, HashPathResolver, PercentPathResolver } =  require('../');
const assert = require('assert');

describe('Memory - Path Resolvers', function() {
    this.timeout(5000);

    it('AliasPathResolver should should prefix paths.', function (done) {
        const resolver = new AliasPathResolver('@', 'turn.recognized.entities.');
        const path = resolver.transformPath('@test');
        assert(path == 'turn.recognized.entities.test', `path: ${path}`);
        done();        
    });

    it('AliasPathResolver should should prefix and postfix paths.', function (done) {
        const resolver = new AliasPathResolver('@', 'turn.recognized.entities.', '.first()');
        const path = resolver.transformPath('@test');
        assert(path == 'turn.recognized.entities.test.first()', `path: ${path}`);
        done();        
    });

    it('AliasPathResolver should ignore non-matching aliases.', function (done) {
        const resolver = new AliasPathResolver('@', 'turn.recognized.entities.', '.first()');
        const path = resolver.transformPath('$test');
        assert(path == '$test', `path: ${path}`);
        done();        
    });

    it('AtAtPathResolver should transform @@ aliases.', function (done) {
        const resolver = new AtAtPathResolver();
        const path = resolver.transformPath('@@test');
        assert(path == 'turn.recognized.entities.test', `path: ${path}`);
        done();        
    });

    it('AtPathResolver should transform @ aliases.', function (done) {
        const resolver = new AtPathResolver();
        const path = resolver.transformPath('@test');
        assert(path == 'turn.recognized.entities.test.first()', `path: ${path}`);
        done();        
    });

    it('DollarPathResolver should transform $ aliases.', function (done) {
        const resolver = new DollarPathResolver();
        const path = resolver.transformPath('$test');
        assert(path == 'dialog.test', `path: ${path}`);
        done();        
    });

    it('HashPathResolver should transform # aliases.', function (done) {
        const resolver = new HashPathResolver();
        const path = resolver.transformPath('#test');
        assert(path == 'turn.recognized.intents.test', `path: ${path}`);
        done();        
    });

    it('PercentPathResolver should transform % aliases.', function (done) {
        const resolver = new PercentPathResolver();
        const path = resolver.transformPath('%test');
        assert(path == 'class.test', `path: ${path}`);
        done();        
    });
});