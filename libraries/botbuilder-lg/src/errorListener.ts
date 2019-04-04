import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ts';

// tslint:disable-next-line: completed-docs
export class ErrorListener implements ANTLRErrorListener<any> {
	public static readonly INSTANCE: ErrorListener = new ErrorListener();

	public syntaxError<T>(
		recognizer: Recognizer<T, any>,
		offendingSymbol: T,
		line: number,
		charPositionInLine: number,
		msg: string,
		e: RecognitionException | undefined): void {
            throw Error(`[ERROR]: syntax error at line ${line}:${charPositionInLine} ${msg}`);
    }
}
