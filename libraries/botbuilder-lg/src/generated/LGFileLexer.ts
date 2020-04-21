// Generated from ../LGFileLexer.g4 by ANTLR 4.6-SNAPSHOT


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
	public static readonly TEMPLATE_BODY_LINE = 6;
	public static readonly INVALID_LINE = 7;
	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"WHITESPACE", "NEWLINE", "OPTION", "COMMENT", "IMPORT", "TEMPLATE_NAME_LINE", 
		"TEMPLATE_BODY_LINE", "INVALID_LINE",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "NEWLINE", "OPTION", "COMMENT", "IMPORT", "TEMPLATE_NAME_LINE", 
		"TEMPLATE_BODY_LINE", "INVALID_LINE",
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

		case 6:
			return this.TEMPLATE_BODY_LINE_sempred(_localctx, predIndex);

		case 7:
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
	private TEMPLATE_BODY_LINE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 3:
			return  this.startTemplate ;
		}
		return true;
	}
	private INVALID_LINE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 4:
			return  !this.startTemplate ;
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x02\t{\b\x01\x04" +
		"\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04" +
		"\x07\t\x07\x04\b\t\b\x04\t\t\t\x03\x02\x03\x02\x03\x03\x05\x03\x17\n\x03" +
		"\x03\x03\x03\x03\x03\x04\x07\x04\x1C\n\x04\f\x04\x0E\x04\x1F\v\x04\x03" +
		"\x04\x03\x04\x07\x04#\n\x04\f\x04\x0E\x04&\v\x04\x03\x04\x03\x04\x03\x04" +
		"\x03\x04\x06\x04,\n\x04\r\x04\x0E\x04-\x03\x04\x03\x04\x03\x05\x07\x05" +
		"3\n\x05\f\x05\x0E\x056\v\x05\x03\x05\x03\x05\x07\x05:\n\x05\f\x05\x0E" +
		"\x05=\v\x05\x03\x05\x03\x05\x03\x06\x07\x06B\n\x06\f\x06\x0E\x06E\v\x06" +
		"\x03\x06\x03\x06\x07\x06I\n\x06\f\x06\x0E\x06L\v\x06\x03\x06\x03\x06\x03" +
		"\x06\x07\x06Q\n\x06\f\x06\x0E\x06T\v\x06\x03\x06\x03\x06\x07\x06X\n\x06" +
		"\f\x06\x0E\x06[\v\x06\x03\x06\x03\x06\x03\x07\x07\x07`\n\x07\f\x07\x0E" +
		"\x07c\v\x07\x03\x07\x03\x07\x07\x07g\n\x07\f\x07\x0E\x07j\v\x07\x03\x07" +
		"\x03\x07\x03\b\x06\bo\n\b\r\b\x0E\bp\x03\b\x03\b\x03\t\x06\tv\n\t\r\t" +
		"\x0E\tw\x03\t\x03\t\x04JR\x02\x02\n\x03\x02\x02\x05\x02\x03\x07\x02\x04" +
		"\t\x02\x05\v\x02\x06\r\x02\x07\x0F\x02\b\x11\x02\t\x03\x02\x06\x06\x02" +
		"\v\v\"\"\xA2\xA2\uFF01\uFF01\x04\x02\f\f\x0F\x0F\x06\x02\f\f\x0F\x0F]" +
		"]__\x05\x02\f\f\x0F\x0F*+\x87\x02\x05\x03\x02\x02\x02\x02\x07\x03\x02" +
		"\x02\x02\x02\t\x03\x02\x02\x02\x02\v\x03\x02\x02\x02\x02\r\x03\x02\x02" +
		"\x02\x02\x0F\x03\x02\x02\x02\x02\x11\x03\x02\x02\x02\x03\x13\x03\x02\x02" +
		"\x02\x05\x16\x03\x02\x02\x02\x07\x1D\x03\x02\x02\x02\t4\x03\x02\x02\x02" +
		"\vC\x03\x02\x02\x02\ra\x03\x02\x02\x02\x0Fn\x03\x02\x02\x02\x11u\x03\x02" +
		"\x02\x02\x13\x14\t\x02\x02\x02\x14\x04\x03\x02\x02\x02\x15\x17\x07\x0F" +
		"\x02\x02\x16\x15\x03\x02\x02\x02\x16\x17\x03\x02\x02\x02\x17\x18\x03\x02" +
		"\x02\x02\x18\x19\x07\f\x02\x02\x19\x06\x03\x02\x02\x02\x1A\x1C\x05\x03" +
		"\x02\x02\x1B\x1A\x03\x02\x02\x02\x1C\x1F\x03\x02\x02\x02\x1D\x1B\x03\x02" +
		"\x02\x02\x1D\x1E\x03\x02\x02\x02\x1E \x03\x02\x02\x02\x1F\x1D\x03\x02" +
		"\x02\x02 $\x07@\x02\x02!#\x05\x03\x02\x02\"!\x03\x02\x02\x02#&\x03\x02" +
		"\x02\x02$\"\x03\x02\x02\x02$%\x03\x02\x02\x02%\'\x03\x02\x02\x02&$\x03" +
		"\x02\x02\x02\'(\x07#\x02\x02()\x07%\x02\x02)+\x03\x02\x02\x02*,\n\x03" +
		"\x02\x02+*\x03\x02\x02\x02,-\x03\x02\x02\x02-+\x03\x02\x02\x02-.\x03\x02" +
		"\x02\x02./\x03\x02\x02\x02/0\x06\x04\x02\x020\b\x03\x02\x02\x0213\x05" +
		"\x03\x02\x0221\x03\x02\x02\x0236\x03\x02\x02\x0242\x03\x02\x02\x0245\x03" +
		"\x02\x02\x0257\x03\x02\x02\x0264\x03\x02\x02\x027;\x07@\x02\x028:\n\x03" +
		"\x02\x0298\x03\x02\x02\x02:=\x03\x02\x02\x02;9\x03\x02\x02\x02;<\x03\x02" +
		"\x02\x02<>\x03\x02\x02\x02=;\x03\x02\x02\x02>?\x06\x05\x03\x02?\n\x03" +
		"\x02\x02\x02@B\x05\x03\x02\x02A@\x03\x02\x02\x02BE\x03\x02\x02\x02CA\x03" +
		"\x02\x02\x02CD\x03\x02\x02\x02DF\x03\x02\x02\x02EC\x03\x02\x02\x02FJ\x07" +
		"]\x02\x02GI\n\x04\x02\x02HG\x03\x02\x02\x02IL\x03\x02\x02\x02JK\x03\x02" +
		"\x02\x02JH\x03\x02\x02\x02KM\x03\x02\x02\x02LJ\x03\x02\x02\x02MN\x07_" +
		"\x02\x02NR\x07*\x02\x02OQ\n\x05\x02\x02PO\x03\x02\x02\x02QT\x03\x02\x02" +
		"\x02RS\x03\x02\x02\x02RP\x03\x02\x02\x02SU\x03\x02\x02\x02TR\x03\x02\x02" +
		"\x02UY\x07+\x02\x02VX\x05\x03\x02\x02WV\x03\x02\x02\x02X[\x03\x02\x02" +
		"\x02YW\x03\x02\x02\x02YZ\x03\x02\x02\x02Z\\\x03\x02\x02\x02[Y\x03\x02" +
		"\x02\x02\\]\x06\x06\x04\x02]\f\x03\x02\x02\x02^`\x05\x03\x02\x02_^\x03" +
		"\x02\x02\x02`c\x03\x02\x02\x02a_\x03\x02\x02\x02ab\x03\x02\x02\x02bd\x03" +
		"\x02\x02\x02ca\x03\x02\x02\x02dh\x07%\x02\x02eg\n\x03\x02\x02fe\x03\x02" +
		"\x02\x02gj\x03\x02\x02\x02hf\x03\x02\x02\x02hi\x03\x02\x02\x02ik\x03\x02" +
		"\x02\x02jh\x03\x02\x02\x02kl\b\x07\x02\x02l\x0E\x03\x02\x02\x02mo\n\x03" +
		"\x02\x02nm\x03\x02\x02\x02op\x03\x02\x02\x02pn\x03\x02\x02\x02pq\x03\x02" +
		"\x02\x02qr\x03\x02\x02\x02rs\x06\b\x05\x02s\x10\x03\x02\x02\x02tv\n\x03" +
		"\x02\x02ut\x03\x02\x02\x02vw\x03\x02\x02\x02wu\x03\x02\x02\x02wx\x03\x02" +
		"\x02\x02xy\x03\x02\x02\x02yz\x06\t\x06\x02z\x12\x03\x02\x02\x02\x11\x02" +
		"\x16\x1D$-4;CJRYahpw\x03\x03\x07\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!LGFileLexer.__ATN) {
			LGFileLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(LGFileLexer._serializedATN));
		}

		return LGFileLexer.__ATN;
	}

}

