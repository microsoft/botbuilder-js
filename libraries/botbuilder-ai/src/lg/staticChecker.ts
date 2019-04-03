import { AbstractParseTreeVisitor } from 'antlr4ts/tree';
import { LGReportMessage, LGReportMessageType } from './exception';
import * as lp from './lGFileParser';
import { LGFileParserVisitor } from './LGFileParserVisitor';
import { EvaluationContext } from './templateEngine';

// tslint:disable-next-line: completed-docs
export class StaticChecker extends AbstractParseTreeVisitor<LGReportMessage[]> implements LGFileParserVisitor<LGReportMessage[]> {
    public readonly Context:  EvaluationContext;
    constructor(context: EvaluationContext) {
        super();
        this.Context = context;
    }

    public Check(): LGReportMessage[] {
        let result: LGReportMessage[] = [];
        if (this.Context.TemplateContexts === undefined || this.Context.TemplateContexts.size <= 0) {
            result.push(new LGReportMessage(`File must have at least one template definition`, LGReportMessageType.Warning));
        } else {
            this.Context.TemplateContexts.forEach(template => {
                result = result.concat(this.visit(template));
            });
        }

        return result;
    }

    public visitTemplateDefinition(context: lp.TemplateDefinitionContext): LGReportMessage[] {
        return [];
    }

    public visitNormalTemplateBody(context: lp.NormalTemplateBodyContext): LGReportMessage[] {
        return [];
    }

    public visitConditionalBody(context: lp.ConditionalBodyContext): LGReportMessage[] {
        return [];
    }

    public visitNormalTemplateString(context: lp.NormalTemplateStringContext): LGReportMessage[] {
        return [];
    }

    protected defaultResult(): LGReportMessage[] {
        return [];
    }
}
