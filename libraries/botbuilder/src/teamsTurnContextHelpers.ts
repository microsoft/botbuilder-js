/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { ResourceResponse } from 'botframework-schema';
import { teamsGetTeamId } from './teamsActivityHelpers';

/**
 * Turn Context extension methods for Teams.
 */
export async function teamsSendToChannel(turnContext:TurnContext, teamsChannelId:string, activity:object) : Promise<ResourceResponse> {
    const originalConversationId = turnContext.activity.conversation.id;
    turnContext.activity.conversation.id = teamsChannelId;
    const result: ResourceResponse = await turnContext.sendActivity(activity);
    turnContext.activity.conversation.id = originalConversationId;
    return result;
}

export async function teamsSendToGeneralChannel(turnContext:TurnContext, activity:object) : Promise<ResourceResponse> {
    // The Team Id is also the Id of the general channel
    var teamId = await teamsGetTeamId(turnContext.activity);

    if (!teamId){
        throw new Error("The current Activity was not sent from a Teams Team.");
    }

    return teamsSendToChannel(turnContext, teamId, activity);
}
