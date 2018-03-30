import * as program from 'commander';

program
    .option('-bot, -b', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('-name,-n', 'name of the aservice to disconnect')
    .action((cmd, actions) => {


    });    
program.parse(process.argv);
