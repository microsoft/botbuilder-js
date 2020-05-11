// Generated from src/LGTemplateParser.g4 by ANTLR 4.7.3-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { NormalBodyContext } from "./LGTemplateParser";
import { IfElseBodyContext } from "./LGTemplateParser";
import { SwitchCaseBodyContext } from "./LGTemplateParser";
import { StructuredBodyContext } from "./LGTemplateParser";
import { TemplateContext } from "./LGTemplateParser";
import { BodyContext } from "./LGTemplateParser";
import { StructuredTemplateBodyContext } from "./LGTemplateParser";
import { StructuredBodyNameLineContext } from "./LGTemplateParser";
import { ErrorStructuredNameContext } from "./LGTemplateParser";
import { StructuredBodyContentLineContext } from "./LGTemplateParser";
import { ErrorStructureLineContext } from "./LGTemplateParser";
import { KeyValueStructureLineContext } from "./LGTemplateParser";
import { KeyValueStructureValueContext } from "./LGTemplateParser";
import { ObjectStructureLineContext } from "./LGTemplateParser";
import { StructuredBodyEndLineContext } from "./LGTemplateParser";
import { NormalTemplateBodyContext } from "./LGTemplateParser";
import { TemplateStringContext } from "./LGTemplateParser";
import { NormalTemplateStringContext } from "./LGTemplateParser";
import { ErrorTemplateStringContext } from "./LGTemplateParser";
import { IfElseTemplateBodyContext } from "./LGTemplateParser";
import { IfConditionRuleContext } from "./LGTemplateParser";
import { IfConditionContext } from "./LGTemplateParser";
import { SwitchCaseTemplateBodyContext } from "./LGTemplateParser";
import { SwitchCaseRuleContext } from "./LGTemplateParser";
import { SwitchCaseStatContext } from "./LGTemplateParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `LGTemplateParser`.
 */
export interface LGTemplateParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `normalBody`
	 * labeled alternative in `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 */
	enterNormalBody?: (ctx: NormalBodyContext) => void;
	/**
	 * Exit a parse tree produced by the `normalBody`
	 * labeled alternative in `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 */
	exitNormalBody?: (ctx: NormalBodyContext) => void;

	/**
	 * Enter a parse tree produced by the `ifElseBody`
	 * labeled alternative in `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 */
	enterIfElseBody?: (ctx: IfElseBodyContext) => void;
	/**
	 * Exit a parse tree produced by the `ifElseBody`
	 * labeled alternative in `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 */
	exitIfElseBody?: (ctx: IfElseBodyContext) => void;

	/**
	 * Enter a parse tree produced by the `switchCaseBody`
	 * labeled alternative in `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 */
	enterSwitchCaseBody?: (ctx: SwitchCaseBodyContext) => void;
	/**
	 * Exit a parse tree produced by the `switchCaseBody`
	 * labeled alternative in `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 */
	exitSwitchCaseBody?: (ctx: SwitchCaseBodyContext) => void;

	/**
	 * Enter a parse tree produced by the `structuredBody`
	 * labeled alternative in `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 */
	enterStructuredBody?: (ctx: StructuredBodyContext) => void;
	/**
	 * Exit a parse tree produced by the `structuredBody`
	 * labeled alternative in `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 */
	exitStructuredBody?: (ctx: StructuredBodyContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.template`.
	 * @param ctx the parse tree
	 */
	enterTemplate?: (ctx: TemplateContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.template`.
	 * @param ctx the parse tree
	 */
	exitTemplate?: (ctx: TemplateContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 */
	enterBody?: (ctx: BodyContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 */
	exitBody?: (ctx: BodyContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.structuredTemplateBody`.
	 * @param ctx the parse tree
	 */
	enterStructuredTemplateBody?: (ctx: StructuredTemplateBodyContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.structuredTemplateBody`.
	 * @param ctx the parse tree
	 */
	exitStructuredTemplateBody?: (ctx: StructuredTemplateBodyContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.structuredBodyNameLine`.
	 * @param ctx the parse tree
	 */
	enterStructuredBodyNameLine?: (ctx: StructuredBodyNameLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.structuredBodyNameLine`.
	 * @param ctx the parse tree
	 */
	exitStructuredBodyNameLine?: (ctx: StructuredBodyNameLineContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.errorStructuredName`.
	 * @param ctx the parse tree
	 */
	enterErrorStructuredName?: (ctx: ErrorStructuredNameContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.errorStructuredName`.
	 * @param ctx the parse tree
	 */
	exitErrorStructuredName?: (ctx: ErrorStructuredNameContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.structuredBodyContentLine`.
	 * @param ctx the parse tree
	 */
	enterStructuredBodyContentLine?: (ctx: StructuredBodyContentLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.structuredBodyContentLine`.
	 * @param ctx the parse tree
	 */
	exitStructuredBodyContentLine?: (ctx: StructuredBodyContentLineContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.errorStructureLine`.
	 * @param ctx the parse tree
	 */
	enterErrorStructureLine?: (ctx: ErrorStructureLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.errorStructureLine`.
	 * @param ctx the parse tree
	 */
	exitErrorStructureLine?: (ctx: ErrorStructureLineContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.keyValueStructureLine`.
	 * @param ctx the parse tree
	 */
	enterKeyValueStructureLine?: (ctx: KeyValueStructureLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.keyValueStructureLine`.
	 * @param ctx the parse tree
	 */
	exitKeyValueStructureLine?: (ctx: KeyValueStructureLineContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.keyValueStructureValue`.
	 * @param ctx the parse tree
	 */
	enterKeyValueStructureValue?: (ctx: KeyValueStructureValueContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.keyValueStructureValue`.
	 * @param ctx the parse tree
	 */
	exitKeyValueStructureValue?: (ctx: KeyValueStructureValueContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.objectStructureLine`.
	 * @param ctx the parse tree
	 */
	enterObjectStructureLine?: (ctx: ObjectStructureLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.objectStructureLine`.
	 * @param ctx the parse tree
	 */
	exitObjectStructureLine?: (ctx: ObjectStructureLineContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.structuredBodyEndLine`.
	 * @param ctx the parse tree
	 */
	enterStructuredBodyEndLine?: (ctx: StructuredBodyEndLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.structuredBodyEndLine`.
	 * @param ctx the parse tree
	 */
	exitStructuredBodyEndLine?: (ctx: StructuredBodyEndLineContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.normalTemplateBody`.
	 * @param ctx the parse tree
	 */
	enterNormalTemplateBody?: (ctx: NormalTemplateBodyContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.normalTemplateBody`.
	 * @param ctx the parse tree
	 */
	exitNormalTemplateBody?: (ctx: NormalTemplateBodyContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.templateString`.
	 * @param ctx the parse tree
	 */
	enterTemplateString?: (ctx: TemplateStringContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.templateString`.
	 * @param ctx the parse tree
	 */
	exitTemplateString?: (ctx: TemplateStringContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.normalTemplateString`.
	 * @param ctx the parse tree
	 */
	enterNormalTemplateString?: (ctx: NormalTemplateStringContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.normalTemplateString`.
	 * @param ctx the parse tree
	 */
	exitNormalTemplateString?: (ctx: NormalTemplateStringContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.errorTemplateString`.
	 * @param ctx the parse tree
	 */
	enterErrorTemplateString?: (ctx: ErrorTemplateStringContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.errorTemplateString`.
	 * @param ctx the parse tree
	 */
	exitErrorTemplateString?: (ctx: ErrorTemplateStringContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.ifElseTemplateBody`.
	 * @param ctx the parse tree
	 */
	enterIfElseTemplateBody?: (ctx: IfElseTemplateBodyContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.ifElseTemplateBody`.
	 * @param ctx the parse tree
	 */
	exitIfElseTemplateBody?: (ctx: IfElseTemplateBodyContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.ifConditionRule`.
	 * @param ctx the parse tree
	 */
	enterIfConditionRule?: (ctx: IfConditionRuleContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.ifConditionRule`.
	 * @param ctx the parse tree
	 */
	exitIfConditionRule?: (ctx: IfConditionRuleContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.ifCondition`.
	 * @param ctx the parse tree
	 */
	enterIfCondition?: (ctx: IfConditionContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.ifCondition`.
	 * @param ctx the parse tree
	 */
	exitIfCondition?: (ctx: IfConditionContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.switchCaseTemplateBody`.
	 * @param ctx the parse tree
	 */
	enterSwitchCaseTemplateBody?: (ctx: SwitchCaseTemplateBodyContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.switchCaseTemplateBody`.
	 * @param ctx the parse tree
	 */
	exitSwitchCaseTemplateBody?: (ctx: SwitchCaseTemplateBodyContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.switchCaseRule`.
	 * @param ctx the parse tree
	 */
	enterSwitchCaseRule?: (ctx: SwitchCaseRuleContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.switchCaseRule`.
	 * @param ctx the parse tree
	 */
	exitSwitchCaseRule?: (ctx: SwitchCaseRuleContext) => void;

	/**
	 * Enter a parse tree produced by `LGTemplateParser.switchCaseStat`.
	 * @param ctx the parse tree
	 */
	enterSwitchCaseStat?: (ctx: SwitchCaseStatContext) => void;
	/**
	 * Exit a parse tree produced by `LGTemplateParser.switchCaseStat`.
	 * @param ctx the parse tree
	 */
	exitSwitchCaseStat?: (ctx: SwitchCaseStatContext) => void;
}

