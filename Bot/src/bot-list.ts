import * as os from 'os';
import * as process from 'process';
import * as table2 from 'cli-table2';
import * as path from 'path';
import * as program from 'commander';
import { BotConfig } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';


program
    .action((cmd, actions) => {
    });

let parsed = program.parse(process.argv);

if (parsed.args.length == 0) {
    BotConfig.FindBot(process.env.__dirname)
        .then((bot) => {
            console.log(JSON.stringify(bot.services, null, 4));
        });
} else {
    let file = parsed.args[0];
    if (path.extname(file) != '.bot')
        file = file + '.bot';
    BotConfig.Load(file).then((bot) => {
        console.log(JSON.stringify(bot.services, null, 4));
    });
}






