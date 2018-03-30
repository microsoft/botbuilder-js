import * as program from 'commander';

program
    .option('-bot, -b', "path to bot file.  If omitted, local folder will look for a .bot file")
    .action((cmd, actions) => {


    });
program.parse(process.argv);
