const chalk = require('chalk');
module.exports = function () {
    process.stdout.write(chalk`{blue --config=[file]} {white (optional) [file] is the location of your config file which is a json formatted arguments list\n}`);
    process.stdout.write(chalk`{blue --in=[file]} {white (optional) [file] is the location of the chat file to parse. If omitted, piping is assumed and stdin will be used\n}`);
    process.stdout.write(chalk`{blue --out=[file]} {white (optional) [file] is the location transcript file to write. If omitted, the transcript will be written to stdout\n}`);
    process.stdout.write(chalk`{blue --channelId=[id]} {white (optional) The ID of the channel or room\n}`);
    process.stdout.write(chalk`{blue --bot=[name]} {white the name of your bot\n}`);
    process.stdout.write(chalk`{blue --user=[name]} {white The name of the participant\n}`);
};
