export class LGParsingException extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class LGEvaluationException extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class LGReportMessage {
    public ReportType: LGReportMessageType;
    public Message: string;

    constructor(message: string, reportType: LGReportMessageType = LGReportMessageType.Error) {
        this.Message = message;
        this.ReportType = reportType;
    }
}

export enum LGReportMessageType {
    Error,
    Warning
}
