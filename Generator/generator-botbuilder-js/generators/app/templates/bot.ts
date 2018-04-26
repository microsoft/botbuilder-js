/* ----------------------------------------------------------------
*   Bot created with botbuilder Yeoman Generator
*   https://github.com/microsoftdx/generator-botbuilder
*
*   All default dialogs are located in ./dialogs
*   You can add additional dialogs below as needed
---------------------------------------------------------------- */

import * as builder from 'botbuilder';
import dialog from './dialogs/<%= defaultDialog %>';

// Bot Storage: Here we register the state storage for your bot. 
// Default store: volatile in-memory store - Only for prototyping!
// We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
// For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
var inMemoryStorage = new builder.MemoryBotStorage();

const bot = new builder.UniversalBot(
    new builder.ChatConnector({
        appId: process.env.MICROSOFT_APP_ID,
        appPassword: process.env.MICROSOFT_APP_PASSWORD
    }),
    dialog.waterfall
).set('storage', inMemoryStorage);
<%= luisRegistration %>
export default bot;
