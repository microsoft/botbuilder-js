
import { TemplateDefinitionContext, ParametersContext } from './generated/LGFileParser';
import { TerminalNode } from 'antlr4ts/tree';

export class LGTemplate {
    public Name: string;
    public Parameters: string[];
    public Source: string;
    public ParseTree: TemplateDefinitionContext;

    constructor(parseTree: TemplateDefinitionContext, source: string)
    {
        this.ParseTree = parseTree;
        this.Source = source;

        this.Name = this.ExtractName(parseTree);
        this.Parameters = this.ExtractParameters(parseTree);
    }

    private ExtractName = (parseTree: TemplateDefinitionContext) : string => {
        return  parseTree.templateNameLine().templateName().text;
    }

    private ExtractParameters = (parseTree: TemplateDefinitionContext) : string[] => {
        const parameters: ParametersContext = parseTree.templateNameLine().parameters();
        if (parameters !== undefined) {
            return parameters.IDENTIFIER().map((x: TerminalNode) => x.text);
        }
        return [];
    }
}