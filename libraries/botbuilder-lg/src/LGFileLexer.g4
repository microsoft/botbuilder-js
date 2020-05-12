lexer grammar LGFileLexer;

@lexer::members {
  startTemplate = false;
  startLine = true;
}

fragment WHITESPACE : ' '|'\t'|'\ufeff'|'\u00a0';

NEWLINE : '\r'? '\n' {this.startLine = true;};

OPTION : WHITESPACE* '>' WHITESPACE* '!#' ~('\r'|'\n')+ { !this.startTemplate}?;

COMMENT : WHITESPACE* '>' ~('\r'|'\n')* { !this.startTemplate }?;

IMPORT : WHITESPACE* '[' ~[\r\n[\]]*? ']' '(' ~[\r\n()]*? ')' WHITESPACE* { !this.startTemplate }?;

TEMPLATE_NAME_LINE : WHITESPACE* '#' ~('\r'|'\n')* { this.startLine }? { this.startTemplate = true; };

MULTILINE_PREFIX: WHITESPACE* '-' WHITESPACE* '```' { this.startTemplate && this.startLine }? -> pushMode(MULTILINE_MODE);

TEMPLATE_BODY : ~('\r'|'\n') { this.startTemplate }? { this.startLine = false; };

INVALID_LINE :  ~('\r'|'\n')+ { !this.startTemplate }?;


mode MULTILINE_MODE;
MULTILINE_SUFFIX : '```' -> popMode;

ESCAPE_CHARACTER : '\\' ~[\r\n]?;

MULTILINE_TEXT : .+?;
