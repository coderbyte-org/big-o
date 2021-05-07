import {Language} from './Language';
import {AlgorithmSpeed} from './AlgorithmSpeed';

type Code = {
    language: Language,
    content: string,
    expectedSpeed: AlgorithmSpeed,
    testedFunctionName: string,
}

export {Code};