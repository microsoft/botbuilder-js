import * as program from 'commander';

program
    .command('qna', 'connect to a QNA knowledge base')
    .option('-bot, -b', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('-name, -n', 'name for the QNA database')
    .option('-appid, -i', 'AppId for the LUIS App')
    .option('-region, -r', 'region for the LUIS app [westus, eastus, ...]')
    .action((cmd, actions) => {


    });

program.parse(process.argv);
