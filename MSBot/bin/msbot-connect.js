"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
program
    .command('azure', 'connect to Azure Bot Service')
    .command('localhost', 'connect to localhost Service')
    .command('luis', 'connect to LUIS a service')
    .command('qna', 'connect to QNA a service');
program.parse(process.argv);
//# sourceMappingURL=msbot-connect.js.map