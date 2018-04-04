import * as program from 'commander';
import { Enumerable, List, Dictionary } from 'linq-collections';

program
    .name("msbot clone")
    .option('-bot, -b', "path to bot file.  If omitted, local folder will look for a .bot file")
    .description('allows you to clone a bot with a new configuration')
    .action((cmd, actions) => {


    });
program.parse(process.argv);

console.error("not implemented yet");
