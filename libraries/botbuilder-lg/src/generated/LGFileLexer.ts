// Generated from src/LGFileLexer.g4 by ANTLR 4.7.3-SNAPSHOT

/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class LGFileLexer extends Lexer {
	public static readonly NEWLINE = 1;
	public static readonly OPTION = 2;
	public static readonly COMMENT = 3;
	public static readonly IMPORT = 4;
	public static readonly TEMPLATE_NAME_LINE = 5;
	public static readonly MULTILINE_PREFIX = 6;
	public static readonly TEMPLATE_BODY = 7;
	public static readonly INVALID_LINE = 8;
	public static readonly MULTILINE_SUFFIX = 9;
	public static readonly ESCAPE_CHARACTER = 10;
	public static readonly MULTILINE_TEXT = 11;
	public static readonly MULTILINE_MODE = 1;

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE", "MULTILINE_MODE",
	];

	public static readonly ruleNames: string[] = [
		"WHITESPACE", "NEWLINE", "OPTION", "COMMENT", "IMPORT", "TEMPLATE_NAME_LINE", 
		"MULTILINE_PREFIX", "TEMPLATE_BODY", "INVALID_LINE", "MULTILINE_SUFFIX", 
		"ESCAPE_CHARACTER", "MULTILINE_TEXT",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, "'```'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "NEWLINE", "OPTION", "COMMENT", "IMPORT", "TEMPLATE_NAME_LINE", 
		"MULTILINE_PREFIX", "TEMPLATE_BODY", "INVALID_LINE", "MULTILINE_SUFFIX", 
		"ESCAPE_CHARACTER", "MULTILINE_TEXT",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(LGFileLexer._LITERAL_NAMES, LGFileLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return LGFileLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	  startTemplate = false;


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(LGFileLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "LGFileLexer.g4"; }

	// @Override
	public get ruleNames(): string[] { return LGFileLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return LGFileLexer._serializedATN; }

	// @Override
	public get channelNames(): string[] { return LGFileLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return LGFileLexer.modeNames; }

	// @Override
	public action(_localctx: RuleContext, ruleIndex: number, actionIndex: number): void {
		switch (ruleIndex) {
		case 5:
			this.TEMPLATE_NAME_LINE_action(_localctx, actionIndex);
			break;
		}
	}
	private TEMPLATE_NAME_LINE_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 0:
			 this.startTemplate = true; 
			break;
		}
	}
	// @Override
	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 2:
			return this.OPTION_sempred(_localctx, predIndex);

		case 3:
			return this.COMMENT_sempred(_localctx, predIndex);

		case 4:
			return this.IMPORT_sempred(_localctx, predIndex);

		case 5:
			return this.TEMPLATE_NAME_LINE_sempred(_localctx, predIndex);

		case 6:
			return this.MULTILINE_PREFIX_sempred(_localctx, predIndex);

		case 7:
			return this.TEMPLATE_BODY_sempred(_localctx, predIndex);

		case 8:
			return this.INVALID_LINE_sempred(_localctx, predIndex);
		}
		return true;
	}
	private OPTION_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return  !this.startTemplate ;
		}
		return true;
	}
	private COMMENT_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 1:
			return  !this.startTemplate ;
		}
		return true;
	}
	private IMPORT_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 2:
			return  !this.startTemplate ;
		}
		return true;
	}
	private TEMPLATE_NAME_LINE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 3:
			return  this._tokenStartCharPositionInLine == 0 ;
		}
		return true;
	}
	private MULTILINE_PREFIX_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 4:
			return  this.startTemplate && this._tokenStartCharPositionInLine == 0 ;
		}
		return true;
	}
	private TEMPLATE_BODY_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 5:
			return  this.startTemplate ;
		}
		return true;
	}
	private INVALID_LINE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 6:
			return  !this.startTemplate ;
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02\r\xA9\b\x01\b" +
		"\x01\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t" +
		"\x06\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04" +
		"\r\t\r\x03\x02\x03\x02\x03\x03\x05\x03 \n\x03\x03\x03\x03\x03\x03\x04" +
		"\x07\x04%\n\x04\f\x04\x0E\x04(\v\x04\x03\x04\x03\x04\x07\x04,\n\x04\f" +
		"\x04\x0E\x04/\v\x04\x03\x04\x03\x04\x03\x04\x03\x04\x06\x045\n\x04\r\x04" +
		"\x0E\x046\x03\x04\x03\x04\x03\x05\x07\x05<\n\x05\f\x05\x0E\x05?\v\x05" +
		"\x03\x05\x03\x05\x07\x05C\n\x05\f\x05\x0E\x05F\v\x05\x03\x05\x03\x05\x03" +
		"\x06\x07\x06K\n\x06\f\x06\x0E\x06N\v\x06\x03\x06\x03\x06\x07\x06R\n\x06" +
		"\f\x06\x0E\x06U\v\x06\x03\x06\x03\x06\x03\x06\x07\x06Z\n\x06\f\x06\x0E" +
		"\x06]\v\x06\x03\x06\x03\x06\x07\x06a\n\x06\f\x06\x0E\x06d\v\x06\x03\x06" +
		"\x03\x06\x03\x07\x07\x07i\n\x07\f\x07\x0E\x07l\v\x07\x03\x07\x03\x07\x07" +
		"\x07p\n\x07\f\x07\x0E\x07s\v\x07\x03\x07\x03\x07\x03\x07\x03\b\x07\by" +
		"\n\b\f\b\x0E\b|\v\b\x03\b\x03\b\x07\b\x80\n\b\f\b\x0E\b\x83\v\b\x03\b" +
		"\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\t\x06\t\x8E\n\t\r\t\x0E" +
		"\t\x8F\x03\t\x03\t\x03\n\x06\n\x95\n\n\r\n\x0E\n\x96\x03\n\x03\n\x03\v" +
		"\x03\v\x03\v\x03\v\x03\v\x03\v\x03\f\x03\f\x05\f\xA3\n\f\x03\r\x06\r\xA6" +
		"\n\r\r\r\x0E\r\xA7\x05S[\xA7\x02\x02\x0E\x04\x02\x02\x06\x02\x03\b\x02" +
		"\x04\n\x02\x05\f\x02\x06\x0E\x02\x07\x10\x02\b\x12\x02\t\x14\x02\n\x16" +
		"\x02\v\x18\x02\f\x1A\x02\r\x04\x02\x03\x06\x06\x02\v\v\"\"\xA2\xA2\uFF01" +
		"\uFF01\x04\x02\f\f\x0F\x0F\x06\x02\f\f\x0F\x0F]]__\x05\x02\f\f\x0F\x0F" +
		"*+\x02\xB8\x02\x06\x03\x02\x02\x02\x02\b\x03\x02\x02\x02\x02\n\x03\x02" +
		"\x02\x02\x02\f\x03\x02\x02\x02\x02\x0E\x03\x02\x02\x02\x02\x10\x03\x02" +
		"\x02\x02\x02\x12\x03\x02\x02\x02\x02\x14\x03\x02\x02\x02\x03\x16\x03\x02" +
		"\x02\x02\x03\x18\x03\x02\x02\x02\x03\x1A\x03\x02\x02\x02\x04\x1C\x03\x02" +
		"\x02\x02\x06\x1F\x03\x02\x02\x02\b&\x03\x02\x02\x02\n=\x03\x02\x02\x02" +
		"\fL\x03\x02\x02\x02\x0Ej\x03\x02\x02\x02\x10z\x03\x02\x02\x02\x12\x8D" +
		"\x03\x02\x02\x02\x14\x94\x03\x02\x02\x02\x16\x9A\x03\x02\x02\x02\x18\xA0" +
		"\x03\x02\x02\x02\x1A\xA5\x03\x02\x02\x02\x1C\x1D\t\x02\x02\x02\x1D\x05" +
		"\x03\x02\x02\x02\x1E \x07\x0F\x02\x02\x1F\x1E\x03\x02\x02\x02\x1F \x03" +
		"\x02\x02\x02 !\x03\x02\x02\x02!\"\x07\f\x02\x02\"\x07\x03\x02\x02\x02" +
		"#%\x05\x04\x02\x02$#\x03\x02\x02\x02%(\x03\x02\x02\x02&$\x03\x02\x02\x02" +
		"&\'\x03\x02\x02\x02\')\x03\x02\x02\x02(&\x03\x02\x02\x02)-\x07@\x02\x02" +
		"*,\x05\x04\x02\x02+*\x03\x02\x02\x02,/\x03\x02\x02\x02-+\x03\x02\x02\x02" +
		"-.\x03\x02\x02\x02.0\x03\x02\x02\x02/-\x03\x02\x02\x0201\x07#\x02\x02" +
		"12\x07%\x02\x0224\x03\x02\x02\x0235\n\x03\x02\x0243\x03\x02\x02\x0256" +
		"\x03\x02\x02\x0264\x03\x02\x02\x0267\x03\x02\x02\x0278\x03\x02\x02\x02" +
		"89\x06\x04\x02\x029\t\x03\x02\x02\x02:<\x05\x04\x02\x02;:\x03\x02\x02" +
		"\x02<?\x03\x02\x02\x02=;\x03\x02\x02\x02=>\x03\x02\x02\x02>@\x03\x02\x02" +
		"\x02?=\x03\x02\x02\x02@D\x07@\x02\x02AC\n\x03\x02\x02BA\x03\x02\x02\x02" +
		"CF\x03\x02\x02\x02DB\x03\x02\x02\x02DE\x03\x02\x02\x02EG\x03\x02\x02\x02" +
		"FD\x03\x02\x02\x02GH\x06\x05\x03\x02H\v\x03\x02\x02\x02IK\x05\x04\x02" +
		"\x02JI\x03\x02\x02\x02KN\x03\x02\x02\x02LJ\x03\x02\x02\x02LM\x03\x02\x02" +
		"\x02MO\x03\x02\x02\x02NL\x03\x02\x02\x02OS\x07]\x02\x02PR\n\x04\x02\x02" +
		"QP\x03\x02\x02\x02RU\x03\x02\x02\x02ST\x03\x02\x02\x02SQ\x03\x02\x02\x02" +
		"TV\x03\x02\x02\x02US\x03\x02\x02\x02VW\x07_\x02\x02W[\x07*\x02\x02XZ\n" +
		"\x05\x02\x02YX\x03\x02\x02\x02Z]\x03\x02\x02\x02[\\\x03\x02\x02\x02[Y" +
		"\x03\x02\x02\x02\\^\x03\x02\x02\x02][\x03\x02\x02\x02^b\x07+\x02\x02_" +
		"a\x05\x04\x02\x02`_\x03\x02\x02\x02ad\x03\x02\x02\x02b`\x03\x02\x02\x02" +
		"bc\x03\x02\x02\x02ce\x03\x02\x02\x02db\x03\x02\x02\x02ef\x06\x06\x04\x02" +
		"f\r\x03\x02\x02\x02gi\x05\x04\x02\x02hg\x03\x02\x02\x02il\x03\x02\x02" +
		"\x02jh\x03\x02\x02\x02jk\x03\x02\x02\x02km\x03\x02\x02\x02lj\x03\x02\x02" +
		"\x02mq\x07%\x02\x02np\n\x03\x02\x02on\x03\x02\x02\x02ps\x03\x02\x02\x02" +
		"qo\x03\x02\x02\x02qr\x03\x02\x02\x02rt\x03\x02\x02\x02sq\x03\x02\x02\x02" +
		"tu\x06\x07\x05\x02uv\b\x07\x02\x02v\x0F\x03\x02\x02\x02wy\x05\x04\x02" +
		"\x02xw\x03\x02\x02\x02y|\x03\x02\x02\x02zx\x03\x02\x02\x02z{\x03\x02\x02" +
		"\x02{}\x03\x02\x02\x02|z\x03\x02\x02\x02}\x81\x07/\x02\x02~\x80\x05\x04" +
		"\x02\x02\x7F~\x03\x02\x02\x02\x80\x83\x03\x02\x02\x02\x81\x7F\x03\x02" +
		"\x02\x02\x81\x82\x03\x02\x02\x02\x82\x84\x03\x02\x02\x02\x83\x81\x03\x02" +
		"\x02\x02\x84\x85\x07b\x02\x02\x85\x86\x07b\x02\x02\x86\x87\x07b\x02\x02" +
		"\x87\x88\x03\x02\x02\x02\x88\x89\x06\b\x06\x02\x89\x8A\x03\x02\x02\x02" +
		"\x8A\x8B\b\b\x03\x02\x8B\x11\x03\x02\x02\x02\x8C\x8E\n\x03\x02\x02\x8D" +
		"\x8C\x03\x02\x02\x02\x8E\x8F\x03\x02\x02\x02\x8F\x8D\x03\x02\x02\x02\x8F" +
		"\x90\x03\x02\x02\x02\x90\x91\x03\x02\x02\x02\x91\x92\x06\t\x07\x02\x92" +
		"\x13\x03\x02\x02\x02\x93\x95\n\x03\x02\x02\x94\x93\x03\x02\x02\x02\x95" +
		"\x96\x03\x02\x02\x02\x96\x94\x03\x02\x02\x02\x96\x97\x03\x02\x02\x02\x97" +
		"\x98\x03\x02\x02\x02\x98\x99\x06\n\b\x02\x99\x15\x03\x02\x02\x02\x9A\x9B" +
		"\x07b\x02\x02\x9B\x9C\x07b\x02\x02\x9C\x9D\x07b\x02\x02\x9D\x9E\x03\x02" +
		"\x02\x02\x9E\x9F\b\v\x04\x02\x9F\x17\x03\x02\x02\x02\xA0\xA2\x07^\x02" +
		"\x02\xA1\xA3\n\x03\x02\x02\xA2\xA1\x03\x02\x02\x02\xA2\xA3\x03\x02\x02" +
		"\x02\xA3\x19\x03\x02\x02\x02\xA4\xA6\v\x02\x02\x02\xA5\xA4\x03\x02\x02" +
		"\x02\xA6\xA7\x03\x02\x02\x02\xA7\xA8\x03\x02\x02\x02\xA7\xA5\x03\x02\x02" +
		"\x02\xA8\x1B\x03\x02\x02\x02\x16\x02\x03\x1F&-6=DLS[bjqz\x81\x8F\x96\xA2" +
		"\xA7\x05\x03\x07\x02\x07\x03\x02\x06\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!LGFileLexer.__ATN) {
			LGFileLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGFileLexer._serializedATN));
		}

		return LGFileLexer.__ATN;
	}

}

