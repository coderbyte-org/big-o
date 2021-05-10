# BigO Calculator
This BigO Calculator library allows you to calculate the time complexity of a given algorithm. 
Calculation is performed by generating a series of test cases with increasing argument size, 
then measuring each test case run time, and determining the probable time complexity based on the gathered durations.  

This powers the [BigO calculations done on Coderbyte](https://coderbyte.com/profile/mennamohsensaad).

## Table of contents
- [Architecture](#architecture)
- [Installation](#installation)
  - [Default code runner](#default-code-runner)
- [Initialization](#initialization)
- [Analysis](#analysis)
  - [Insight](#insight)
- [Extending Calculator Functionality](#extending-calculator-functionality)
  - [Config](#analysisservice-config)
    - [Optimal complexities](#optimal-complexities)
    - [Calculators](#calculators)
    - [Repeated samples](#repeated-samples)
    - [Default calculator](#default-calculator)
  - [Sample sizes](#customize-sample-sizes)
  - [Argument generators](#argument-generators)
  - [Replacement patterns](#replacement-patterns)
  - [Code transformers](#custom-code-transformers)

## Architecture
This library consists of three essential parts linked together and run by [AnalysisService](src/AnalysisService.ts#L22):
- [Creator](#creator) - performs a series of operations to create a runnable sample from the [Code](src/structures/Code.ts) you pass to the library in order:
  - generates function arguments for each N
  - creates runnable test sample with injected arguments
- [Runner](#runner)
  - runs each test and returns duration
- [Calculator](#calculator)
  - determines BigO based on set of `N - duration` pairs

## Installation
using yarn:
```shell
yarn add big-o-calculator
```
using npm:
```shell
npm i big-o-calculator
```

##### Default code runner
BigO Calculator includes [CBHttpCodeRunner](src/runner/CBHttpCodeRunner.ts), 
which is a client for [cb-code-runner](https://github.com/coderbyte-org/cb-code-runner) 
along with [AxiosClient](src/runner/AxiosClient.ts) as an HTTP client. If you choose to use those classes as a [Runner](#runner) part of the calculator 
you need to install the optional [axios](https://github.com/axios/axios) dependency.

using yarn:
```shell
yarn add axios
```
using npm:
```shell
npm i axios
```


## Initialization
```typescript
import {AxiosClient, CBHttpCodeRunner, AnalysisService} from "big-o-calculator";

// First occurrence of [runnerLanguage] in URI will be replaced with language
const codeRunnerUri = 'http://example.com/code-runner/[runnerLanguage]';
const codeRunner = new CBHttpCodeRunner(codeRunnerUri, new AxiosClient())
const calculator = new AnalysisService(codeRunner);
```

## Analysis
Assume you want to determine the BigO for the following JavaScript code:
```javascript
function firstLetters(words) {
  return words.split(' ').map(word => {
    return word.substring(0, 1);
  });
}
```
BigO Calculator needs a way to inject arguments into the tested code, 
so a function call and `{funcArgs}` argument placeholder needs to be added.
```javascript
firstLetters({funcArgs});
```
Full code will look like this:
```javascript
function firstLetters(words) {
  return words.split(' ').map(word => {
    return word.substring(0, 1);
  });
}
firstLetters({funcArgs});
```

Then create a [Code](src/structures/Code.ts) object. 

```typescript
import {AlgorithmSpeed, BuiltInArgumentTypes, Language} from "big-o-calculator";

let code: Code = {
  // Language of the tested code
  language: Language.JS,
  // Most languages handle data types differenty (e.g. integers vs strings). 
  // This parameter tells the calculator about type of algorithm tested.
  expectedSpeed: AlgorithmSpeed.SLOW,
  // Tested code with function call and argument placeholder
  content: 'function firstLetters(words) { /*...*/ };firstLetters({funcArgs});',
  // Type of arguments to generate for tested code
  testedFunctionName: BuiltInArgumentTypes.WORDS
};

// AnalysisService.analyze returns a promisified BigO value
calculator.analyze(code)
  .then(analysisResult => {
    console.log(analysisResult.bigO); // O(n)
  });
```
More details on the meaning of [Code](src/structures/Code.ts) parameters can be found 
in [Extending Calculator Functionality](#extending-calculator-functionality) section.
### Insight
This section describes how the transformation from [Code](src/structures/Code.ts) 
to [BigO](src/structures/BigO.ts) is done in the calculator. 
The logic for [AnalysisService](src/AnalysisService.ts#L22) is the following:
```
(Code) -> [Creator] -> [Runner] -> [Calculator] -> (BigO)
                          ^              |
                          |______________|
```
##### Creator
1. Determine sample sizes `N[]` essential to calculate time complexity. 
   Defaults are  `[16, 32, 128, 256, 512, 1024, 2048, 4096]`
2. For each `N` generate the samples based on `testedFunctionName`.
   [Built-in argument types](src/creator/generator/ArgumentGenerator.ts#L10) can be used.
   Examples of arguments generated for sample size 16:  
   - `BuiltInArgumentTypes.WORDS`: 
     ```json
     "qbrtpygpd xl jmt hhpynvgb cdnsjgofyg fxserr qecaegdcj tfgsleqvis eecuidbg fmx rfqdwldmz rdkrf qsqstb mnkfml qvw rftsinug"
     ```
   - `BuiltInArgumentTypes.ALPHA_STRING`: 
     ```json
     "xrjzvprvxsnqqqcq"
     ```
   - `BuiltInArgumentTypes.NUMBER_STRING`: 
     ```json
     "4223913635625778"
     ```
   - `BuiltInArgumentTypes.NUMBER`: 
     ```json
     16
     ```
   - `BuiltInArgumentTypes.RANDOM_NUMBERS`: 
     ```json
     [16, 11, 2, 11, 12, 9, 9, 2, 9, 3, 3, 1, 4, 14, 11, 6]
     ```
   - `BuiltInArgumentTypes.ORDERED_NUMBERS`: 
      ```json
     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      ```
3. Convert each sample to the proper syntax for given language
4. Inject sample into tested function
Test set created for example in [Analysis](#analysis) section would look similar to this:
 ```javascript
let created = {
  code: {
    language: Language.JS,
    expectedSpeed: AlgorithmSpeed.SLOW,
    content: 'function firstLetters(words) { /*...*/ };firstLetters({funcArgs});',
    testedFunctionName: BuiltInArgumentTypes.WORDS
  },
  samples: [
    {
      n: 16,
      code: 'function firstLetters(words) { /*...*/ };firstLetters("qbrtpygpd xl jmt hhpynvgb cdnsjgofyg fxserr qecaegdcj tfgsleqvis eecuidbg fmx rfqdwldmz rdkrf qsqstb mnkfml qvw rftsinug");'
    },
    {
      n: 32,
      code: 'function firstLetters(words) { /*...*/ };firstLetters(/*...*/);'
    },
    //...
  ],
}
```
##### Runner
By default [cb-code-runner](https://github.com/coderbyte-org/cb-code-runner) is used.
It is able to measure the run time of a tested sample. Samples are passed to the runner one by one. 
When sample measuring is done, duration is passed to Calculator as a test result.

##### Calculator
By default [GenericCalculator](src/calculator/GenericCalculator.ts) is used.
It is designed to determine the `BigO` based on as few run time durations as possible.
It compares durations with each other to see at which `N` times start to grow and by how much.
Based on this information it is returning the `BigO`. If Calculator is unable to determine the BigO for given 
test result set [AnalysisService](src/AnalysisService.ts#L22) runs more samples at the Runner. 
If there is no more samples to run and Calculator is still not sure about the `BigO`, 
optimal complexity is returned (`BigO.LINEAR`). 

## Extending Calculator Functionality
### AnalysisService config
```typescript
type AnalysisServiceConfig = {
  optimalComplexities?: Map<string, BigO>,
  calculators?: Map<Language, Calculator>,
  repeatedSamples?: Map<Language, number[]>,
  defaultCalculator?: Calculator,
}
```
#### Optimal complexities
If the Calculator is not able to notice any pattern in test results, after duration measuring for each sample, it will return the optimal complexity, 
which by default is equal to `BigO.LINEAR`. 
`optimalComplexity` config parameter can be used to set different complexity for different tested functions.

```typescript
import {AnalysisService} from "./AnalysisService";

const optimalComplexities = new Map<string, BigO>([
  [BuiltInArgumentTypes.WORDS, BigO.LOGLINEAR],
  ['someMatrixFunction', BigO.QUADRATIC],
]);
const calculator = new AnalysisService(codeRunner, {optimalComplexities});
```
#### Calculators
Since different languages tend to run code in different time, 
custom calculators can be added for each language by using `calculators` parameter of the config. 
All new calculators must implement the [Calculator](src/calculator/Calculator.ts) interface.

```typescript
class ClojureCalculator extends GenericCalculator {
  // implementation of rules specific for clojure run times.
  // ...
}

const calculators = new Map<Language, Calculator>([
  [Language.CLOJURE, new ClojureCalculator()]
]);

const calculator = new AnalysisService(codeRunner, {calculators});
```
#### Default calculator
By default, instance of [GenericCalculator](src/calculator/GenericCalculator.ts) is used.
You can override this by setting `defaultCalculator` config parameter.
```typescript
class BetterCalculator implements Calculator {
  // some logic
}
const calculator = new AnalysisService(codeRunner, {defaultCalculator: new BetterCalculator()});
```

#### Repeated samples
Sometimes specific samples need to be run several times at Runner to reduce randomness in test results.
Samples set in `repeatedSamples` parameter for chosen language 
will be run 3 times and average time will be passed to Calculator.

```typescript
import {Language} from "./Language";

const repeatedSamples = new Map<Language, number[]>([
  [Language.KOTLIN, [128, 256, 512]]
]);
const calculator = new AnalysisService(codeRunner, {repeatedSamples});
```
### Customize sample sizes
#### Setting sample sizes per language
Our tests show that for some language more sample sizes should be added to determine `BigO` more reliably.
This can be done by calling `AnalysisService.addTestSetCreatorDefaultLanguageSet()` as in the example below.

[GenericCalculator](src/calculator/GenericCalculator.ts) will only handle sample sizes 
defined in [SampleSize](src/creator/generator/SampleSize.ts) class, but any sample sizes can be used for custom calculators. 

```typescript
const calculator = new AnalysisService(codeRunner);
calculator.addTestSetCreatorDefaultLanguageSet(Language.PHP, [16, 128, 1024, 8192, 65536]);
calculator.addTestSetCreatorDefaultLanguageSet(
    Language.JS,
    TestSetCreator.DEFAULT_SAMPLES.concat([SampleSize.n16K, SampleSize.n32K])
);
```

#### Sample sizes versus algorithm speed
Code which operates on integers tend to produce lower run times. 
BigO Calculator can run different sample size for different algorithms, based on `expectedSpeed`.
`AnalysisService.addTestSetCreatorSpeedLanguageSet()` method can be used to set custom sample set for each algorithm speed.
```typescript
const calculator = new AnalysisService(codeRunner);
calculator.addTestSetCreatorSpeedLanguageSet(
  Language.JS, 
  AlgorithmSpeed.FAST, 
  [SampleSize.n16, SampleSize.n32, SampleSize.n2K, SampleSize.n4K, SampleSize.n16K, SampleSize.n32K]
);
```
### Argument generators
This library includes some basic generators, which create arguments for tested functions.
Some functions might need custom arguments and this can be achieved in two ways:
#### Custom function name + built-in generator
Calling `AnalysisService.useBuiltInGenerator()` method allows to set a built-in generator function 
for any tested function you want to run. Following example shows the possible use case:
```typescript
const config: AnalysisServiceConfig = {
  optimalComplexities: new Map<string, BigO>([
    ['fancySortingAlgorithm', BigO.LOGLINEAR]
  ])
}

const calculator = new AnalysisService(codeRunner, config);
calcualtor.useBuiltInGenerator('fancySortingAlgorithm', BuiltInArgumentTypes.RANDOM_NUMBERS);

const code: Code = {
  language: Language.JS,
  expectedSpeed: AlgorithmSpeed.FAST,
  content: 'function fancySortingAlgorithm(arrArg) { /*...*/ };fancySortingAlgorithm({funcArgs});',
  testedFunctionName: 'fancySortingAlgorithm'
}
calculator.analyze(code);
```
#### Custom generator function
Anything can be generated and injected into the tested function as an argument. `AnalysisService.addCustomGenerator()` method allows 
you to add a custom [ArgumentGeneratingFunction](src/creator/generator/ArgumentGenerator.ts#L19) for specific functions.  
```typescript
const calculator = new AnalysisService(codeRunner);
calcualtor.addCustomGenerator('customObjectTransformingFunction', n => {
  let customObject = {};
  customObject.property = n;
  // ...
  return customObject;
});

const code: Code = {
  language: Language.JS,
  expectedSpeed: AlgorithmSpeed.SLOW,
  content: 'function customObjectTransformingFunction(objArg) { /*...*/ };customObjectTransformingFunction({funcArgs});',
  testedFunctionName: 'customObjectTransformingFunction'
}
calculator.analyze(code);
```

### Replacement patterns
By default, BigO Calculator replaces `{funcArgs}` with generated arguments for testing.
This pattern can be customized for each language by calling `AnalysisService.addLanguageReplacePattern()` method.

```typescript
const calculator = new AnalysisService(codeRunner);
calculator.addLanguageReplacePattern(Language.GO, 'input()');

const code: Code = {
  language: Language.GO,
  expectedSpeed: AlgorithmSpeed.SLOW,
  content: 'package main\nfunc reverse(str string) string {\n/*...*/\n}\nfunc main() {\n  reverse(input())\n}',
  testedFunctionName: BuiltInArgumentTypes.ALPHA_STRING
}
calculator.analyze(code);

```
`RegExp` can be used as a replacement pattern 
```typescript
const calculator = new AnalysisService(codeRunner);
calculator.addLanguageCodeTransformer(Language.JS, /io\([a-z]*\)/g);
const code: Code = {
  language: Language.JS,
  expectedSpeed: AlgorithmSpeed.SLOW,
  content: 'function reverse(strArg) {/*...*/}; reverse(io(abc));',
  testedFunctionName: BuiltInArgumentTypes.ALPHA_STRING
}
calculator.analyze(code);
```
### Custom code transformers
Code sent to Runner can be transformed by calling `AnalysisService.addLanguageCodeTransformer()` method 
with [CodeTransformerFunction](src/creator/transformer/CodeTransformer.ts#L4) as a parameter.

```typescript
const calculator = new AnalysisService(codeRunner);
calculator.addLanguageCodeTransformer(Language.PHP, code => {
  return '<?php\n' + code;
});
```