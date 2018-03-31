import * as program from 'commander';

program
    .command('azure', 'connect to Azure Bot Service')
    .option('-b, -bot', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('-n, -name', 'name for the Azure Bot Service')
    .option('-appid, -i', 'Microsoft AppId for the Azure Bot Service')
    .option('-endpoint, -r', 'region for the LUIS app [westus, eastus, ...]')
    .action((cmd, actions) => {

    });

program.parse(process.argv);
