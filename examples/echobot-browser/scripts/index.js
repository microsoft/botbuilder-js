requirejs.config({
    'baseUrl': 'scripts',
    'paths': {
        'botbuilder-core': 'lib/botbuilder', 
        'webchatconnector': 'webchatConnector',
        'jquery': '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min',
        'rx': '//unpkg.com/rxjs/bundles/Rx.min'
    }
});

requirejs(["app"]);