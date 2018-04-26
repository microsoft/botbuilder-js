'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const _ = require('lodash');
const extend = require('deep-extend');
const mkdirp = require('mkdirp');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the astonishing ${chalk.red('generator-botbuilder-js')} generator!`)
    );
    this.log(`    ::::::::::::::::::::::::::::::::::::::::::::
    ::::::::::::::::::::::::::::::::::::::::::::
    ::::::::::::::::::::::::::::::::::::::::::::
    ::::::::::::::::::::::::::::::::::::::::::::
    ::::::::::::::::::::::::::::::::::::::::::::
    ::::::::::::::::::::::::::::::::::::::::::::
    ::::::::::::::::: ::::::::: ::::::::::::::::
    ::::::::::::::::   :::::::   :::::::::::::::
    :::::::::::::::    :::::::    ::::::::::::::
    :::::::::::::;    ::::::::;    :::::::::::::
    :::::::::::::    ::::::::::;    ::::::::::::
    ::::::::::::    ::::::::::::;    :::::::::::
    :::::::::::    ::::::::::::::;   .::::::::::
    ::::::::::    ::::::::::::::::;    :::::::::
    :::::::::    ::::::::::::::::::;    ::::::::
    :::::::;    ::::::,,::::;.;:::::;    :::::::
    :::::::    ::::::.  .:::   ::::::;   ,::::::
    :::::::   .::::::    :::   :::::::    ::::::
    :::::::;   .::::::  ::::: :::::::    :::::::
    ::::::::;   .:::::::::::::::::::    ::::::::
    :::::::::;   .:::::::::::::::::    :::::::::
    ::::::::::;   .:::::::::::::::    ::::::::::
    :::::::::::;   .:::::::::::::    :::::::::::
    ::::::::::::;   .:::::::::::    ::::::::::::
    :::::::::::::;   .:::::::::    :::::::::::::
    ::::::::::::::;   .:::::::    ::::::::::::::
    :::::::::::::::;   ::::::    :::::::::::::::
    ::::::::::::::::; ;:::::::. ::::::::::::::::
    ::::::::::::::::::::::::::::::::::::::::::::
    ::::::::::::::::::::::::::::::::::::::::::::
    ::::::::::::::::::::::::::::::::::::::::::::
    ::::::::::::::::::::::::::::::::::::::::::::
    ::::::::::::::::::::::::::::::::::::::::::::
    ::::::::::::::::::::::::::::::::::::::::::::
    `);

    const prompts = [
      { name: 'botName', message: `What 's the name of your bot?`, default: 'sample' },
      { name: 'description', message: 'What will your bot do?', default: 'sample' },
      { name: 'language', type: 'list', message: 'What language do you want to use?', choices: ['TypeScript', 'JavaScript'] },
      { name: 'dialog', type: 'list', message: 'What default dialog do you want?', choices: ['Echo'] },
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    const directoryName = _.kebabCase(this.props.botName);
    const extension = this.props.language === 'JavaScript' ? 'js' : 'ts';
    const launchSteps = extension === 'js' ? `node app.js` : `tsc\nnode app.js`;
    const defaultDialog = this.props.dialog.split(' ')[0].toLowerCase();
    const luisRegistration = (defaultDialog === 'luis') ? '\nbot.recognizer(new builder.LuisRecognizer(process.env.LUIS_MODEL_URL));\n' : '\n';

    if (path.basename(this.destinationPath()) !== directoryName) {
      this.log(`Your bot should be in a directory named ${directoryName}\nI'll automatically create this folder.`);
      mkdirp(directoryName);
      this.destinationRoot(this.destinationPath(directoryName));
    }

    this.fs.copyTpl(this.templatePath('package.json'), this.destinationPath('package.json'), { botName: directoryName });
    this.fs.copy(this.templatePath('_gitignore'), this.destinationPath('.gitignore'));
    this.fs.copy(this.templatePath('_env'), this.destinationPath('.env'));
    this.fs.copy(this.templatePath(`app.${extension}`), this.destinationPath(`app.${extension}`));
  
    if(extension === 'ts') {
      this.fs.copy(this.templatePath('tsconfig.json'), this.destinationPath('tsconfig.json'));
    }

    this.fs.copyTpl(this.templatePath('README.md'), this.destinationPath('README.md'), {
      botName: this.props.botName, description: this.props.description, launchSteps: launchSteps, extension: extension
    });
  }

  install() {
    this.installDependencies({bower: false});
  }
};
