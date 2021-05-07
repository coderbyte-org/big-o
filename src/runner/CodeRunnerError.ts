import {AnalysisError} from './AnalysisError';

class CodeRunnerError extends AnalysisError {
    failedSample = 0;
    codeRunnerResponse: { [key: string]: string } = {};
}

export {CodeRunnerError};