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
/**
 * Sends an activity or message to a user and then moves immediately to the next step within a
 * sequence.
 */
class SendActivityStep {
    constructor(activityOrText) {
        this.activityOrText = activityOrText;
    }
    getId(stepIndex) {
        // Return a unique ID.
        return 'SendActivityStep:' + stepIndex.toString();
    }
    onStep(dc, step) {
        return __awaiter(this, void 0, void 0, function* () {
            // Send activity and move to next step
            yield dc.context.sendActivity(this.activityOrText);
            return step.next();
        });
    }
}
exports.SendActivityStep = SendActivityStep;
//# sourceMappingURL=sendActivityStep.js.map