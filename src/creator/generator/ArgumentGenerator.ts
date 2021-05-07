import {
    CharacterSet,
    generateConsecutiveNumbers,
    generateNumberArray,
    generateString,
    generateStringArray
} from "./GenericGenerators";
import {FunctionArgument, TestSample} from "../../structures";

abstract class BuiltInArgumentTypes {
    static WORDS: string = 'words'
    static ALPHA_STRING: string = 'string';
    static NUMBER_STRING: string = 'numberString';
    static NUMBER: string = 'number';
    static RANDOM_NUMBERS: string = 'numberArr';
    static ORDERED_NUMBERS: string = 'consecutiveNumberArr';
}

type ArgumentGeneratingFunction = (n: number) => FunctionArgument;

class ArgumentGenerator {

    private generators: {[key: string]: ArgumentGeneratingFunction} = {
        [BuiltInArgumentTypes.WORDS]: n => generateStringArray(n, 10, CharacterSet.ALPHA, true).join(' '),
        [BuiltInArgumentTypes.ALPHA_STRING]: n => generateString(n, CharacterSet.ALPHA),
        [BuiltInArgumentTypes.NUMBER_STRING]: n => generateString(n, CharacterSet.NUM),
        [BuiltInArgumentTypes.NUMBER]: n => n,
        [BuiltInArgumentTypes.RANDOM_NUMBERS]: n => generateNumberArray(n, [1, n]),
        [BuiltInArgumentTypes.ORDERED_NUMBERS]: n => generateConsecutiveNumbers(n),
    };

    isArgumentTypeSupported(argumentType: string): boolean
    {
        return this.generators.hasOwnProperty(argumentType);
    }

    generateSet(ns: number[], testedFunctionName: string): TestSample[]
    {
        return ns.map(n => this.generate(n, testedFunctionName))
    }

    generate(n: number, testedFunctionName: string): TestSample
    {
        if (!this.isArgumentTypeSupported(testedFunctionName)) {
            throw new Error(`No generator for ${testedFunctionName}!`);
        }
        let generator: ArgumentGeneratingFunction = this.generators[testedFunctionName];
        return {
            n,
            value: generator(n)
        }
    }

    useBuiltInGenerator(testedFunctionName: string, builtInGeneratorName: string): void
    {
        if (!this.isArgumentTypeSupported(builtInGeneratorName)) {
            throw new Error(`No generator found for ${builtInGeneratorName}!`);
        }
        this.generators[testedFunctionName] = this.generators[builtInGeneratorName];
    }

    addCustomGenerator(testedFunctionName: string, func: ArgumentGeneratingFunction): void
    {
        if (this.isArgumentTypeSupported(testedFunctionName)) {
            throw new Error(`Argument generator for ${testedFunctionName} already exists!`);
        }
        this.generators[testedFunctionName] = func;
    }
}

export {
    ArgumentGenerator,
    BuiltInArgumentTypes,
    ArgumentGeneratingFunction
};