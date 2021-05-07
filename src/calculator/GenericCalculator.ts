import {Calculator} from './Calculator';
import {AlgorithmSpeed, BigO, RunTime} from '../structures';
import {SampleSize} from '../creator/generator';

export type NGrouped = { [key: number]: number};
export const TIMEOUT_THRESHOLD_MS = 20000;

class GenericCalculator implements Calculator {

    calculate(runTimes: RunTime[], speed: AlgorithmSpeed): BigO {
        const nGroupedRunTimes = this.groupRunTimes(runTimes);
        switch (true) {
        case this.likeFactorial(nGroupedRunTimes, speed):
            return BigO.FACTORIAL;
        case this.likeExponential(nGroupedRunTimes, speed):
            return BigO.EXPONENTIAL;
        case this.likePolynomial(nGroupedRunTimes, speed):
            return BigO.POLYNOMIAL;
        case this.likeQuadratic(nGroupedRunTimes, speed):
            return BigO.QUADRATIC;
        case this.likeLoglinear(nGroupedRunTimes, speed):
            return BigO.LOGLINEAR;
        default:
            return BigO.UNKNOWN;
        }
    }

    protected groupRunTimes(runTimes: RunTime[]): NGrouped {
        const tempNGrouped: { [key: number]: number[] } = {};
        const keys: number[] = [];
        const nGroupedRunTimes: NGrouped = {};
        for (let i = 0; i < runTimes.length; i++) {
            const sampleSize: number = runTimes[i].n;
            if (!tempNGrouped.hasOwnProperty(sampleSize)) {
                keys.push(sampleSize);
                tempNGrouped[sampleSize] = [];
            }
            tempNGrouped[sampleSize].push(runTimes[i].result);
        }
        for (let i = 0; i < keys.length; i++) {
            if (tempNGrouped[keys[i]].length == 1) {
                nGroupedRunTimes[keys[i]] = tempNGrouped[keys[i]][0];
                continue;
            }
            const sum: number = tempNGrouped[keys[i]].reduce(
                (accumulator, currentValue) => accumulator + currentValue
            );
            nGroupedRunTimes[keys[i]] = Math.round(sum / tempNGrouped[keys[i]].length);
        }
        return nGroupedRunTimes;
    }

    protected likeLoglinear(nGroupedRunTimes: NGrouped, speed?: AlgorithmSpeed): boolean {
        return nGroupedRunTimes.hasOwnProperty(SampleSize.n1M)
            && nGroupedRunTimes[SampleSize.n1M] >= 1000
        ;

    }

    protected likeQuadratic(nGroupedRunTimes: NGrouped, speed?: AlgorithmSpeed): boolean {
        return nGroupedRunTimes.hasOwnProperty(SampleSize.n1K)
            && nGroupedRunTimes.hasOwnProperty(SampleSize.n2K)
            && nGroupedRunTimes.hasOwnProperty(SampleSize.n4K)
            && nGroupedRunTimes[SampleSize.n1K] * 3 < nGroupedRunTimes[SampleSize.n2K]
            && nGroupedRunTimes[SampleSize.n2K] * 3 < nGroupedRunTimes[SampleSize.n4K]
        ;
    }

    protected likePolynomial(nGroupedRunTimes: NGrouped, speed?: AlgorithmSpeed): boolean {
        return nGroupedRunTimes.hasOwnProperty(SampleSize.n128)
            && nGroupedRunTimes.hasOwnProperty(SampleSize.n256)
            && nGroupedRunTimes[SampleSize.n128] * 4 < nGroupedRunTimes[SampleSize.n256]
        ;
    }

    protected likeExponential(nGroupedRunTimes: NGrouped, speed?: AlgorithmSpeed): boolean {
        return nGroupedRunTimes.hasOwnProperty(SampleSize.n32)
            && nGroupedRunTimes[SampleSize.n32] >= TIMEOUT_THRESHOLD_MS
        ;
    }

    protected likeFactorial(nGroupedRunTimes: NGrouped, speed?: AlgorithmSpeed): boolean {
        return nGroupedRunTimes.hasOwnProperty(SampleSize.n16)
            && nGroupedRunTimes[SampleSize.n16] >= TIMEOUT_THRESHOLD_MS
        ;
    }
}

export {GenericCalculator};

