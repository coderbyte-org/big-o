import {AlgorithmSpeed, BigO, RunTime} from "../structures";


interface Calculator {
    calculate(runTimes: RunTime[], speed: AlgorithmSpeed): BigO;
}

export {Calculator};