import { TurnContext } from 'botbuilder-core';
import { TurnState } from './TurnState';

export interface PredictionEngine<TState extends TurnState> {
    predictCommands(context: TurnContext, state: TState): Promise<PredictedCommand[]>;
}

export interface PredictedCommand {
    type: 'DO' | 'SAY';
}

export interface PredictedDoCommand extends PredictedCommand {
    type: 'DO';
    action: string;
    data: Record<string, any>; 
}

export interface PredictedSayCommand extends PredictedCommand {
    type: 'SAY';
    response: string;
}

