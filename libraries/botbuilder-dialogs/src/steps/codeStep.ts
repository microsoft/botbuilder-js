import { DialogContext } from '../dialogContext';
import { SequenceStep, SequenceStepContext } from '../sequence';

export type CodeStepHandler = (dc: DialogContext, step: SequenceStepContext) => Promise<void>;

export class CodeStep implements SequenceStep {
    private readonly handler: CodeStepHandler;

    constructor (idOrHandler: string|CodeStepHandler, handler?: CodeStepHandler) {
        if (typeof idOrHandler === 'string') {
            this.id = idOrHandler;
            this.handler = handler;
        } else {
            this.handler = idOrHandler;
        }
    }

    public readonly id: string|undefined;

    public async onStep(dc: DialogContext, step: SequenceStepContext): Promise<void> {
        await this.handler(dc, step);
    }
}
