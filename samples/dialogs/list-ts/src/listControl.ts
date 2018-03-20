import { Dialog, DialogContext } from 'botbuilder-dialogs';
import { Choice, findChoices } from 'botbuilder-choices';
import { BotContext, Promiseable, Activity, CardAction, MessageFactory } from 'botbuilder';

export type ListPager<C extends BotContext> = (dc: DialogContext<C>, filter: any, continueToken: any) => Promiseable<ListPagerResult>

export interface ListPagerResult {
    results: Partial<Activity>;
    continueToken?: any;
}


export interface ListControlArgs {
    filter: any;
    continueToken: any;
}

export interface ListControlResult {
    action?: string;
    continueToken?: any;
}

export class ListControl<C extends BotContext> implements Dialog<C> {
    private _actions: (string|CardAction)[] = [{ type: 'imBack', title: 'Show More', value: 'more' }];

    constructor(protected pager: ListPager<C>) { }

    public get actions(): (string|Choice)[] {
        return this._actions;
    }

    public begin(dc: DialogContext<C>, args?: ListControlArgs): Promise<any> {
        dc.instance.state = Object.assign({}, args);
        return this.showMore(dc);
    }

    public continue(dc: DialogContext<C>): Promise<any> {
        // Recognize selected action
        const utterance = (dc.context.request.text || '').trim();
        const choices = this.actions.map((a) => {
            return typeof a === 'object' ? { value: a.value, action: a } : a;
        }) as (string|Choice)[] 
        const found = findChoices(utterance, choices);

        // Check for 'more' action
        const action = found.length > 0 ? found[0].resolution.value : undefined;
        if (action === 'more') {
            return this.showMore(dc);
        } else {
            const state = dc.instance.state as ListControlArgs;
            return dc.end({ action: action, continueToken: state.continueToken });
        }
    }

    private showMore(dc: DialogContext<C>): Promise<any> {
        try {
            const state = dc.instance.state as ListControlArgs;
            return Promise.resolve(this.pager(dc, state.filter, state.continueToken)).then((result) => {
                if (result.continueToken) {
                    // Save continuation token
                    state.continueToken = result.continueToken;

                    // Add suggested actions to results
                    const msg = Object.assign(MessageFactory.suggestedActions(this._actions), result.results);

                    // Send user the results
                    return dc.context.sendActivity(msg) as Promise<any>;
                } else if (result.results) {
                    // Send user the results and end dialog.
                    return dc.context.sendActivity(result.results)
                                     .then(() => dc.end({}));
                } else {
                    // Just end the dialog
                    return dc.end({});
                }
            });
        } catch(err) {
            return Promise.reject(err);
        }
    }
}
