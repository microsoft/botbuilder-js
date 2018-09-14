import { Dialog, DialogContext } from 'botbuilder-dialogs';
import { Choice, findChoices } from 'botbuilder-choices';
import { TurnContext, Promiseable, Activity, CardAction, MessageFactory } from 'botbuilder';

export type ListPager<C extends TurnContext> = (dc: DialogContext<C>, filter: any, continueToken: any) => Promiseable<ListPagerResult>

export interface ListPagerResult {
    results: Partial<Activity>;
    continueToken?: any;
}


export interface ListControlOptions {
    filter: any;
    continueToken: any;
}

export interface ListControlResult {
    action?: string;
    continueToken?: any;
}

export class ListControl<C extends TurnContext> extends Dialog<C, ListControlResult, ListControlOptions> {
    private readonly actions: (string|CardAction)[];

    constructor(protected pager: ListPager<C>, actions?: (string|CardAction)[]) { 
        super();
        this.actions = actions || [{ type: 'imBack', title: 'Show More', value: 'more' }];
    }

    public beginDialog(dc: DialogContext<C>, args?: ListControlOptions): Promise<any> {
        dc.activeDialog.state = Object.assign({}, args);
        return this.showMore(dc);
    }

    public continueDialog(dc: DialogContext<C>): Promise<any> {
        // Recognize selected action
        const utterance = (dc.context.activity.text || '').trim();
        const choices = this.actions.map((a) => {
            return typeof a === 'object' ? { value: a.value, action: a } : a;
        }) as (string|Choice)[] 
        const found = findChoices(utterance, choices);

        // Check for 'more' action
        const action = found.length > 0 ? found[0].resolution.value : undefined;
        if (action === 'more') {
            return this.showMore(dc);
        } else {
            const state = dc.activeDialog.state as ListControlOptions;
            return dc.endDialog({ action: action, continueToken: state.continueToken });
        }
    }

    private showMore(dc: DialogContext<C>): Promise<any> {
        try {
            const state = dc.activeDialog.state as ListControlOptions;
            return Promise.resolve(this.pager(dc, state.filter, state.continueToken)).then((result) => {
                if (result.continueToken) {
                    // Save continuation token
                    state.continueToken = result.continueToken;

                    // Add suggested actions to results
                    const msg = Object.assign(MessageFactory.suggestedActions(this.actions), result.results);

                    // Send user the results
                    return dc.context.sendActivity(msg) as Promise<any>;
                } else if (result.results) {
                    // Send user the results and end dialog.
                    return dc.context.sendActivity(result.results)
                                     .then(() => dc.endDialog({}));
                } else {
                    // Just end the dialog
                    return dc.endDialog({});
                }
            });
        } catch(err) {
            return Promise.reject(err);
        }
    }
}
