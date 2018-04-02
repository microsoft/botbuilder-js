import * as program from 'commander';

program
    .description("export all of the connected services to local files")
    .option('-bot, -b', "path to bot file.  If omitted, local folder will look for a .bot file")
    .action((cmd, actions) => {
    });
program.parse(process.argv);

console.error("not implemented yet");
