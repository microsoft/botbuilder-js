// Generated from ../LGFileParser.g4 by ANTLR 4.6-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { SwitchCaseBodyContext } from "./LGFileParser";
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
import { SwitchCaseTemplateBodyContext } from "./LGFileParser";
import { CaseConditionRuleContext } from "./LGFileParser";
import { DefaultConditionRuleContext } from "./LGFileParser";
import { SwitchStatementContext } from "./LGFileParser";
import { CaseConditionContext } from "./LGFileParser";
import { DefaultConditionContext } from "./LGFileParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `LGFileParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface LGFileParserVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `switchCaseBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSwitchCaseBody?: (ctx: SwitchCaseBodyContext) => Result;

	/**
	 * Visit a parse tree produced by the `normalBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNormalBody?: (ctx: NormalBodyContext) => Result;

	/**
	 * Visit a parse tree produced by the `conditionalBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConditionalBody?: (ctx: ConditionalBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.file`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFile?: (ctx: FileContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.paragraph`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParagraph?: (ctx: ParagraphContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.newline`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNewline?: (ctx: NewlineContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.templateDefinition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemplateDefinition?: (ctx: TemplateDefinitionContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.templateNameLine`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemplateNameLine?: (ctx: TemplateNameLineContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.templateName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemplateName?: (ctx: TemplateNameContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.parameters`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParameters?: (ctx: ParametersContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemplateBody?: (ctx: TemplateBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.normalTemplateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNormalTemplateBody?: (ctx: NormalTemplateBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.normalTemplateString`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNormalTemplateString?: (ctx: NormalTemplateStringContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.conditionalTemplateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConditionalTemplateBody?: (ctx: ConditionalTemplateBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.ifConditionRule`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIfConditionRule?: (ctx: IfConditionRuleContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.ifCondition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIfCondition?: (ctx: IfConditionContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.switchCaseTemplateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSwitchCaseTemplateBody?: (ctx: SwitchCaseTemplateBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.caseConditionRule`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCaseConditionRule?: (ctx: CaseConditionRuleContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.defaultConditionRule`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDefaultConditionRule?: (ctx: DefaultConditionRuleContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.switchStatement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSwitchStatement?: (ctx: SwitchStatementContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.caseCondition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCaseCondition?: (ctx: CaseConditionContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.defaultCondition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDefaultCondition?: (ctx: DefaultConditionContext) => Result;
}

