import {BigO} from './BigO';
import {RunTime} from './RunTime';

type AnalysisResult = {
    bigO: BigO,
    testResults: RunTime[]
}

export {AnalysisResult};