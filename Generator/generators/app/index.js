'use strict';

const path = require('path');
const Generator = require('yeoman-generator');
const _ = require('lodash');
const extend = require('deep-extend');
const mkdirp = require('mkdirp');

module.exports = class extends Generator {
  prompting() {
    const prompts = [
      { name: 'botName', message: `What 's the name of your bot?`, default: 'sample' },
      { name: 'description', message: 'What will your bot do?', default: 'sample' },
      { name: 'language', type: 'list', message: 'What language do you want to use?', choices: ['TypeScript', 'JavaScript'] },
      { name: 'dialog', type: 'list', message: 'What default dialog do you want?', choices: ['Echo'] },
    ];

    return this.prompt(prompts).then((props) => {
      this.props = props;
    });
  }
  writing() {
    const directoryName = _.kebabCase(this.props.botName);
    const botName = this.props.botName;
    const extension = this.props.language === 'JavaScript' ? 'js' : 'ts';
    const launchSteps = extension === 'js' ? `node app.js` : `tsc\nnode app.js`;
    const defaultDialog = this.props.dialog.split(' ')[0].toLowerCase();

    if (path.basename(this.destinationPath()) !== directoryName) {
      this.log(`Your bot should be in a directory named ${directoryName}\nI'll automatically create this folder.`);
      mkdirp(directoryName);
      this.destinationRoot(this.destinationPath(directoryName));
    }

    this.fs.copyTpl(this.templatePath('package.json'), this.destinationPath('package.json'), { botName: directoryName });
    this.fs.copy(this.templatePath('_gitignore'), this.destinationPath('.gitignore'));
    this.fs.copy(this.templatePath('_env'), this.destinationPath('.env'));
    this.fs.copy(this.templatePath(`botName.bot`), this.destinationPath(`${this.props.botName}.bot`), {
      process: function(content) {
        var pattern = new RegExp('<%= botName %>','g');
        return content.toString().replace(pattern, botName.toString()); 
    }});

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
}