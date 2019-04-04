import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ts';

// tslint:disable-next-line: completed-docs
export class TemplateErrorListener implements ANTLRErrorListener<any> {
	public static readonly INSTANCE: TemplateErrorListener = new TemplateErrorListener();

	public syntaxError<T>(
		recognizer: Recognizer<T, any>,
		offendingSymbol: T,
		line: number,
		charPositionInLine: number,
		msg: string,
		e: RecognitionException | undefined): void {
            throw Error(`line ${line}:${charPositionInLine} ${msg}`);
    }
}
