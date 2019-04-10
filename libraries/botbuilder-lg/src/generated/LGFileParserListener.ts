// Generated from LGFileParser.g4 by ANTLR 4.6-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { NormalBodyContext } from "./LGFileParser";
import { ConditionalBodyContext } from "./LGFileParser";
import { FileContext } from "./LGFileParser";
import { ParagraphContext } from "./LGFileParser";
import { NewlineContext } from "./LGFileParser";
import { TemplateDefinitionContext } from "./LGFileParser";
import { TemplateNameLineContext } from "./LGFileParser";
import { TemplateNameContext } from "./LGFileParser";
import { ParametersContext } from "./LGFileParser";
import { TemplateBodyContext } from "./LGFileParser";
import { NormalTemplateBodyContext } from "./LGFileParser";
import { NormalTemplateStringContext } from "./LGFileParser";
import { ConditionalTemplateBodyContext } from "./LGFileParser";
import { IfConditionRuleContext } from "./LGFileParser";
import { IfConditionContext } from "./LGFileParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `LGFileParser`.
 */
export interface LGFileParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `normalBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 */
	enterNormalBody?: (ctx: NormalBodyContext) => void;
	/**
	 * Exit a parse tree produced by the `normalBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 */
	exitNormalBody?: (ctx: NormalBodyContext) => void;

	/**
	 * Enter a parse tree produced by the `conditionalBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 */
	enterConditionalBody?: (ctx: ConditionalBodyContext) => void;
	/**
	 * Exit a parse tree produced by the `conditionalBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 */
	exitConditionalBody?: (ctx: ConditionalBodyContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.file`.
	 * @param ctx the parse tree
	 */
	enterFile?: (ctx: FileContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.file`.
	 * @param ctx the parse tree
	 */
	exitFile?: (ctx: FileContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.paragraph`.
	 * @param ctx the parse tree
	 */
	enterParagraph?: (ctx: ParagraphContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.paragraph`.
	 * @param ctx the parse tree
	 */
	exitParagraph?: (ctx: ParagraphContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.newline`.
	 * @param ctx the parse tree
	 */
	enterNewline?: (ctx: NewlineContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.newline`.
	 * @param ctx the parse tree
	 */
	exitNewline?: (ctx: NewlineContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.templateDefinition`.
	 * @param ctx the parse tree
	 */
	enterTemplateDefinition?: (ctx: TemplateDefinitionContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.templateDefinition`.
	 * @param ctx the parse tree
	 */
	exitTemplateDefinition?: (ctx: TemplateDefinitionContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.templateNameLine`.
	 * @param ctx the parse tree
	 */
	enterTemplateNameLine?: (ctx: TemplateNameLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.templateNameLine`.
	 * @param ctx the parse tree
	 */
	exitTemplateNameLine?: (ctx: TemplateNameLineContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.templateName`.
	 * @param ctx the parse tree
	 */
	enterTemplateName?: (ctx: TemplateNameContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.templateName`.
	 * @param ctx the parse tree
	 */
	exitTemplateName?: (ctx: TemplateNameContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.parameters`.
	 * @param ctx the parse tree
	 */
	enterParameters?: (ctx: ParametersContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.parameters`.
	 * @param ctx the parse tree
	 */
	exitParameters?: (ctx: ParametersContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 */
	enterTemplateBody?: (ctx: TemplateBodyContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 */
	exitTemplateBody?: (ctx: TemplateBodyContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.normalTemplateBody`.
	 * @param ctx the parse tree
	 */
	enterNormalTemplateBody?: (ctx: NormalTemplateBodyContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.normalTemplateBody`.
	 * @param ctx the parse tree
	 */
	exitNormalTemplateBody?: (ctx: NormalTemplateBodyContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.normalTemplateString`.
	 * @param ctx the parse tree
	 */
	enterNormalTemplateString?: (ctx: NormalTemplateStringContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.normalTemplateString`.
	 * @param ctx the parse tree
	 */
	exitNormalTemplateString?: (ctx: NormalTemplateStringContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.conditionalTemplateBody`.
	 * @param ctx the parse tree
	 */
	enterConditionalTemplateBody?: (ctx: ConditionalTemplateBodyContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.conditionalTemplateBody`.
	 * @param ctx the parse tree
	 */
	exitConditionalTemplateBody?: (ctx: ConditionalTemplateBodyContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.ifConditionRule`.
	 * @param ctx the parse tree
	 */
	enterIfConditionRule?: (ctx: IfConditionRuleContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.ifConditionRule`.
	 * @param ctx the parse tree
	 */
	exitIfConditionRule?: (ctx: IfConditionRuleContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.ifCondition`.
	 * @param ctx the parse tree
	 */
	enterIfCondition?: (ctx: IfConditionContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.ifCondition`.
	 * @param ctx the parse tree
	 */
	exitIfCondition?: (ctx: IfConditionContext) => void;
}

