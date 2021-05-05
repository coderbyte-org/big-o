import {Code, RunTime} from "../structures";

class AnalysisError extends Error {
    testResults: RunTime[] = [];
    code: Code | undefined;
}

export {AnalysisError};