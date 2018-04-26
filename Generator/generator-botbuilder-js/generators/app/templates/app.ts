require('dotenv').config();

import * as restify from 'restify';
import * as builder from 'botbuilder';
import bot from './bot';

class App {
    run() {
        const server = restify.createServer();
        server.post('/api/messages', (bot.connector('*') as builder.ChatConnector).listen());
        server.listen(process.env.PORT, () => console.log(`${server.name} listening to ${server.url}`));
    }
}

const app = new App();
app.run();