import { Middleware, TurnContext, ResourceResponse } from "botbuilder-core";

export class DialogTestLogger implements Middleware {

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {

        // log incoming
        console.log('> ', context.activity.text);

        context.onSendActivities(async(context, activities, next): Promise<ResourceResponse[]> => {
            // deliver
            activities.forEach((activity) => {
                console.log('< ', activity.text);
            });
            return next();
        });

        await next();

    }

}