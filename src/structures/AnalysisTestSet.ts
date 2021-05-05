import {Code} from "./Code";
import {RunnableCode} from "./RunnableCode";

type AnalysisTestSet = {
    code: Code,
    samples: RunnableCode[],
};

export {AnalysisTestSet};