// Generated from src/LGFileParser.g4 by ANTLR 4.7.3-SNAPSHOT

/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

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
 * This interface defines a complete listener for a parse tree produced by
 * `LGFileParser`.
 */
export interface LGFileParserListener extends ParseTreeListener {
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
	 * Enter a parse tree produced by `LGFileParser.commentDefinition`.
	 * @param ctx the parse tree
	 */
	enterCommentDefinition?: (ctx: CommentDefinitionContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.commentDefinition`.
	 * @param ctx the parse tree
	 */
	exitCommentDefinition?: (ctx: CommentDefinitionContext) => void;

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

	/**
	 * Enter a parse tree produced by `LGFileParser.optionDefinition`.
	 * @param ctx the parse tree
	 */
	enterOptionDefinition?: (ctx: OptionDefinitionContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.optionDefinition`.
	 * @param ctx the parse tree
	 */
	exitOptionDefinition?: (ctx: OptionDefinitionContext) => void;

	/**
	 * Enter a parse tree produced by `LGFileParser.errorDefinition`.
	 * @param ctx the parse tree
	 */
	enterErrorDefinition?: (ctx: ErrorDefinitionContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.errorDefinition`.
	 * @param ctx the parse tree
	 */
	exitErrorDefinition?: (ctx: ErrorDefinitionContext) => void;

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
	 * Enter a parse tree produced by `LGFileParser.templateBodyLine`.
	 * @param ctx the parse tree
	 */
	enterTemplateBodyLine?: (ctx: TemplateBodyLineContext) => void;
	/**
	 * Exit a parse tree produced by `LGFileParser.templateBodyLine`.
	 * @param ctx the parse tree
	 */
	exitTemplateBodyLine?: (ctx: TemplateBodyLineContext) => void;
}

