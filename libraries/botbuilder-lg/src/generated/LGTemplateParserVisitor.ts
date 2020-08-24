// Generated from src/LGTemplateParser.g4 by ANTLR 4.7.3-SNAPSHOT

/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ParseTreeVisitor } from 'antlr4ts/tree/ParseTreeVisitor';

import { NormalBodyContext } from './LGTemplateParser';
import { IfElseBodyContext } from './LGTemplateParser';
import { SwitchCaseBodyContext } from './LGTemplateParser';
import { StructuredBodyContext } from './LGTemplateParser';
import { TemplateContext } from './LGTemplateParser';
import { BodyContext } from './LGTemplateParser';
import { StructuredTemplateBodyContext } from './LGTemplateParser';
import { StructuredBodyNameLineContext } from './LGTemplateParser';
import { ErrorStructuredNameContext } from './LGTemplateParser';
import { StructuredBodyContentLineContext } from './LGTemplateParser';
import { ErrorStructureLineContext } from './LGTemplateParser';
import { KeyValueStructureLineContext } from './LGTemplateParser';
import { KeyValueStructureValueContext } from './LGTemplateParser';
import { StructuredBodyEndLineContext } from './LGTemplateParser';
import { NormalTemplateBodyContext } from './LGTemplateParser';
import { TemplateStringContext } from './LGTemplateParser';
import { NormalTemplateStringContext } from './LGTemplateParser';
import { ErrorTemplateStringContext } from './LGTemplateParser';
import { IfElseTemplateBodyContext } from './LGTemplateParser';
import { IfConditionRuleContext } from './LGTemplateParser';
import { IfConditionContext } from './LGTemplateParser';
import { SwitchCaseTemplateBodyContext } from './LGTemplateParser';
import { SwitchCaseRuleContext } from './LGTemplateParser';
import { SwitchCaseStatContext } from './LGTemplateParser';
import { ExpressionContext } from './LGTemplateParser';
import { ExpressionInStructureContext } from './LGTemplateParser';


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `LGTemplateParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface LGTemplateParserVisitor<Result> extends ParseTreeVisitor<Result> {
    /**
	 * Visit a parse tree produced by the `normalBody`
	 * labeled alternative in `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitNormalBody?: (ctx: NormalBodyContext) => Result;

    /**
	 * Visit a parse tree produced by the `ifElseBody`
	 * labeled alternative in `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitIfElseBody?: (ctx: IfElseBodyContext) => Result;

    /**
	 * Visit a parse tree produced by the `switchCaseBody`
	 * labeled alternative in `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitSwitchCaseBody?: (ctx: SwitchCaseBodyContext) => Result;

    /**
	 * Visit a parse tree produced by the `structuredBody`
	 * labeled alternative in `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitStructuredBody?: (ctx: StructuredBodyContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.template`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitTemplate?: (ctx: TemplateContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.body`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitBody?: (ctx: BodyContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.structuredTemplateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitStructuredTemplateBody?: (ctx: StructuredTemplateBodyContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.structuredBodyNameLine`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitStructuredBodyNameLine?: (ctx: StructuredBodyNameLineContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.errorStructuredName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitErrorStructuredName?: (ctx: ErrorStructuredNameContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.structuredBodyContentLine`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitStructuredBodyContentLine?: (ctx: StructuredBodyContentLineContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.errorStructureLine`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitErrorStructureLine?: (ctx: ErrorStructureLineContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.keyValueStructureLine`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitKeyValueStructureLine?: (ctx: KeyValueStructureLineContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.keyValueStructureValue`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitKeyValueStructureValue?: (ctx: KeyValueStructureValueContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.structuredBodyEndLine`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitStructuredBodyEndLine?: (ctx: StructuredBodyEndLineContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.normalTemplateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitNormalTemplateBody?: (ctx: NormalTemplateBodyContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.templateString`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitTemplateString?: (ctx: TemplateStringContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.normalTemplateString`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitNormalTemplateString?: (ctx: NormalTemplateStringContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.errorTemplateString`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitErrorTemplateString?: (ctx: ErrorTemplateStringContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.ifElseTemplateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitIfElseTemplateBody?: (ctx: IfElseTemplateBodyContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.ifConditionRule`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitIfConditionRule?: (ctx: IfConditionRuleContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.ifCondition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitIfCondition?: (ctx: IfConditionContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.switchCaseTemplateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitSwitchCaseTemplateBody?: (ctx: SwitchCaseTemplateBodyContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.switchCaseRule`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitSwitchCaseRule?: (ctx: SwitchCaseRuleContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.switchCaseStat`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitSwitchCaseStat?: (ctx: SwitchCaseStatContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitExpression?: (ctx: ExpressionContext) => Result;

    /**
	 * Visit a parse tree produced by `LGTemplateParser.expressionInStructure`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
    visitExpressionInStructure?: (ctx: ExpressionInStructureContext) => Result;
}

