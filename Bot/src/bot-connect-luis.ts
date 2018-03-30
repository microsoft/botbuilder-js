import * as program from 'commander';

program
    .command('luis', 'connect to LUIS a service')
    .option('-bot, -b', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('-name, -n', 'name for the LUIS app')
    .option('-appid, -i', 'AppId for the LUIS App')
    .option('-region, -r', 'region for the LUIS app [westus, eastus, ...]')
    .action((cmd, actions) => {

    });

program.parse(process.argv);
