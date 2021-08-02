const { ComponentDialog, DialogSet, DialogTurnStatus, OAuthPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const OAUTH_PROMPT = 'oAuthPrompt';
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class MainDialog extends ComponentDialog {
    constructor() {
        super('MainDialog');
        this.addDialog(new OAuthPrompt(OAUTH_PROMPT, {
            connectionName: process.env.ConnectionName,
            text: 'Sign In to AAD',
            title: 'Sign In'
        }))
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.signInStep.bind(this),
                this.showTokenResponse.bind(this)
            ]));
        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async signInStep(step) {
        return step.beginDialog(OAUTH_PROMPT);
    }

    async showTokenResponse(step) {
        const tokenResponse = step.result;
        if(tokenResponse) {
            console.log(`Skill: your token is ${ tokenResponse.token }`)
        }
        else {
            console.log('Skill: No token response from OAuthPrompt');
        }

        return await step.endDialog();
    }
}

module.exports.MainDialog = MainDialog;