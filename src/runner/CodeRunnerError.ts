import {AnalysisError} from "./AnalysisError";

class CodeRunnerError extends AnalysisError {
    failedSample: number = 0;
    codeRunnerResponse: { [key: string]: string } = {};
}

export {CodeRunnerError};