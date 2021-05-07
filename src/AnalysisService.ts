import {CodeRunner, CodeRunnerError, UnexpectedTimeoutError} from './runner';
import {
    AlgorithmSpeed,
    AnalysisResult,
    AnalysisTestSet,
    BigO,
    Code,
    Language,
    RunnableCode,
    RunTime
} from './structures';
import {ArgumentGeneratingFunction, CodeTransformerFunction, TestSetCreator} from './creator';
import {Calculator, GenericCalculator, TIMEOUT_THRESHOLD_MS} from './calculator';

export type AnalysisServiceConfig = {
    optimalComplexities?: Map<string, BigO>,
    calculators?: Map<Language, Calculator>,
    repeatedSamples?: Map<Language, number[]>,
    defaultCalculator?: Calculator,
}

class AnalysisService {

    private optimalComplexities: Map<string, BigO>;
    private calculators: Map<Language, Calculator>;
    private repeatedSamples: Map<Language, number[]>;
    private defaultCalculator: Calculator;
    private codeRunner: CodeRunner;
    private testSetCreator: TestSetCreator;

    constructor(codeRunner: CodeRunner, config?: AnalysisServiceConfig) {
        this.codeRunner = codeRunner;
        this.optimalComplexities = new Map<string, BigO>();
        this.calculators = new Map<Language, Calculator>();
        this.repeatedSamples = new Map<Language, number[]>();
        this.defaultCalculator = new GenericCalculator();
        if (config) {
            if (config.optimalComplexities) {
                this.optimalComplexities = config.optimalComplexities;
            }
            if (config.calculators) {
                this.calculators = config.calculators;
            }
            if (config.repeatedSamples) {
                this.repeatedSamples = config.repeatedSamples;
            }
            if (config.defaultCalculator) {
                this.defaultCalculator = config.defaultCalculator;
            }
        }
        this.testSetCreator = new TestSetCreator();
    }

    public analyze(code: Code, runnerContext: { [key: string]: string } = {}): Promise<AnalysisResult> {
        const testSet: AnalysisTestSet = this.testSetCreator.create(code);
        const testResultsObj: { r: RunTime[] } = {r: []};
        const calculator: Calculator = this.calculatorForLanguage(code.language);
        return this.recursiveAnalyze(calculator, testSet, testResultsObj, 0, runnerContext);
    }

    private recursiveAnalyze(
        calculator: Calculator,
        testSet: AnalysisTestSet,
        testResultsObj: { r: RunTime[] },
        i = 0,
        runnerContext: { [key: string]: string } = {}
    ): Promise<AnalysisResult> {
        return this.runSample(testSet.code, testSet.samples[i], testResultsObj, runnerContext)
            .then((testResults: RunTime[]) => {
                const bigO: BigO = calculator.calculate(testResults, testSet.code.expectedSpeed);
                if (bigO !== BigO.UNKNOWN) {
                    return Promise.resolve({bigO, testResults});
                }
                if (testResults[testResults.length-1].result >= TIMEOUT_THRESHOLD_MS) {
                    const err = new UnexpectedTimeoutError('Calculator could not handle runner timeout.');
                    err.testResults = testResults;
                    err.code = testSet.code;
                    return Promise.reject(err);
                }
                if (i === testSet.samples.length - 1) {
                    return Promise.resolve({
                        bigO: this.optimalComplexity(testSet.code.testedFunctionName),
                        testResults
                    });
                }
                return this.recursiveAnalyze(calculator, testSet, testResultsObj, ++i, runnerContext);
            });
    }

    private runSample(
        code: Code,
        sample: RunnableCode,
        testResultsObj: { r: RunTime[] },
        runnerContext: { [key: string]: string } = {}
    ): Promise<RunTime[]> {
        let runs: number = this.runCountForSample(code.language, sample.n);
        const promises: Promise<RunTime>[] = [];
        while (runs > 0) {
            runs--;
            const durationRunner: Promise<RunTime> = this.codeRunner.checkCodeExecDuration(code.language, sample.code, runnerContext)
                .then((duration: number) => {
                    return Promise.resolve({
                        result: duration,
                        n: sample.n
                    });
                });
            promises.push(durationRunner);
        }
        return Promise.all(promises)
            .then((runnerResults: RunTime[]) => {
                testResultsObj.r = testResultsObj.r.concat(runnerResults);
                return testResultsObj.r;
            }).catch(err => {
                if (err instanceof CodeRunnerError) {
                    err.failedSample = sample.n;
                    err.testResults = testResultsObj.r;
                    err.code = code;
                }
                return Promise.reject(err);
            });
    }

    addTestSetCreatorDefaultLanguageSet(language: Language, sampleSizes: number[]): void
    {
        this.testSetCreator.addDefaultLanguageSet(language, sampleSizes);
    }

    addTestSetCreatorSpeedLanguageSet(language: Language, speed: AlgorithmSpeed, sampleSizes: number[]): void
    {
        this.testSetCreator.addSpeedLanguageSet(language, speed, sampleSizes);
    }

    useBuiltInGenerator(testedFunctionName: string, builtInGeneratorName: string): void
    {
        this.testSetCreator.useBuiltInGenerator(testedFunctionName, builtInGeneratorName);
    }

    addCustomGenerator(testedFunctionName: string, func: ArgumentGeneratingFunction): void
    {
        this.testSetCreator.addCustomGenerator(testedFunctionName, func);
    }

    addLanguageCodeTransformer(language: Language, transformer: CodeTransformerFunction): void
    {
        this.testSetCreator.addLanguageCodeTransformer(language, transformer);
    }

    addLanguageReplacePattern(language: Language, pattern: string|RegExp): void
    {
        this.testSetCreator.addLanguageReplacePattern(language, pattern);
    }

    private runCountForSample(language: Language, sampleSize: number): number {
        if (this.repeatedSamples.has(language)) {
            const samples: number[] = this.repeatedSamples.get(language);
            if (samples.indexOf(sampleSize) !== -1) {
                return 3;
            }
        }
        return 1;
    }

    private optimalComplexity(type: string): BigO
    {
        if (this.optimalComplexities.has(type)) {
            return this.optimalComplexities.get(type);
        }
        return BigO.LINEAR;
    }

    private calculatorForLanguage(language: Language): Calculator
    {
        if (this.calculators.has(language)) {
            return this.calculators.get(language);
        }
        return this.defaultCalculator;
    }
}

export {AnalysisService};