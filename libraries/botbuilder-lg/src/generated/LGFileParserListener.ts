// Generated from LGFileParser.g4 by ANTLR 4.7.3-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { NormalBodyContext } from "./LGFileParser";
import { IfElseBodyContext } from "./LGFileParser";
import { SwitchCaseBodyContext } from "./LGFileParser";
import { StructuredBodyContext } from "./LGFileParser";
import { FileContext } from "./LGFileParser";
import { ParagraphContext } from "./LGFileParser";
import { ErrorTemplateContext } from "./LGFileParser";
import { TemplateDefinitionContext } from "./LGFileParser";
import { TemplateNameLineContext } from "./LGFileParser";
import { ErrorTemplateNameContext } from "./LGFileParser";
import { TemplateNameContext } from "./LGFileParser";
import { ParametersContext } from "./LGFileParser";
import { TemplateBodyContext } from "./LGFileParser";
import { StructuredTemplateBodyContext } from "./LGFileParser";
import { StructuredBodyNameLineContext } from "./LGFileParser";
import { ErrorStructuredNameContext } from "./LGFileParser";
import { StructuredBodyContentLineContext } from "./LGFileParser";
import { ErrorStructureLineContext } from "./LGFileParser";
import { KeyValueStructureLineContext } from "./LGFileParser";
import { KeyValueStructureValueContext } from "./LGFileParser";
import { ObjectStructureLineContext } from "./LGFileParser";
import { StructuredBodyEndLineContext } from "./LGFileParser";
import { NormalTemplateBodyContext } from "./LGFileParser";
import { TemplateStringContext } from "./LGFileParser";
import { NormalTemplateStringContext } from "./LGFileParser";
import { ErrorTemplateStringContext } from "./LGFileParser";
import { IfElseTemplateBodyContext } from "./LGFileParser";
import { IfConditionRuleContext } from "./LGFileParser";
import { IfConditionContext } from "./LGFileParser";
import { SwitchCaseTemplateBodyContext } from "./LGFileParser";
import { SwitchCaseRuleContext } from "./LGFileParser";
import { SwitchCaseStatContext } from "./LGFileParser";
import { ImportDefinitionContext } from "./LGFileParser";


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
	 * Enter a parse tree produced by the `ifElseBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 */
	enterIfElseBody?: (ctx: IfElseBodyContext) => void;
	/**
	 * Exit a parse tree produced by the `ifElseBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 */
	exitIfElseBody?: (ctx: IfElseBodyContext) => void;

	/**
	 * Enter a parse tree produced by the `switchCaseBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 */
	enterSwitchCaseBody?: (ctx: SwitchCaseBodyContext) => void;
	/**
	 * Exit a parse tree produced by the `switchCaseBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 */
	exitSwitchCaseBody?: (ctx: SwitchCaseBodyContext) => void;

	/**
	 * Enter a parse tree produced by the `structuredBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 */
	enterStructuredBody?: (ctx: StructuredBodyContext) => void;
	/**
	 * Exit a parse tree produced by the `structuredBody`
	 * labeled alternative in `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 */
	exitStructuredBody?: (ctx: StructuredBodyContext) => void;

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
	 * Enter a parse tree produced by `LGFileParser.errorTemplate`.
	 * @param ctx the parse tree
	 */
	enterErrorTemplate?: (ctx: ErrorTemplateContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.errorTemplate`.
	 * @param ctx the parse tree
	 */
	exitErrorTemplate?: (ctx: ErrorTemplateContext) => void;

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
	 * Enter a parse tree produced by `LGFileParser.errorTemplateName`.
	 * @param ctx the parse tree
	 */
	enterErrorTemplateName?: (ctx: ErrorTemplateNameContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.errorTemplateName`.
	 * @param ctx the parse tree
	 */
	exitErrorTemplateName?: (ctx: ErrorTemplateNameContext) => void;

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
	 * Enter a parse tree produced by `LGFileParser.structuredTemplateBody`.
	 * @param ctx the parse tree
	 */
	enterStructuredTemplateBody?: (ctx: StructuredTemplateBodyContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.structuredTemplateBody`.
	 * @param ctx the parse tree
	 */
	exitStructuredTemplateBody?: (ctx: StructuredTemplateBodyContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.structuredBodyNameLine`.
	 * @param ctx the parse tree
	 */
	enterStructuredBodyNameLine?: (ctx: StructuredBodyNameLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.structuredBodyNameLine`.
	 * @param ctx the parse tree
	 */
	exitStructuredBodyNameLine?: (ctx: StructuredBodyNameLineContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.errorStructuredName`.
	 * @param ctx the parse tree
	 */
	enterErrorStructuredName?: (ctx: ErrorStructuredNameContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.errorStructuredName`.
	 * @param ctx the parse tree
	 */
	exitErrorStructuredName?: (ctx: ErrorStructuredNameContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.structuredBodyContentLine`.
	 * @param ctx the parse tree
	 */
	enterStructuredBodyContentLine?: (ctx: StructuredBodyContentLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.structuredBodyContentLine`.
	 * @param ctx the parse tree
	 */
	exitStructuredBodyContentLine?: (ctx: StructuredBodyContentLineContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.errorStructureLine`.
	 * @param ctx the parse tree
	 */
	enterErrorStructureLine?: (ctx: ErrorStructureLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.errorStructureLine`.
	 * @param ctx the parse tree
	 */
	exitErrorStructureLine?: (ctx: ErrorStructureLineContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.keyValueStructureLine`.
	 * @param ctx the parse tree
	 */
	enterKeyValueStructureLine?: (ctx: KeyValueStructureLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.keyValueStructureLine`.
	 * @param ctx the parse tree
	 */
	exitKeyValueStructureLine?: (ctx: KeyValueStructureLineContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.keyValueStructureValue`.
	 * @param ctx the parse tree
	 */
	enterKeyValueStructureValue?: (ctx: KeyValueStructureValueContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.keyValueStructureValue`.
	 * @param ctx the parse tree
	 */
	exitKeyValueStructureValue?: (ctx: KeyValueStructureValueContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.objectStructureLine`.
	 * @param ctx the parse tree
	 */
	enterObjectStructureLine?: (ctx: ObjectStructureLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.objectStructureLine`.
	 * @param ctx the parse tree
	 */
	exitObjectStructureLine?: (ctx: ObjectStructureLineContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.structuredBodyEndLine`.
	 * @param ctx the parse tree
	 */
	enterStructuredBodyEndLine?: (ctx: StructuredBodyEndLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.structuredBodyEndLine`.
	 * @param ctx the parse tree
	 */
	exitStructuredBodyEndLine?: (ctx: StructuredBodyEndLineContext) => void;

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
	 * Enter a parse tree produced by `LGFileParser.templateString`.
	 * @param ctx the parse tree
	 */
	enterTemplateString?: (ctx: TemplateStringContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.templateString`.
	 * @param ctx the parse tree
	 */
	exitTemplateString?: (ctx: TemplateStringContext) => void;

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
	 * Enter a parse tree produced by `LGFileParser.errorTemplateString`.
	 * @param ctx the parse tree
	 */
	enterErrorTemplateString?: (ctx: ErrorTemplateStringContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.errorTemplateString`.
	 * @param ctx the parse tree
	 */
	exitErrorTemplateString?: (ctx: ErrorTemplateStringContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.ifElseTemplateBody`.
	 * @param ctx the parse tree
	 */
	enterIfElseTemplateBody?: (ctx: IfElseTemplateBodyContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.ifElseTemplateBody`.
	 * @param ctx the parse tree
	 */
	exitIfElseTemplateBody?: (ctx: IfElseTemplateBodyContext) => void;

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

	/**
	 * Enter a parse tree produced by `LGFileParser.switchCaseTemplateBody`.
	 * @param ctx the parse tree
	 */
	enterSwitchCaseTemplateBody?: (ctx: SwitchCaseTemplateBodyContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.switchCaseTemplateBody`.
	 * @param ctx the parse tree
	 */
	exitSwitchCaseTemplateBody?: (ctx: SwitchCaseTemplateBodyContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.switchCaseRule`.
	 * @param ctx the parse tree
	 */
	enterSwitchCaseRule?: (ctx: SwitchCaseRuleContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.switchCaseRule`.
	 * @param ctx the parse tree
	 */
	exitSwitchCaseRule?: (ctx: SwitchCaseRuleContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.switchCaseStat`.
	 * @param ctx the parse tree
	 */
	enterSwitchCaseStat?: (ctx: SwitchCaseStatContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.switchCaseStat`.
	 * @param ctx the parse tree
	 */
	exitSwitchCaseStat?: (ctx: SwitchCaseStatContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.importDefinition`.
	 * @param ctx the parse tree
	 */
	enterImportDefinition?: (ctx: ImportDefinitionContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.importDefinition`.
	 * @param ctx the parse tree
	 */
	exitImportDefinition?: (ctx: ImportDefinitionContext) => void;
}

