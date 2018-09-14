"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const moment = require("moment");
const timePrompt_1 = require("../prompts/timePrompt");
const titlePrompt_1 = require("../prompts/titlePrompt");
const START_DIALOG = 'start';
const TITLE_PROMPT = 'titlePrompt';
const TIME_PROMPT = 'timePrompt';
const TITLE_VALUE = 'title';
const TIME_VALUE = 'time';
class AddAlarmDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId, alarmsProperty) {
        super(dialogId);
        this.alarmsProperty = alarmsProperty;
        // NOTE: since waterfall steps are passed in as a function to the waterfall dialog 
        // it will be called from the context of the waterfall dialog.  With javascript/typescript
        // you need to write this function as using the lambda syntax so that it captures the context of the this pointer
        // if you don't do this, the this pointer will be incorrect for waterfall steps.
        this.initializeValuesStep = (dc, step) => __awaiter(this, void 0, void 0, function* () {
            if (step.options && step.options.alarm) {
                step.values[TITLE_VALUE] = step.options.alarm.title;
                step.values[TIME_VALUE] = step.options.alarm.time;
            }
            return yield step.next();
        });
        this.promptForTitleStep = (dc, step) => __awaiter(this, void 0, void 0, function* () {
            // Prompt for title if missing
            if (!step.values[TITLE_VALUE]) {
                return yield dc.prompt(TITLE_PROMPT, `What would you like to call your alarm?`);
            }
            else {
                return yield step.next();
            }
        });
        this.promptForTimeStep = (dc, step) => __awaiter(this, void 0, void 0, function* () {
            // Save title if prompted for
            if (step.result) {
                step.values[TITLE_VALUE] = step.result;
            }
            // Prompt for time if missing
            if (!step.values[TIME_VALUE]) {
                return yield dc.prompt(TIME_PROMPT, `What time would you like to set the "${step.values[TITLE_VALUE]}" alarm for?`);
            }
            else {
                return yield step.next();
            }
        });
        this.addAlarmStep = (dc, step) => __awaiter(this, void 0, void 0, function* () {
            // Save time if prompted for
            if (step.result) {
                step.values[TIME_VALUE] = step.result;
            }
            // Initialize alarm from values
            const alarm = {
                title: step.values[TITLE_VALUE],
                time: step.values[TIME_VALUE]
            };
            // Append to alarms list
            const alarms = yield this.alarmsProperty.get(dc.context, []);
            alarms.push(alarm);
            // Notify user of add and end dialog
            yield dc.context.sendActivity(`Your alarm named "${alarm.title}" is set for "${moment(alarm.time).format("ddd, MMM Do, h:mm a")}".`);
            return yield dc.endDialog();
        });
        // Add control flow dialogs
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(START_DIALOG, [
            this.initializeValuesStep,
            this.promptForTitleStep,
            this.promptForTimeStep,
            this.addAlarmStep
        ]));
        // Add support prompts
        this.addDialog(new titlePrompt_1.TitlePrompt(TITLE_PROMPT));
        this.addDialog(new timePrompt_1.TimePrompt(TIME_PROMPT));
    }
}
exports.AddAlarmDialog = AddAlarmDialog;
//# sourceMappingURL=addAlarmDialog.js.map