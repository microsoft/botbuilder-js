const Generator = require('yeoman-generator');
const chalk = require('chalk');
const fse = require('fs-extra');
const klawSync = require('klaw-sync');
const path = require('path');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.option('javascript', {
            desc: 'Generate JavaScript scaffolding'
        });

        this.option('typescript', {
            desc: 'Generate TypeScript scaffolding'
        });
    }

    async promptUser() {
        this.log(chalk.bold.cyan('Thank you for choosing Microsoft\'s BotFramework!\nLet\'s get you started.'));
        this.answers = await this.prompt([
            {type: 'input', name: 'botName', message: 'What is the name of your bot?', default: 'MyBot'},
            {type: 'input', name: 'appId', message: 'What is your Microsoft App ID?'},
            {
                type: 'list',
                name: 'language',
                message: 'Which language do you want?',
                default: 'TypeScript',
                choices: ['TypeScript', 'JavaScript']
            },
        ]);
        this.log(chalk.bold.cyan('Looks Good! Thank you.'));
    }

    writing() {
        this.log(chalk.bold.cyan('Writing configuration files'));
        const templateDir = this.templatePath();
        const templateOptions = this._buildTemplateOptions();
        // Common files
        const commonDir = path.join(templateDir, 'common');
        let filePaths = klawSync(commonDir, {nodir: true});

        filePaths.forEach(filePath => {
            let {base, dir} = path.parse(filePath.path);
            const relativePath = dir.replace(commonDir, '').replace('\\', '');
            const location = path.join(relativePath, base);
            if (base.startsWith('_')) {
                base = base.replace('_', '.');
            }
            const destination = path.join(relativePath, base);
            this.fs.copyTpl(this.templatePath('common/' + location), this.destinationPath(destination), templateOptions);
        });

        // Language specific files
        const {language} = this.answers;
        const languageDir = language === 'TypeScript' ? 'echobot-typescript' : 'echobot-javascript';
        const sourceRoot = language === 'TypeScript' ? 'src' : 'lib';

        filePaths = klawSync(path.join(templateDir, languageDir), {nodir: true});
        filePaths.forEach(filePath => {
            let {base} = path.parse(filePath.path);
            let destination = base.startsWith('tsconfig') ? '' : sourceRoot;
            this.fs.copyTpl(this.templatePath(path.join(languageDir, base)), this.destinationPath(path.join(destination, base)), templateOptions);
        });
    }

    installingDependencies() {
        if (this.answers.language === 'TypeScript') {
            this.log(chalk.bold.cyan('Installing TypeScript dependencies'));
            this.npmInstall(['@types/restify', '@types/node', 'typescript'], {save: true})
                .then(() => {
                    this.log(chalk.bold.cyan('Done...'));
                });
        }
        this.log(chalk.bold.cyan('Installing packages'));
        this.installDependencies({npm: true, bower: false, yarn: false}).then(() => {
            this.log(chalk.bold.cyan('Done...'));
        });
    }

    _buildTemplateOptions() {
        const {answers} = this;
        const {language} = answers;
        const templateOptions = Object.assign({}, answers);
        templateOptions.main = language === 'TypeScript' ? 'lib/app.js' : 'app.js';
        templateOptions.build = language === 'TypeScript' ? 'tsc' : 'echo "no build is required"';

        return templateOptions;
    }
};
