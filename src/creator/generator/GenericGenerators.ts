abstract class CharacterSet {
    static ALNUM = 'abcdefghijklmnopqrstuvwxyz0123456789';
    static ALPHA = 'abcdefghijklmnopqrstuvwxyz';
    static NUM = '0123456789';
}

function generateConsecutiveNumbers(n: number, start = 1): number[] {
    const args: number[] = [];
    for (let i = start; i < (n + start); i++) {
        args.push(i);
    }
    return args;
}

function generateNumberArray(n: number, range: number[] = []): number[] {
    let generator = function (n: number): number {
        return n;
    };
    if (range[0] !== undefined && range[1] !== undefined) {
        generator = function () {
            const max: number = range[1] - range[0];
            return Math.round(Math.random() * max) + range[0];
        };
    }
    const args: number[] = [];
    for (let i = 1; i <= n; i++) {
        args.push(generator(i));
    }
    return args;
}

function generateNumber(min: number, max: number): number {
    const multiplier: number = max - min;
    return Math.round(Math.random() * multiplier) + min;
}

function generateNumberString(n: number): string {
    return generateString(n, CharacterSet.NUM);
}

function generateStringArray(n: number, stringLength: number, set: string | Array<string | number>, range = false): string[] {
    const arr: string[] = [];
    let currLen: number = stringLength;
    for (let i = 0; i < n; i++) {
        if (range) {
            currLen = Math.ceil(Math.random() * stringLength);
        }
        const curr: string = generateString(currLen, set);
        arr.push(curr);
    }
    return arr;
}

function generateString(n: number, characterSet: string | Array<string | number>): string {
    if (!Array.isArray(characterSet)) {
        characterSet = characterSet.split('');
    }
    const limit = characterSet.length - 1;
    let result = '';
    for (let i = 1; i <= n; i++) {
        const key: number = Math.round(Math.random() * limit);
        result += <string>characterSet[key];
    }
    return result;
}

function generateSuperIncreasing(n: number): number[] {
    let sum = 0;
    const arr: number[] = [];
    for (let i = 1; i <= n; i++) {
        sum += i;
        arr.push(sum);
    }
    return arr;
}

function generateTreeConstructorArguments(n: number): string[] {
    const args: string[] = [];
    for (let i = 1; i < n; i++) {
        const pair: string = '(' + (i + 1) + ',' + i + ')';
        args.push(pair);
    }
    return args;
}

function generateRandomTime(): string {
    const ts = Math.floor(Math.random() * (1000 * 60 * 60 * 24));
    const localString = new Date(ts).toLocaleTimeString('en-US');
    const len = localString.length;
    const timeOfDay = localString.substring(len - 2).toLowerCase();
    const parts = localString.split(':');
    return parts[0] + ':' + parts[1] + timeOfDay;
}

function generatePalindrome(n: number): string
{
    const odd: boolean = n % 2 !== 0;
    const half: number = Math.round(n/2);
    const part: string = generateString(half, CharacterSet.ALPHA);
    let palindrome = part;
    if (odd) {
        palindrome += 'a';
    }
    palindrome += part.split('').reverse().join('');
    return palindrome;
}
// https://www.geeksforgeeks.org/program-for-nth-fibonacci-number/
// Method 7
function generateFibonacci(n: number): number
{
    const phi = (1 + Math.sqrt(5)) / 2;
    return Math.round(Math.pow(phi, n) / Math.sqrt(5));
}

function generateNthLetterIndex(n: number): string {
    const i: number = n - 1;
    const letterPosition: number = i % 26;
    const letterCount: number = Math.floor(i / 26 + 1);
    return generateString(letterCount, CharacterSet.ALNUM[letterPosition]).toUpperCase();
}

//https://www.geeksforgeeks.org/find-the-nth-row-in-pascals-triangle/
function generatePascalsTriangleNthRow(n: number): number []
{
    const row: number [] = [1];
    for(let i = 1; i <= n; i++)
    {
        const curr = (row[i-1] * (n - i + 1)) / i;
        row.push(curr);
    }
    return row;
}

export {
    CharacterSet,
    generateTreeConstructorArguments,
    generateSuperIncreasing,
    generateString,
    generateStringArray,
    generateNumberString,
    generateNumberArray,
    generateConsecutiveNumbers,
    generateRandomTime,
    generatePalindrome,
    generateFibonacci,
    generateNthLetterIndex,
    generatePascalsTriangleNthRow,
    generateNumber,
};