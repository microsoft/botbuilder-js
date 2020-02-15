import {IUserTokenProvider} from './userTokenProvider'
import { TurnContext } from './turnContext';
import { TokenResponse } from 'botframework-schema';
import {BotSignInGetSignInResourceResponse, TokenExchangeRequest} from 'botframework-connector'

export interface IExtendedUserTokenProvider extends IUserTokenProvider{
    getSignInResource(context: TurnContext, connectionName: string): Promise<BotSignInGetSignInResourceResponse>;
    getSignInResource(context: TurnContext, connectionName: string, userId: string, finalRedirect?: string): Promise<BotSignInGetSignInResourceResponse>;
    // one more overload of getSignInResource with AppCredentials
    exchangeToken(context: TurnContext, connectionName: string, userId: string, tokenExchangeRequest: TokenExchangeRequest): Promise<TokenResponse>;
    //overload of exchangeToken with AppCredentials
}