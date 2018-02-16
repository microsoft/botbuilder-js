import './css/app.css';

import {Bot, BotStateManager, MemoryStorage} from "botbuilder";
import 'botframework-webchat/botchat.css';
import {App} from 'botframework-webchat/built/App';
import {WebChatAdapter} from './webChatAdapter';
import {AlarmRenderer} from "./alarmRenderer";
import {routes} from './routes';
import {AlarmsListComponent} from "./alarmsListComponent";

const webChatAdapter = new WebChatAdapter();

const bot = new Bot(webChatAdapter)
    .use(new MemoryStorage(),
        new BotStateManager(),
        new AlarmRenderer());
App({
    user: {id: "Me!"},
    bot: {id: "bot"},
    botConnection: webChatAdapter.botConnection,
}, document.getElementById('bot'));

AlarmsListComponent.bootstrap(webChatAdapter.botConnection.activity$, document.querySelector('.alarms-container'));
// handle activities
bot.onReceive((context) => routes(context));

// FOUC
document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(() => document.body.style.visibility = 'visible');
});