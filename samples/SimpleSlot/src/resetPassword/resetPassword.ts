import { RuleDialogEventNames, AdaptiveDialog, SendActivity, SaveEntity, IntentRule, EventRule, UnknownIntentRule, IfCondition, TextInput, EndDialog, SetProperty, EmitEvent, CodeStep  } from "botbuilder-dialogs-adaptive";
import { LuisRecognizer, LuisApplication } from 'botbuilder-ai';


export class ResetPassword extends AdaptiveDialog {
    
    //
    private luisRecognizer: LuisRecognizer;

    constructor() {
        super('ResetPassword');

        // at end of steps (no active plan) end the dialog
        this.autoEndDialog = true;

        // define LUIS recognizer 
        this.luisRecognizer = new LuisRecognizer({
            applicationId: "f931f8f4-bf6f-4cda-8df0-923bf8f4f73e",
            endpoint:"https://westus.api.cognitive.microsoft.com",

            // CAUTION: Authoring key is used in this example as it is appropriate for prototyping.
            // When implimenting for deployment/production, assign and use a subscription key instead of an authoring key.
            endpointKey: "d016585ce5c9446bbdbac5ea95660e6b"
        });

        // Add recognizer
        this.recognizer = this.luisRecognizer;

        //this.steps.push();
        // beginDialog event 
        this.addRule(new EventRule(RuleDialogEventNames.beginDialog, [
            new SendActivity("To reset your password, i am going to ask for your windows version"),
            new TextInput('dialog.product', 'What is the version of your windows?'),
          //  new SaveEntity('dialog.product', '@product'),
            new IfCondition('dialog.product != null', [
                new SendActivity(`you said {dialog.product}`),
            ])
            .else([
                
                new EmitEvent('DONE')
            ])
        ]))

        
        //turn.entities.product.value
        this.addRule(new IntentRule(['#WindowsVersion', '@product'], [
            new SendActivity(`your produt {@product} version is `),
            new SaveEntity('dialog.product', '@product')
        ]));

        this.addRule(new IntentRule('#WindowsVersion', [
            new SendActivity(`what verion of windows aagian? `),
        ]));

    }

}
