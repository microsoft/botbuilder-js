import { DialogContext } from './dialogContext';
import { DialogInstance } from './dialog';

/**
 * An Error that includes extra dialog context, including the dialog stack
 */
export class DialogContextError extends Error {
    public readonly dialogContext: {
        activeDialog: string;
        parent?: string;
        stack: DialogInstance[];
    };

    /**
     * Construct a DialogError
     * @param error Source error
     * @param dialogContext Dialog context that is the source of the error
     */
    constructor(source: Error | string, dialogContext: DialogContext) {
        super(source instanceof Error ? source.message : source);

        this.name = 'DialogContextError';

        if (source instanceof Error) {
            this.message = source.message;
            this.stack = source.stack;
        } else {
            this.message = source;
        }

        this.dialogContext = {
            activeDialog: dialogContext.activeDialog.id,
            parent: dialogContext.parent ? dialogContext.parent.activeDialog.id : null,
            stack: dialogContext.stack,
        };
    }
}