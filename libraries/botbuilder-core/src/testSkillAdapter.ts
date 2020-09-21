import { Activity } from 'botframework-schema';
import { AuthenticationConstants, Claim } from 'botframework-connector';
import { TestAdapter } from './testAdapter';
import { TurnContext } from './turnContext';

export class TestSkillAdapter extends TestAdapter {
  /**
  * Creates a turn context.
  *
  * @param request An incoming request body.
  *
  * @remarks
  * Override this in a derived class to modify how the adapter creates a turn context.
  */
  protected createContext(request: Partial<Activity>): TurnContext {
    const context = new TurnContext(this, request);

    const claims: Claim[] = [
      { type: AuthenticationConstants.VersionClaim, value: '2.0' },
      { type: AuthenticationConstants.AudienceClaim, value: 'skill' },
      { type: AuthenticationConstants.AuthorizedParty, value: 'bot' },
    ];

    context.turnState.set(context.adapter.BotIdentityKey, { claims });

    return context;
  }
}