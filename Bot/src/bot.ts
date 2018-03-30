import * as program from 'commander';

program
    .command('init', 'create a new .bot file');

program
    .command('export [.bot]', 'export all connected services');

program
    .command('clone [.bot]', 'clone a bot');

program
    .command('connect <service>', 'connect to a service');

program
    .command('connect <service>', 'connect to a service');

program
    .command('disconnect <service>', 'disconnect from a service');

program
    .command('list', 'list all connected services');

program.parse(process.argv);
