import {ArgumentGeneratingFunction, ArgumentGenerator, SampleSize} from './generator';
import {AlgorithmSpeed, AnalysisTestSet, Code, Language, TestSample} from '../structures';
import {CodeTransformer, CodeTransformerFunction} from './transformer';

type SamplesBySpeed = Map<AlgorithmSpeed, number[]>;

class TestSetCreator {

    static DEFAULT_SAMPLES: number[] = [
        SampleSize.n16,
        SampleSize.n32,
        SampleSize.n128,
        SampleSize.n256,
        SampleSize.n512,
        SampleSize.n1K,
        SampleSize.n2K,
        SampleSize.n4K,
    ];

    private argumentGenerator: ArgumentGenerator;
    private codeTransformer: CodeTransformer;

    constructor() {
        this.argumentGenerator = new ArgumentGenerator();
        this.codeTransformer = new CodeTransformer();
    }

    private languageSampleSizesBySpeed: Map<Language, SamplesBySpeed> = new Map<Language, SamplesBySpeed>();

    private languageDefaultSampleSizes: Map<Language, number[]> = new Map<Language, number[]>();

    addDefaultLanguageSet(language: Language, sampleSizes: number[]): void
    {
        this.languageDefaultSampleSizes.set(language, sampleSizes);
    }

    addSpeedLanguageSet(language: Language, speed: AlgorithmSpeed, sampleSizes: number[]): void
    {
        if (!this.languageSampleSizesBySpeed.has(language)) {
            this.languageSampleSizesBySpeed.set(language, new Map<AlgorithmSpeed, number[]>());
        }
        this.languageSampleSizesBySpeed.get(language)?.set(speed, sampleSizes);
    }

    create(code: Code): AnalysisTestSet
    {
        const ns: number[] = this.sampleSizes(code.language, code.expectedSpeed);
        const testSamples: TestSample[] = this.argumentGenerator.generateSet(ns, code.testedFunctionName);
        return {
            code,
            samples: this.codeTransformer.injectFunctionArguments(code, testSamples),
        };
    }

    useBuiltInGenerator(testedFunctionName: string, builtInGeneratorName: string): void
    {
        this.argumentGenerator.useBuiltInGenerator(testedFunctionName, builtInGeneratorName);
    }

    addCustomGenerator(testedFunctionName: string, func: ArgumentGeneratingFunction): void
    {
        this.argumentGenerator.addCustomGenerator(testedFunctionName, func);
    }

    addLanguageCodeTransformer(language: Language, transformer: CodeTransformerFunction): void
    {
        this.codeTransformer.addLanguageCodeTransformer(language, transformer);
    }

    addLanguageReplacePattern(language: Language, pattern: string|RegExp): void
    {
        this.codeTransformer.addLanguageReplacePattern(language, pattern);
    }

    private sampleSizes(language: Language, speed: AlgorithmSpeed): number[]
    {
        if (this.languageSampleSizesBySpeed.has(language) && this.languageSampleSizesBySpeed.get(language)?.has(speed)) {
            return this.languageSampleSizesBySpeed.get(language)?.get(speed);
        }

        if (this.languageDefaultSampleSizes.has(language)) {
            return this.languageDefaultSampleSizes.get(language);
        }

        return TestSetCreator.DEFAULT_SAMPLES;
    }
}

export {TestSetCreator};