"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
program
    .name("msbot connect")
    .command('azure', 'connect to Azure Bot Service')
    .command('dispatch', 'connect to a Dispatch model')
    .command('endpoint', 'connect to endpoint')
    .command('luis', 'connect to a LUIS application')
    .command('qna', 'connect to QNA a service');
program.parse(process.argv);
//# sourceMappingURL=msbot-connect.js.map