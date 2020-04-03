// Generated from ../ExpressionAntlrLexer.g4 by ANTLR 4.6-SNAPSHOT


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


export class ExpressionAntlrLexer extends Lexer {
	public static readonly STRING_INTERPOLATION_START = 1;
	public static readonly PLUS = 2;
	public static readonly SUBSTRACT = 3;
	public static readonly NON = 4;
	public static readonly XOR = 5;
	public static readonly ASTERISK = 6;
	public static readonly SLASH = 7;
	public static readonly PERCENT = 8;
	public static readonly DOUBLE_EQUAL = 9;
	public static readonly NOT_EQUAL = 10;
	public static readonly SINGLE_AND = 11;
	public static readonly DOUBLE_AND = 12;
	public static readonly DOUBLE_VERTICAL_CYLINDER = 13;
	public static readonly LESS_THAN = 14;
	public static readonly MORE_THAN = 15;
	public static readonly LESS_OR_EQUAl = 16;
	public static readonly MORE_OR_EQUAL = 17;
	public static readonly OPEN_BRACKET = 18;
	public static readonly CLOSE_BRACKET = 19;
	public static readonly DOT = 20;
	public static readonly OPEN_SQUARE_BRACKET = 21;
	public static readonly CLOSE_SQUARE_BRACKET = 22;
	public static readonly OPEN_CURLY_BRACKET = 23;
	public static readonly CLOSE_CURLY_BRACKET = 24;
	public static readonly COMMA = 25;
	public static readonly COLON = 26;
	public static readonly DOLLAR = 27;
	public static readonly NUMBER = 28;
	public static readonly WHITESPACE = 29;
	public static readonly IDENTIFIER = 30;
	public static readonly NEWLINE = 31;
	public static readonly STRING = 32;
	public static readonly INVALID_TOKEN_DEFAULT_MODE = 33;
	public static readonly OBJECT_DEFINITION = 34;
	public static readonly TEMPLATE = 35;
	public static readonly ESCAPE_CHARACTER = 36;
	public static readonly TEXT_CONTENT = 37;
	public static readonly STRING_INTERPOLATION_MODE = 1;
	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE", "STRING_INTERPOLATION_MODE",
	];

	public static readonly ruleNames: string[] = [
		"LETTER", "DIGIT", "STRING_INTERPOLATION_START", "PLUS", "SUBSTRACT", 
		"NON", "XOR", "ASTERISK", "SLASH", "PERCENT", "DOUBLE_EQUAL", "NOT_EQUAL", 
		"SINGLE_AND", "DOUBLE_AND", "DOUBLE_VERTICAL_CYLINDER", "LESS_THAN", "MORE_THAN", 
		"LESS_OR_EQUAl", "MORE_OR_EQUAL", "OPEN_BRACKET", "CLOSE_BRACKET", "DOT", 
		"OPEN_SQUARE_BRACKET", "CLOSE_SQUARE_BRACKET", "OPEN_CURLY_BRACKET", "CLOSE_CURLY_BRACKET", 
		"COMMA", "COLON", "DOLLAR", "NUMBER", "WHITESPACE", "IDENTIFIER", "NEWLINE", 
		"STRING", "INVALID_TOKEN_DEFAULT_MODE", "STRING_INTERPOLATION_END", "OBJECT_DEFINITION", 
		"TEMPLATE", "ESCAPE_CHARACTER", "TEXT_CONTENT",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, "'+'", "'-'", "'!'", "'^'", "'*'", "'/'", "'%'", 
		"'=='", undefined, "'&'", "'&&'", "'||'", "'<'", "'>'", "'<='", "'>='", 
		"'('", "')'", "'.'", "'['", "']'", "'{'", "'}'", "','", "':'", "'$'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "STRING_INTERPOLATION_START", "PLUS", "SUBSTRACT", "NON", "XOR", 
		"ASTERISK", "SLASH", "PERCENT", "DOUBLE_EQUAL", "NOT_EQUAL", "SINGLE_AND", 
		"DOUBLE_AND", "DOUBLE_VERTICAL_CYLINDER", "LESS_THAN", "MORE_THAN", "LESS_OR_EQUAl", 
		"MORE_OR_EQUAL", "OPEN_BRACKET", "CLOSE_BRACKET", "DOT", "OPEN_SQUARE_BRACKET", 
		"CLOSE_SQUARE_BRACKET", "OPEN_CURLY_BRACKET", "CLOSE_CURLY_BRACKET", "COMMA", 
		"COLON", "DOLLAR", "NUMBER", "WHITESPACE", "IDENTIFIER", "NEWLINE", "STRING", 
		"INVALID_TOKEN_DEFAULT_MODE", "OBJECT_DEFINITION", "TEMPLATE", "ESCAPE_CHARACTER", 
		"TEXT_CONTENT",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(ExpressionAntlrLexer._LITERAL_NAMES, ExpressionAntlrLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return ExpressionAntlrLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	  ignoreWS = true;      // usually we ignore whitespace, but inside stringInterpolation, whitespace is significant


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(ExpressionAntlrLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "ExpressionAntlrLexer.g4"; }

	// @Override
	public get ruleNames(): string[] { return ExpressionAntlrLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return ExpressionAntlrLexer._serializedATN; }

	// @Override
	public get modeNames(): string[] { return ExpressionAntlrLexer.modeNames; }

	// @Override
	public action(_localctx: RuleContext, ruleIndex: number, actionIndex: number): void {
		switch (ruleIndex) {
		case 2:
			this.STRING_INTERPOLATION_START_action(_localctx, actionIndex);
			break;

		case 35:
			this.STRING_INTERPOLATION_END_action(_localctx, actionIndex);
			break;
		}
	}
	private STRING_INTERPOLATION_START_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 0:
			 this.ignoreWS = false;
			break;
		}
	}
	private STRING_INTERPOLATION_END_action(_localctx: RuleContext, actionIndex: number): void {
		switch (actionIndex) {
		case 1:
			this.ignoreWS = true;
			break;
		}
	}
	// @Override
	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 30:
			return this.WHITESPACE_sempred(_localctx, predIndex);
		}
		return true;
	}
	private WHITESPACE_sempred(_localctx: RuleContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.ignoreWS;
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x02\'\u0107\b\x01" +
		"\b\x01\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06" +
		"\t\x06\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f" +
		"\x04\r\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04" +
		"\x12\t\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04" +
		"\x17\t\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04" +
		"\x1C\t\x1C\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04" +
		"\"\t\"\x04#\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t)\x03\x02" +
		"\x03\x02\x03\x03\x03\x03\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x05" +
		"\x03\x05\x03\x06\x03\x06\x03\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03\n" +
		"\x03\n\x03\v\x03\v\x03\f\x03\f\x03\f\x03\r\x03\r\x03\r\x03\r\x05\rs\n" +
		"\r\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x10\x03" +
		"\x11\x03\x11\x03\x12\x03\x12\x03\x13\x03\x13\x03\x13\x03\x14\x03\x14\x03" +
		"\x14\x03\x15\x03\x15\x03\x16\x03\x16\x03\x17\x03\x17\x03\x18\x03\x18\x03" +
		"\x19\x03\x19\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03\x1C\x03\x1C\x03\x1D\x03" +
		"\x1D\x03\x1E\x03\x1E\x03\x1F\x06\x1F\x9C\n\x1F\r\x1F\x0E\x1F\x9D\x03\x1F" +
		"\x03\x1F\x06\x1F\xA2\n\x1F\r\x1F\x0E\x1F\xA3\x05\x1F\xA6\n\x1F\x03 \x03" +
		" \x03 \x03 \x03 \x03!\x03!\x03!\x03!\x03!\x05!\xB2\n!\x03!\x03!\x03!\x07" +
		"!\xB7\n!\f!\x0E!\xBA\v!\x03\"\x05\"\xBD\n\"\x03\"\x03\"\x03\"\x03\"\x03" +
		"#\x03#\x03#\x03#\x07#\xC7\n#\f#\x0E#\xCA\v#\x03#\x03#\x03#\x03#\x03#\x07" +
		"#\xD1\n#\f#\x0E#\xD4\v#\x03#\x05#\xD7\n#\x03$\x03$\x03%\x03%\x03%\x03" +
		"%\x03%\x03%\x03&\x03&\x03&\x03&\x05&\xE5\n&\x03&\x03&\x03&\x03&\x03&\x06" +
		"&\xEC\n&\r&\x0E&\xED\x07&\xF0\n&\f&\x0E&\xF3\v&\x03&\x03&\x03\'\x03\'" +
		"\x03\'\x03\'\x03\'\x06\'\xFC\n\'\r\'\x0E\'\xFD\x03\'\x03\'\x03(\x03(\x05" +
		"(\u0104\n(\x03)\x03)\x04\xC8\xD2\x02\x02*\x04\x02\x02\x06\x02\x02\b\x02" +
		"\x03\n\x02\x04\f\x02\x05\x0E\x02\x06\x10\x02\x07\x12\x02\b\x14\x02\t\x16" +
		"\x02\n\x18\x02\v\x1A\x02\f\x1C\x02\r\x1E\x02\x0E \x02\x0F\"\x02\x10$\x02" +
		"\x11&\x02\x12(\x02\x13*\x02\x14,\x02\x15.\x02\x160\x02\x172\x02\x184\x02" +
		"\x196\x02\x1A8\x02\x1B:\x02\x1C<\x02\x1D>\x02\x1E@\x02\x1FB\x02 D\x02" +
		"!F\x02\"H\x02#J\x02\x02L\x02$N\x02%P\x02&R\x02\'\x04\x02\x03\x0E\x04\x02" +
		"C\\c|\x03\x022;\x06\x02\v\v\"\"\xA2\xA2\uFF01\uFF01\x05\x02%%BBaa\x04" +
		"\x02//aa\x04\x02))^^\x03\x02))\x04\x02$$^^\x03\x02$$\t\x02\f\f\x0F\x0F" +
		"$$))bb}}\x7F\x7F\x07\x02$$))bb}}\x7F\x7F\x04\x02\f\f\x0F\x0F\u011E\x02" +
		"\b\x03\x02\x02\x02\x02\n\x03\x02\x02\x02\x02\f\x03\x02\x02\x02\x02\x0E" +
		"\x03\x02\x02\x02\x02\x10\x03\x02\x02\x02\x02\x12\x03\x02\x02\x02\x02\x14" +
		"\x03\x02\x02\x02\x02\x16\x03\x02\x02\x02\x02\x18\x03\x02\x02\x02\x02\x1A" +
		"\x03\x02\x02\x02\x02\x1C\x03\x02\x02\x02\x02\x1E\x03\x02\x02\x02\x02 " +
		"\x03\x02\x02\x02\x02\"\x03\x02\x02\x02\x02$\x03\x02\x02\x02\x02&\x03\x02" +
		"\x02\x02\x02(\x03\x02\x02\x02\x02*\x03\x02\x02\x02\x02,\x03\x02\x02\x02" +
		"\x02.\x03\x02\x02\x02\x020\x03\x02\x02\x02\x022\x03\x02\x02\x02\x024\x03" +
		"\x02\x02\x02\x026\x03\x02\x02\x02\x028\x03\x02\x02\x02\x02:\x03\x02\x02" +
		"\x02\x02<\x03\x02\x02\x02\x02>\x03\x02\x02\x02\x02@\x03\x02\x02\x02\x02" +
		"B\x03\x02\x02\x02\x02D\x03\x02\x02\x02\x02F\x03\x02\x02\x02\x02H\x03\x02" +
		"\x02\x02\x03J\x03\x02\x02\x02\x03L\x03\x02\x02\x02\x03N\x03\x02\x02\x02" +
		"\x03P\x03\x02\x02\x02\x03R\x03\x02\x02\x02\x04T\x03\x02\x02\x02\x06V\x03" +
		"\x02\x02\x02\bX\x03\x02\x02\x02\n]\x03\x02\x02\x02\f_\x03\x02\x02\x02" +
		"\x0Ea\x03\x02\x02\x02\x10c\x03\x02\x02\x02\x12e\x03\x02\x02\x02\x14g\x03" +
		"\x02\x02\x02\x16i\x03\x02\x02\x02\x18k\x03\x02\x02\x02\x1Ar\x03\x02\x02" +
		"\x02\x1Ct\x03\x02\x02\x02\x1Ev\x03\x02\x02\x02 y\x03\x02\x02\x02\"|\x03" +
		"\x02\x02\x02$~\x03\x02\x02\x02&\x80\x03\x02\x02\x02(\x83\x03\x02\x02\x02" +
		"*\x86\x03\x02\x02\x02,\x88\x03\x02\x02\x02.\x8A\x03\x02\x02\x020\x8C\x03" +
		"\x02\x02\x022\x8E\x03\x02\x02\x024\x90\x03\x02\x02\x026\x92\x03\x02\x02" +
		"\x028\x94\x03\x02\x02\x02:\x96\x03\x02\x02\x02<\x98\x03\x02\x02\x02>\x9B" +
		"\x03\x02\x02\x02@\xA7\x03\x02\x02\x02B\xB1\x03\x02\x02\x02D\xBC\x03\x02" +
		"\x02\x02F\xD6\x03\x02\x02\x02H\xD8\x03\x02\x02\x02J\xDA\x03\x02\x02\x02" +
		"L\xE0\x03\x02\x02\x02N\xF6\x03\x02\x02\x02P\u0101\x03\x02\x02\x02R\u0105" +
		"\x03\x02\x02\x02TU\t\x02\x02\x02U\x05\x03\x02\x02\x02VW\t\x03\x02\x02" +
		"W\x07\x03\x02\x02\x02XY\x07b\x02\x02YZ\b\x04\x02\x02Z[\x03\x02\x02\x02" +
		"[\\\b\x04\x03\x02\\\t\x03\x02\x02\x02]^\x07-\x02\x02^\v\x03\x02\x02\x02" +
		"_`\x07/\x02\x02`\r\x03\x02\x02\x02ab\x07#\x02\x02b\x0F\x03\x02\x02\x02" +
		"cd\x07`\x02\x02d\x11\x03\x02\x02\x02ef\x07,\x02\x02f\x13\x03\x02\x02\x02" +
		"gh\x071\x02\x02h\x15\x03\x02\x02\x02ij\x07\'\x02\x02j\x17\x03\x02\x02" +
		"\x02kl\x07?\x02\x02lm\x07?\x02\x02m\x19\x03\x02\x02\x02no\x07#\x02\x02" +
		"os\x07?\x02\x02pq\x07>\x02\x02qs\x07@\x02\x02rn\x03\x02\x02\x02rp\x03" +
		"\x02\x02\x02s\x1B\x03\x02\x02\x02tu\x07(\x02\x02u\x1D\x03\x02\x02\x02" +
		"vw\x07(\x02\x02wx\x07(\x02\x02x\x1F\x03\x02\x02\x02yz\x07~\x02\x02z{\x07" +
		"~\x02\x02{!\x03\x02\x02\x02|}\x07>\x02\x02}#\x03\x02\x02\x02~\x7F\x07" +
		"@\x02\x02\x7F%\x03\x02\x02\x02\x80\x81\x07>\x02\x02\x81\x82\x07?\x02\x02" +
		"\x82\'\x03\x02\x02\x02\x83\x84\x07@\x02\x02\x84\x85\x07?\x02\x02\x85)" +
		"\x03\x02\x02\x02\x86\x87\x07*\x02\x02\x87+\x03\x02\x02\x02\x88\x89\x07" +
		"+\x02\x02\x89-\x03\x02\x02\x02\x8A\x8B\x070\x02\x02\x8B/\x03\x02\x02\x02" +
		"\x8C\x8D\x07]\x02\x02\x8D1\x03\x02\x02\x02\x8E\x8F\x07_\x02\x02\x8F3\x03" +
		"\x02\x02\x02\x90\x91\x07}\x02\x02\x915\x03\x02\x02\x02\x92\x93\x07\x7F" +
		"\x02\x02\x937\x03\x02\x02\x02\x94\x95\x07.\x02\x02\x959\x03\x02\x02\x02" +
		"\x96\x97\x07<\x02\x02\x97;\x03\x02\x02\x02\x98\x99\x07&\x02\x02\x99=\x03" +
		"\x02\x02\x02\x9A\x9C\x05\x06\x03\x02\x9B\x9A\x03\x02\x02\x02\x9C\x9D\x03" +
		"\x02\x02\x02\x9D\x9B\x03\x02\x02\x02\x9D\x9E\x03\x02\x02\x02\x9E\xA5\x03" +
		"\x02\x02\x02\x9F\xA1\x070\x02\x02\xA0\xA2\x05\x06\x03\x02\xA1\xA0\x03" +
		"\x02\x02\x02\xA2\xA3\x03\x02\x02\x02\xA3\xA1\x03\x02\x02\x02\xA3\xA4\x03" +
		"\x02\x02\x02\xA4\xA6\x03\x02\x02\x02\xA5\x9F\x03\x02\x02\x02\xA5\xA6\x03" +
		"\x02\x02\x02\xA6?\x03\x02\x02\x02\xA7\xA8\t\x04\x02\x02\xA8\xA9\x06 \x02" +
		"\x02\xA9\xAA\x03\x02\x02\x02\xAA\xAB\b \x04\x02\xABA\x03\x02\x02\x02\xAC" +
		"\xB2\x05\x04\x02\x02\xAD\xB2\t\x05\x02\x02\xAE\xAF\x07B\x02\x02\xAF\xB2" +
		"\x07B\x02\x02\xB0\xB2\x04&\'\x02\xB1\xAC\x03\x02\x02\x02\xB1\xAD\x03\x02" +
		"\x02\x02\xB1\xAE\x03\x02\x02\x02\xB1\xB0\x03\x02\x02\x02\xB2\xB8\x03\x02" +
		"\x02\x02\xB3\xB7\x05\x04\x02\x02\xB4\xB7\x05\x06\x03\x02\xB5\xB7\t\x06" +
		"\x02\x02\xB6\xB3\x03\x02\x02\x02\xB6\xB4\x03\x02\x02\x02\xB6\xB5\x03\x02" +
		"\x02\x02\xB7\xBA\x03\x02\x02\x02\xB8\xB6\x03\x02\x02\x02\xB8\xB9\x03\x02" +
		"\x02\x02\xB9C\x03\x02\x02\x02\xBA\xB8\x03\x02\x02\x02\xBB\xBD\x07\x0F" +
		"\x02\x02\xBC\xBB\x03\x02\x02\x02\xBC\xBD\x03\x02\x02\x02\xBD\xBE\x03\x02" +
		"\x02\x02\xBE\xBF\x07\f\x02\x02\xBF\xC0\x03\x02\x02\x02\xC0\xC1\b\"\x04" +
		"\x02\xC1E\x03\x02\x02\x02\xC2\xC8\x07)\x02\x02\xC3\xC4\x07^\x02\x02\xC4" +
		"\xC7\t\x07\x02\x02\xC5\xC7\n\b\x02\x02\xC6\xC3\x03\x02\x02\x02\xC6\xC5" +
		"\x03\x02\x02\x02\xC7\xCA\x03\x02\x02\x02\xC8\xC9\x03\x02\x02\x02\xC8\xC6" +
		"\x03\x02\x02\x02\xC9\xCB\x03\x02\x02\x02\xCA\xC8\x03\x02\x02\x02\xCB\xD7" +
		"\x07)\x02\x02\xCC\xD2\x07$\x02\x02\xCD\xCE\x07^\x02\x02\xCE\xD1\t\t\x02" +
		"\x02\xCF\xD1\n\n\x02\x02\xD0\xCD\x03\x02\x02\x02\xD0\xCF\x03\x02\x02\x02" +
		"\xD1\xD4\x03\x02\x02\x02\xD2\xD3\x03\x02\x02\x02\xD2\xD0\x03\x02\x02\x02" +
		"\xD3\xD5\x03\x02\x02\x02\xD4\xD2\x03\x02\x02\x02\xD5\xD7\x07$\x02\x02" +
		"\xD6\xC2\x03\x02\x02\x02\xD6\xCC\x03\x02\x02\x02\xD7G\x03\x02\x02\x02" +
		"\xD8\xD9\v\x02\x02\x02\xD9I\x03\x02\x02\x02\xDA\xDB\x07b\x02\x02\xDB\xDC" +
		"\b%\x05\x02\xDC\xDD\x03\x02\x02\x02\xDD\xDE\b%\x06\x02\xDE\xDF\b%\x07" +
		"\x02\xDFK\x03\x02\x02\x02\xE0\xF1\x07}\x02\x02\xE1\xF0\x05@ \x02\xE2\xE5" +
		"\x05B!\x02\xE3\xE5\x05F#\x02\xE4\xE2\x03\x02\x02\x02\xE4\xE3\x03\x02\x02" +
		"\x02\xE5\xE6\x03\x02\x02\x02\xE6\xEB\x07<\x02\x02\xE7\xEC\x05F#\x02\xE8" +
		"\xEC\x05N\'\x02\xE9\xEC\n\v\x02\x02\xEA\xEC\x05L&\x02\xEB\xE7\x03\x02" +
		"\x02\x02\xEB\xE8\x03\x02\x02\x02\xEB\xE9\x03\x02\x02\x02\xEB\xEA\x03\x02" +
		"\x02\x02\xEC\xED\x03\x02\x02\x02\xED\xEB\x03\x02\x02\x02\xED\xEE\x03\x02" +
		"\x02\x02\xEE\xF0\x03\x02\x02\x02\xEF\xE1\x03\x02\x02\x02\xEF\xE4\x03\x02" +
		"\x02\x02\xF0\xF3\x03\x02\x02\x02\xF1\xEF\x03\x02\x02\x02\xF1\xF2\x03\x02" +
		"\x02\x02\xF2\xF4\x03\x02\x02\x02\xF3\xF1\x03\x02\x02\x02\xF4\xF5\x07\x7F" +
		"\x02\x02\xF5M\x03\x02\x02\x02\xF6\xF7\x07&\x02\x02\xF7\xFB\x07}\x02\x02" +
		"\xF8\xFC\x05F#\x02\xF9\xFC\x05L&\x02\xFA\xFC\n\f\x02\x02\xFB\xF8\x03\x02" +
		"\x02\x02\xFB\xF9\x03\x02\x02\x02\xFB\xFA\x03\x02\x02\x02\xFC\xFD\x03\x02" +
		"\x02\x02\xFD\xFB\x03\x02\x02\x02\xFD\xFE\x03\x02\x02\x02\xFE\xFF\x03\x02" +
		"\x02\x02\xFF\u0100\x07\x7F\x02\x02\u0100O\x03\x02\x02\x02\u0101\u0103" +
		"\x07^\x02\x02\u0102\u0104\n\r\x02\x02\u0103\u0102\x03\x02\x02\x02\u0103" +
		"\u0104\x03\x02\x02\x02\u0104Q\x03\x02\x02\x02\u0105\u0106\n\r\x02\x02" +
		"\u0106S\x03\x02\x02\x02\x19\x02\x03r\x9D\xA3\xA5\xB1\xB6\xB8\xBC\xC6\xC8" +
		"\xD0\xD2\xD6\xE4\xEB\xED\xEF\xF1\xFB\xFD\u0103\b\x03\x04\x02\x07\x03\x02" +
		"\b\x02\x02\x03%\x03\t\x03\x02\x06\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ExpressionAntlrLexer.__ATN) {
			ExpressionAntlrLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(ExpressionAntlrLexer._serializedATN));
		}

		return ExpressionAntlrLexer.__ATN;
	}

}

