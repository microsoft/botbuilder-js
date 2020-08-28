
import { StringExpressionConverter, IntExpressionConverter, NumberExpressionConverter, BoolExpressionConverter, ArrayExpressionConverter, ObjectExpressionConverter, EnumExpressionConverter } from 'adaptive-expressions';
import { ComponentRegistration, BuilderRegistration, DefaultTypeBuilder, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { QnAMakerRecognizer } from './qnaMakerRecognizer';
import { QnAMakerDialog, QnAMakerDialogActivityConverter } from './qnaMakerDialog';
import { RankerTypes } from './qnamaker-interfaces/rankerTypes';

export class QnAMakerComponentRegistration implements ComponentRegistration {
    public getBuilderRegistrations(resourceExplorer: ResourceExplorer): BuilderRegistration[] {
        return [{
            kind: 'Microsoft.QnAMakerRecognizer',
            builder: new DefaultTypeBuilder(QnAMakerRecognizer, resourceExplorer, {
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
            })
        }, {
            kind: 'Microsoft.QnAMakerDialog',
            builder: new DefaultTypeBuilder(QnAMakerDialog, resourceExplorer, {
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
            })
        }
        ];
    }
}