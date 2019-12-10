import { strictEqual } from 'assert';

import { ChannelServiceHandler, ChannelServiceRoutes } from 'botbuilder';
import { AuthenticationConfiguration, SimpleCredentialProvider } from 'botframework-connector';
import express from 'express';
import { createServer } from 'restify';

describe('ChannelServiceRoutes - Integration Tests', function() {
    this.timeout(3000);
    it('should successfully configure all routes on an Express Application', () => {
        const app = express();
        const handler = new ChannelServiceHandler(new SimpleCredentialProvider('', ''), new AuthenticationConfiguration());
        const routes = new ChannelServiceRoutes(handler);

        routes.register(app);
        const bfRoutes = (app._router.stack as Array<any>).filter(layer => {
            const r: express.IRoute = layer.route;
            if (r) {
                return r.path.startsWith('/v3/conversations');
            }
        });
        strictEqual(bfRoutes.length, 12);
    });

    it('should successfully configure all routes on a Restify Server', () => {
        const server = createServer();
        const handler = new ChannelServiceHandler(new SimpleCredentialProvider('', ''), new AuthenticationConfiguration());
        const routes = new ChannelServiceRoutes(handler);

        routes.register(server);
        const info = server.getDebugInfo();
        const registeredRoutes = info.routes;
        const bfRoutes = registeredRoutes && registeredRoutes.filter(route => {
            if (route.path) {
                return route.path.startsWith('/v3/conversations');
            }
        });
        strictEqual(bfRoutes.length, 12);
    });
});
