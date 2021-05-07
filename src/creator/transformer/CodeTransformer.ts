import {Code, Language, RunnableCode, TestSample} from '../../structures';
import {convertArray, convertString} from './ArgumentConverters';

type CodeTransformerFunction = (code: Code, sample: TestSample) => string;

class CodeTransformer {

    static readonly REPLACEMENT_PATTERN: string = '{funcArgs}';

    private languageTransformers: Map<Language, CodeTransformerFunction>;
    private languagePatterns: Map<Language, Array<string|RegExp>>;

    constructor() {
        this.languageTransformers = new Map<Language, CodeTransformerFunction>();
        this.languagePatterns = new Map<Language, Array<string|RegExp>>() ;
    }

    private createRunnableCode(code: Code, sample: TestSample): string {
        let codeContent: string = this.applyLanguageSpecialRules(code, sample);
        const syntaxArguments: string = this.argumentsInLanguageSyntax(code, sample);
        let patterns: Array<string|RegExp> = [CodeTransformer.REPLACEMENT_PATTERN];
        if (this.languagePatterns.has(code.language)) {
            patterns = this.languagePatterns.get(code.language)!;
        }
        for (let i = 0; i < patterns.length; i++) {
            codeContent = codeContent.replace(patterns[i], syntaxArguments);
        }
        return codeContent;
    }

    private applyLanguageSpecialRules(code: Code, sample: TestSample): string
    {
        if (this.languageTransformers.has(code.language)) {
            const transformer: CodeTransformerFunction = this.languageTransformers.get(code.language)!;
            return transformer(code, sample);
        }
        return code.content;
    }

    private argumentsInLanguageSyntax(code: Code, sample: TestSample): string {
        switch (true) {
        case Array.isArray(sample.value):
            return convertArray(sample.value as Array<any>, code.language);
        case typeof sample.value === 'string':
            return convertString(sample.value as string, code.language);
        default:
            return sample.value.toString();
        }
    }

    addLanguageCodeTransformer(language: Language, transformer: CodeTransformerFunction): void
    {
        this.languageTransformers.set(language, transformer);
    }

    addLanguageReplacePattern(language: Language, pattern: string|RegExp): void {
        if (!this.languagePatterns.has(language)) {
            this.languagePatterns.set(language, []);
        }
        this.languagePatterns.get(language)!.push(pattern);
    }

    injectFunctionArguments(code: Code, samples: TestSample[]): RunnableCode[]
    {
        return samples.map(sample => {
            return {
                n: sample.n,
                code: this.createRunnableCode(code, sample),
            };
        });
    }
}

export {
    CodeTransformer,
    CodeTransformerFunction
};