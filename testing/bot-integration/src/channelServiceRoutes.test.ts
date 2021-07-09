import { strictEqual } from 'assert';

import { createServer } from 'restify';
import { ChannelServiceHandler, ChannelServiceRoutes } from 'botbuilder';
import { AuthenticationConfiguration, SimpleCredentialProvider } from 'botframework-connector';
import express from 'express';

describe('ChannelServiceRoutes - Integration Tests', function () {
    it('should successfully configure all routes on an Express Application', function () {
        const app = express();
        const handler = new ChannelServiceHandler(
            new SimpleCredentialProvider('', ''),
            new AuthenticationConfiguration()
        );
        const routes = new ChannelServiceRoutes(handler);

        routes.register(app);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bfRoutes = (app._router.stack as Array<any>).filter((layer) => {
            const route: express.IRoute = layer.route;
            if (route) {
                return route.path.startsWith('/v3/conversations');
            }
        });

        strictEqual(bfRoutes.length, 12);
    });

    it('should successfully configure all routes on an Express Application with a provided basePath', function () {
        const app = express();
        const handler = new ChannelServiceHandler(
            new SimpleCredentialProvider('', ''),
            new AuthenticationConfiguration()
        );
        const routes = new ChannelServiceRoutes(handler);

        routes.register(app, '/test');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bfRoutes = (app._router.stack as Array<any>).filter((layer) => {
            const route: express.IRoute = layer.route;
            if (route) {
                return route.path.startsWith('/test/v3/conversations');
            }
        });

        strictEqual(bfRoutes.length, 12);
    });

    it('should successfully configure all routes on a Restify Server', function () {
        const server = createServer();
        const handler = new ChannelServiceHandler(
            new SimpleCredentialProvider('', ''),
            new AuthenticationConfiguration()
        );
        const routes = new ChannelServiceRoutes(handler);

        routes.register(server);

        const info = server.getDebugInfo();
        const registeredRoutes = info.routes;

        const bfRoutes =
            registeredRoutes &&
            registeredRoutes.filter((route) => {
                if (route.path) {
                    return route.path.startsWith('/v3/conversations');
                }
            });

        strictEqual(bfRoutes.length, 12);
    });

    it('should successfully configure all routes on a Restify Server with a provided basePath', function () {
        const server = createServer();
        const handler = new ChannelServiceHandler(
            new SimpleCredentialProvider('', ''),
            new AuthenticationConfiguration()
        );
        const routes = new ChannelServiceRoutes(handler);

        routes.register(server, '/test');

        const info = server.getDebugInfo();
        const registeredRoutes = info.routes;

        const bfRoutes =
            registeredRoutes &&
            registeredRoutes.filter((route) => {
                if (route.path) {
                    return route.path.startsWith('/test/v3/conversations');
                }
            });

        strictEqual(bfRoutes.length, 12);
    });
});
