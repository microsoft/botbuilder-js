import {BotDebugger} from "botbuilder-planning";

const {MemoryStorage} = require('botbuilder-core');

const restify = require('restify');
const {default: chalk} = require('chalk');

const {BotFrameworkAdapter} = require('botbuilder');
const {EmulatorAwareBot} = require('./bot');

const memoryStorage = new MemoryStorage();
const bot = new EmulatorAwareBot(memoryStorage);

const adapter = new BotFrameworkAdapter({
	appId: process.env.APP_ID,
	appPassword: process.env.APP_PASSWORD,
});

if (process.env.NODE_ENV === 'development') {
	new BotDebugger(memoryStorage, adapter);
}

const server = restify.createServer();
server.listen(process.env.PORT, () => {
	process.stdout.write(`Bot is listening on port: ${chalk.blue(server.address().port)}`);
});

server.post('/api/messages', (req, res) => {
	return adapter.processActivity(req, res, bot.processTurnContext.bind(bot)).catch(res.error);
});
