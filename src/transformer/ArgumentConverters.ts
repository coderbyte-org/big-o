import {Language} from "../structures";

function convertString(argument: string, language: Language): string {
    return '"' + argument + '"';
}

function convertArray(argument: Array<any>, language: Language): string {
    let arrayMemberType = typeof argument[0];
    if (arrayMemberType === 'string') {
        argument = argument.map(value => convertString(value, language));
    }
    let arrayArgument: string;
    switch (language) {
        case Language.KOTLIN:
            arrayArgument = 'arrayOf(' + argument.join(',') + ')';
            break;
        case Language.SCALA:
            arrayArgument = 'Array(' + argument.join(',') + ')';
            break;
        case Language.C:
        case Language.CPP:
            arrayArgument = '{' + argument.join(',') + '}';
            break;
        case Language.CLOJURE:
            arrayArgument = '(into-array [' + argument.join(',') + '])';
            break;
        case Language.JAVA:
            if (arrayMemberType === 'number') {
                arrayArgument = 'new int[] {' + argument.join(',') + '}';
            } else {
                arrayArgument = 'new String[] {' + argument.join(',') + '}';
            }
            break;
        case Language.GO:
            if (arrayMemberType === 'number') {
                arrayArgument = '[]int {' + argument.join(',') + '}';
            } else {
                arrayArgument = '[]string {' + argument.join(',') + '}';
            }
            break;
        case Language.CSHARP:
            if (arrayMemberType === 'number') {
                arrayArgument = 'new int[] {' + argument.join(',') + '}';
            } else {
                arrayArgument = 'new string[] {' + argument.join(',') + '}';
            }
            break;
        default:
            arrayArgument = '[' + argument.join(',') + ']';

    }
    return arrayArgument;
}

export {
    convertString,
    convertArray
}