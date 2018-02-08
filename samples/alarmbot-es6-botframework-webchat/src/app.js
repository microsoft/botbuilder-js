import './css/app.css';

import {Bot, BotStateManager, MemoryStorage} from "botbuilder";
import 'botframework-webchat/botchat.css';
import {App} from 'botframework-webchat/built/App';
import {BotConnection} from './botConnection';
import {WebChatAdapter} from './webChatAdapter';
import {AlarmRenderer} from "./alarmRenderer";
import {routes} from './routes';
import {AlarmsListComponent} from "./alarmsListComponent";

const webChatAdapter = new WebChatAdapter();

const bot = new Bot(webChatAdapter)
    .use(new MemoryStorage(),
        new BotStateManager(),
        new AlarmRenderer());
const botConnection = new BotConnection(webChatAdapter.getMessagePipelineToBot());
App({
    user: {id: "Me!"},
    bot: {id: "The Bot"},
    botConnection,
}, document.getElementById('bot'));
AlarmsListComponent.bootstrap(botConnection.activity$, document.querySelector('.alarms-container'));
// handle activities
bot.onReceive((context) => routes(context));

// FOUC
document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(() => document.body.style.visibility = 'visible');
});