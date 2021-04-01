// Generated from src/LGFileParser.g4 by ANTLR 4.7.3-SNAPSHOT

/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { FileContext } from "./LGFileParser";
import { ParagraphContext } from "./LGFileParser";
import { CommentDefinitionContext } from "./LGFileParser";
import { ImportDefinitionContext } from "./LGFileParser";
import { OptionDefinitionContext } from "./LGFileParser";
import { ErrorDefinitionContext } from "./LGFileParser";
import { TemplateDefinitionContext } from "./LGFileParser";
import { TemplateNameLineContext } from "./LGFileParser";
import { TemplateBodyContext } from "./LGFileParser";
import { TemplateBodyLineContext } from "./LGFileParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `LGFileParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface LGFileParserVisitor<Result> extends ParseTreeVisitor<Result> {
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
	 * Visit a parse tree produced by `LGFileParser.commentDefinition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCommentDefinition?: (ctx: CommentDefinitionContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.importDefinition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitImportDefinition?: (ctx: ImportDefinitionContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.optionDefinition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitOptionDefinition?: (ctx: OptionDefinitionContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.errorDefinition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitErrorDefinition?: (ctx: ErrorDefinitionContext) => Result;

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
	 * Visit a parse tree produced by `LGFileParser.templateBody`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemplateBody?: (ctx: TemplateBodyContext) => Result;

	/**
	 * Visit a parse tree produced by `LGFileParser.templateBodyLine`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemplateBodyLine?: (ctx: TemplateBodyLineContext) => Result;
}

