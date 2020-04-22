// Generated from ../LGFileParser.g4 by ANTLR 4.6-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { LGFileParserListener } from "./LGFileParserListener";
import { LGFileParserVisitor } from "./LGFileParserVisitor";


export class LGFileParser extends Parser {
	public static readonly NEWLINE = 1;
	public static readonly OPTION = 2;
	public static readonly COMMENT = 3;
	public static readonly IMPORT = 4;
	public static readonly TEMPLATE_NAME_LINE = 5;
	public static readonly TEMPLATE_BODY_LINE = 6;
	public static readonly INVALID_LINE = 7;
	public static readonly RULE_file = 0;
	public static readonly RULE_paragraph = 1;
	public static readonly RULE_commentDefinition = 2;
	public static readonly RULE_importDefinition = 3;
	public static readonly RULE_optionDefinition = 4;
	public static readonly RULE_errorDefinition = 5;
	public static readonly RULE_templateDefinition = 6;
	public static readonly RULE_templateNameLine = 7;
	public static readonly RULE_templateBody = 8;
	public static readonly RULE_templateBodyLine = 9;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"file", "paragraph", "commentDefinition", "importDefinition", "optionDefinition", 
		"errorDefinition", "templateDefinition", "templateNameLine", "templateBody", 
		"templateBodyLine",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "NEWLINE", "OPTION", "COMMENT", "IMPORT", "TEMPLATE_NAME_LINE", 
		"TEMPLATE_BODY_LINE", "INVALID_LINE",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(LGFileParser._LITERAL_NAMES, LGFileParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return LGFileParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "LGFileParser.g4"; }

	// @Override
	public get ruleNames(): string[] { return LGFileParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return LGFileParser._serializedATN; }

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(LGFileParser._ATN, this);
	}
	// @RuleVersion(0)
	public file(): FileContext {
		let _localctx: FileContext = new FileContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, LGFileParser.RULE_file);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 21;
			this._errHandler.sync(this);
			_alt = 1 + 1;
			do {
				switch (_alt) {
				case 1 + 1:
					{
					{
					this.state = 20;
					this.paragraph();
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				this.state = 23;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 0, this._ctx);
			} while (_alt !== 1 && _alt !== ATN.INVALID_ALT_NUMBER);
			this.state = 25;
			this.match(LGFileParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public paragraph(): ParagraphContext {
		let _localctx: ParagraphContext = new ParagraphContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, LGFileParser.RULE_paragraph);
		try {
			this.state = 34;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case LGFileParser.TEMPLATE_NAME_LINE:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 27;
				this.templateDefinition();
				}
				break;
			case LGFileParser.IMPORT:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 28;
				this.importDefinition();
				}
				break;
			case LGFileParser.OPTION:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 29;
				this.optionDefinition();
				}
				break;
			case LGFileParser.INVALID_LINE:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 30;
				this.errorDefinition();
				}
				break;
			case LGFileParser.COMMENT:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 31;
				this.commentDefinition();
				}
				break;
			case LGFileParser.NEWLINE:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 32;
				this.match(LGFileParser.NEWLINE);
				}
				break;
			case LGFileParser.EOF:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 33;
				this.match(LGFileParser.EOF);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public commentDefinition(): CommentDefinitionContext {
		let _localctx: CommentDefinitionContext = new CommentDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, LGFileParser.RULE_commentDefinition);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 36;
			this.match(LGFileParser.COMMENT);
			this.state = 38;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 2, this._ctx) ) {
			case 1:
				{
				this.state = 37;
				this.match(LGFileParser.NEWLINE);
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public importDefinition(): ImportDefinitionContext {
		let _localctx: ImportDefinitionContext = new ImportDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, LGFileParser.RULE_importDefinition);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 40;
			this.match(LGFileParser.IMPORT);
			this.state = 42;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				{
				this.state = 41;
				this.match(LGFileParser.NEWLINE);
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public optionDefinition(): OptionDefinitionContext {
		let _localctx: OptionDefinitionContext = new OptionDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, LGFileParser.RULE_optionDefinition);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 44;
			this.match(LGFileParser.OPTION);
			this.state = 46;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 4, this._ctx) ) {
			case 1:
				{
				this.state = 45;
				this.match(LGFileParser.NEWLINE);
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public errorDefinition(): ErrorDefinitionContext {
		let _localctx: ErrorDefinitionContext = new ErrorDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, LGFileParser.RULE_errorDefinition);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 48;
			this.match(LGFileParser.INVALID_LINE);
			this.state = 50;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 5, this._ctx) ) {
			case 1:
				{
				this.state = 49;
				this.match(LGFileParser.NEWLINE);
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public templateDefinition(): TemplateDefinitionContext {
		let _localctx: TemplateDefinitionContext = new TemplateDefinitionContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, LGFileParser.RULE_templateDefinition);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 52;
			this.templateNameLine();
			this.state = 53;
			this.templateBody();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public templateNameLine(): TemplateNameLineContext {
		let _localctx: TemplateNameLineContext = new TemplateNameLineContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, LGFileParser.RULE_templateNameLine);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 55;
			this.match(LGFileParser.TEMPLATE_NAME_LINE);
			this.state = 57;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 6, this._ctx) ) {
			case 1:
				{
				this.state = 56;
				this.match(LGFileParser.NEWLINE);
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public templateBody(): TemplateBodyContext {
		let _localctx: TemplateBodyContext = new TemplateBodyContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, LGFileParser.RULE_templateBody);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 62;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 7, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 59;
					this.templateBodyLine();
					}
					}
				}
				this.state = 64;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 7, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public templateBodyLine(): TemplateBodyLineContext {
		let _localctx: TemplateBodyLineContext = new TemplateBodyLineContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, LGFileParser.RULE_templateBodyLine);
		try {
			this.state = 70;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case LGFileParser.TEMPLATE_BODY_LINE:
				this.enterOuterAlt(_localctx, 1);
				{
				{
				this.state = 65;
				this.match(LGFileParser.TEMPLATE_BODY_LINE);
				this.state = 67;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 8, this._ctx) ) {
				case 1:
					{
					this.state = 66;
					this.match(LGFileParser.NEWLINE);
					}
					break;
				}
				}
				}
				break;
			case LGFileParser.NEWLINE:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 69;
				this.match(LGFileParser.NEWLINE);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public static readonly _serializedATN: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x03\tK\x04\x02\t" +
		"\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07\t" +
		"\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x03\x02\x06\x02\x18\n\x02" +
		"\r\x02\x0E\x02\x19\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x05\x03%\n\x03\x03\x04\x03\x04\x05\x04)\n\x04\x03" +
		"\x05\x03\x05\x05\x05-\n\x05\x03\x06\x03\x06\x05\x061\n\x06\x03\x07\x03" +
		"\x07\x05\x075\n\x07\x03\b\x03\b\x03\b\x03\t\x03\t\x05\t<\n\t\x03\n\x07" +
		"\n?\n\n\f\n\x0E\nB\v\n\x03\v\x03\v\x05\vF\n\v\x03\v\x05\vI\n\v\x03\v\x03" +
		"\x19\x02\x02\f\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02" +
		"\x12\x02\x14\x02\x02\x02O\x02\x17\x03\x02\x02\x02\x04$\x03\x02\x02\x02" +
		"\x06&\x03\x02\x02\x02\b*\x03\x02\x02\x02\n.\x03\x02\x02\x02\f2\x03\x02" +
		"\x02\x02\x0E6\x03\x02\x02\x02\x109\x03\x02\x02\x02\x12@\x03\x02\x02\x02" +
		"\x14H\x03\x02\x02\x02\x16\x18\x05\x04\x03\x02\x17\x16\x03\x02\x02\x02" +
		"\x18\x19\x03\x02\x02\x02\x19\x1A\x03\x02\x02\x02\x19\x17\x03\x02\x02\x02" +
		"\x1A\x1B\x03\x02\x02\x02\x1B\x1C\x07\x02\x02\x03\x1C\x03\x03\x02\x02\x02" +
		"\x1D%\x05\x0E\b\x02\x1E%\x05\b\x05\x02\x1F%\x05\n\x06\x02 %\x05\f\x07" +
		"\x02!%\x05\x06\x04\x02\"%\x07\x03\x02\x02#%\x07\x02\x02\x03$\x1D\x03\x02" +
		"\x02\x02$\x1E\x03\x02\x02\x02$\x1F\x03\x02\x02\x02$ \x03\x02\x02\x02$" +
		"!\x03\x02\x02\x02$\"\x03\x02\x02\x02$#\x03\x02\x02\x02%\x05\x03\x02\x02" +
		"\x02&(\x07\x05\x02\x02\')\x07\x03\x02\x02(\'\x03\x02\x02\x02()\x03\x02" +
		"\x02\x02)\x07\x03\x02\x02\x02*,\x07\x06\x02\x02+-\x07\x03\x02\x02,+\x03" +
		"\x02\x02\x02,-\x03\x02\x02\x02-\t\x03\x02\x02\x02.0\x07\x04\x02\x02/1" +
		"\x07\x03\x02\x020/\x03\x02\x02\x0201\x03\x02\x02\x021\v\x03\x02\x02\x02" +
		"24\x07\t\x02\x0235\x07\x03\x02\x0243\x03\x02\x02\x0245\x03\x02\x02\x02" +
		"5\r\x03\x02\x02\x0267\x05\x10\t\x0278\x05\x12\n\x028\x0F\x03\x02\x02\x02" +
		"9;\x07\x07\x02\x02:<\x07\x03\x02\x02;:\x03\x02\x02\x02;<\x03\x02\x02\x02" +
		"<\x11\x03\x02\x02\x02=?\x05\x14\v\x02>=\x03\x02\x02\x02?B\x03\x02\x02" +
		"\x02@>\x03\x02\x02\x02@A\x03\x02\x02\x02A\x13\x03\x02\x02\x02B@\x03\x02" +
		"\x02\x02CE\x07\b\x02\x02DF\x07\x03\x02\x02ED\x03\x02\x02\x02EF\x03\x02" +
		"\x02\x02FI\x03\x02\x02\x02GI\x07\x03\x02\x02HC\x03\x02\x02\x02HG\x03\x02" +
		"\x02\x02I\x15\x03\x02\x02\x02\f\x19$(,04;@EH";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!LGFileParser.__ATN) {
			LGFileParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGFileParser._serializedATN));
		}

		return LGFileParser.__ATN;
	}

}

export class FileContext extends ParserRuleContext {
	public EOF(): TerminalNode { return this.getToken(LGFileParser.EOF, 0); }
	public paragraph(): ParagraphContext[];
	public paragraph(i: number): ParagraphContext;
	public paragraph(i?: number): ParagraphContext | ParagraphContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ParagraphContext);
		} else {
			return this.getRuleContext(i, ParagraphContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_file; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterFile) {
			listener.enterFile(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitFile) {
			listener.exitFile(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitFile) {
			return visitor.visitFile(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParagraphContext extends ParserRuleContext {
	public templateDefinition(): TemplateDefinitionContext | undefined {
		return this.tryGetRuleContext(0, TemplateDefinitionContext);
	}
	public importDefinition(): ImportDefinitionContext | undefined {
		return this.tryGetRuleContext(0, ImportDefinitionContext);
	}
	public optionDefinition(): OptionDefinitionContext | undefined {
		return this.tryGetRuleContext(0, OptionDefinitionContext);
	}
	public errorDefinition(): ErrorDefinitionContext | undefined {
		return this.tryGetRuleContext(0, ErrorDefinitionContext);
	}
	public commentDefinition(): CommentDefinitionContext | undefined {
		return this.tryGetRuleContext(0, CommentDefinitionContext);
	}
	public NEWLINE(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.NEWLINE, 0); }
	public EOF(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.EOF, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_paragraph; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterParagraph) {
			listener.enterParagraph(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitParagraph) {
			listener.exitParagraph(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitParagraph) {
			return visitor.visitParagraph(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CommentDefinitionContext extends ParserRuleContext {
	public COMMENT(): TerminalNode { return this.getToken(LGFileParser.COMMENT, 0); }
	public NEWLINE(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.NEWLINE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_commentDefinition; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterCommentDefinition) {
			listener.enterCommentDefinition(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitCommentDefinition) {
			listener.exitCommentDefinition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitCommentDefinition) {
			return visitor.visitCommentDefinition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ImportDefinitionContext extends ParserRuleContext {
	public IMPORT(): TerminalNode { return this.getToken(LGFileParser.IMPORT, 0); }
	public NEWLINE(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.NEWLINE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_importDefinition; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterImportDefinition) {
			listener.enterImportDefinition(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitImportDefinition) {
			listener.exitImportDefinition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitImportDefinition) {
			return visitor.visitImportDefinition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OptionDefinitionContext extends ParserRuleContext {
	public OPTION(): TerminalNode { return this.getToken(LGFileParser.OPTION, 0); }
	public NEWLINE(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.NEWLINE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_optionDefinition; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterOptionDefinition) {
			listener.enterOptionDefinition(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitOptionDefinition) {
			listener.exitOptionDefinition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitOptionDefinition) {
			return visitor.visitOptionDefinition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ErrorDefinitionContext extends ParserRuleContext {
	public INVALID_LINE(): TerminalNode { return this.getToken(LGFileParser.INVALID_LINE, 0); }
	public NEWLINE(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.NEWLINE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_errorDefinition; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterErrorDefinition) {
			listener.enterErrorDefinition(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitErrorDefinition) {
			listener.exitErrorDefinition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitErrorDefinition) {
			return visitor.visitErrorDefinition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TemplateDefinitionContext extends ParserRuleContext {
	public templateNameLine(): TemplateNameLineContext {
		return this.getRuleContext(0, TemplateNameLineContext);
	}
	public templateBody(): TemplateBodyContext {
		return this.getRuleContext(0, TemplateBodyContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_templateDefinition; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterTemplateDefinition) {
			listener.enterTemplateDefinition(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitTemplateDefinition) {
			listener.exitTemplateDefinition(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitTemplateDefinition) {
			return visitor.visitTemplateDefinition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TemplateNameLineContext extends ParserRuleContext {
	public TEMPLATE_NAME_LINE(): TerminalNode { return this.getToken(LGFileParser.TEMPLATE_NAME_LINE, 0); }
	public NEWLINE(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.NEWLINE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_templateNameLine; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterTemplateNameLine) {
			listener.enterTemplateNameLine(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitTemplateNameLine) {
			listener.exitTemplateNameLine(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitTemplateNameLine) {
			return visitor.visitTemplateNameLine(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TemplateBodyContext extends ParserRuleContext {
	public templateBodyLine(): TemplateBodyLineContext[];
	public templateBodyLine(i: number): TemplateBodyLineContext;
	public templateBodyLine(i?: number): TemplateBodyLineContext | TemplateBodyLineContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TemplateBodyLineContext);
		} else {
			return this.getRuleContext(i, TemplateBodyLineContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_templateBody; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterTemplateBody) {
			listener.enterTemplateBody(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitTemplateBody) {
			listener.exitTemplateBody(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitTemplateBody) {
			return visitor.visitTemplateBody(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TemplateBodyLineContext extends ParserRuleContext {
	public TEMPLATE_BODY_LINE(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.TEMPLATE_BODY_LINE, 0); }
	public NEWLINE(): TerminalNode | undefined { return this.tryGetToken(LGFileParser.NEWLINE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return LGFileParser.RULE_templateBodyLine; }
	// @Override
	public enterRule(listener: LGFileParserListener): void {
		if (listener.enterTemplateBodyLine) {
			listener.enterTemplateBodyLine(this);
		}
	}
	// @Override
	public exitRule(listener: LGFileParserListener): void {
		if (listener.exitTemplateBodyLine) {
			listener.exitTemplateBodyLine(this);
		}
	}
	// @Override
	public accept<Result>(visitor: LGFileParserVisitor<Result>): Result {
		if (visitor.visitTemplateBodyLine) {
			return visitor.visitTemplateBodyLine(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


