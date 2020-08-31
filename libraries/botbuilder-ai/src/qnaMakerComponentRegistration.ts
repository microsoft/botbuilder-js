
import { StringExpressionConverter, IntExpressionConverter, NumberExpressionConverter, BoolExpressionConverter, ArrayExpressionConverter, ObjectExpressionConverter, EnumExpressionConverter } from 'adaptive-expressions';
import { QnAMakerRecognizer } from './qnaMakerRecognizer';
import { QnAMakerDialog, QnAMakerDialogActivityConverter } from './qnaMakerDialog';
import { RankerTypes } from './qnamaker-interfaces/rankerTypes';

/**
 * Declarative components in QnAMaker.
 */
export class QnAMakerComponentRegistration {
    public getDeclarativeTypes(_resourceExplorer: any) {
        return [{
            kind: 'Microsoft.QnAMakerRecognizer',
            factory: QnAMakerRecognizer,
            converters: {
                'knowledgeBaseId': new StringExpressionConverter(),
                'hostname': new StringExpressionConverter(),
                'endpointKey': new StringExpressionConverter(),
                'top': new IntExpressionConverter(),
                'threshold': new NumberExpressionConverter(),
                'rankerType': new StringExpressionConverter(),
                'includeDialogNameInMetadata': new BoolExpressionConverter(),
                'metadata': new ArrayExpressionConverter(),
                'context': new ObjectExpressionConverter(),
                'qnaId': new IntExpressionConverter()
            }
        }, {
            kind: 'Microsoft.QnAMakerDialog',
            factory: QnAMakerDialog,
            converters: {
                'knowledgeBaseId': new StringExpressionConverter(),
                'hostname': new StringExpressionConverter(),
                'endpointKey': new StringExpressionConverter(),
                'threshold': new NumberExpressionConverter(),
                'top': new IntExpressionConverter(),
                'noAnswer': new QnAMakerDialogActivityConverter(),
                'activeLearningCardTitle': new StringExpressionConverter(),
                'cardNoMatchText': new StringExpressionConverter(),
                'cardNoMatchResponse': new QnAMakerDialogActivityConverter(),
                'strictFilters': new ArrayExpressionConverter(),
                'logPersonalInformation': new BoolExpressionConverter(),
                'rankerType': new EnumExpressionConverter(RankerTypes)
            }
        }];
    }
}