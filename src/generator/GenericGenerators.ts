abstract class CharacterSet {
    static ALNUM: string = 'abcdefghijklmnopqrstuvwxyz0123456789';
    static ALPHA: string = 'abcdefghijklmnopqrstuvwxyz';
    static NUM: string = '0123456789';
}

function generateConsecutiveNumbers(n: number, start: number = 1): number[] {
    let args: number[] = [];
    for (let i = start; i < (n + start); i++) {
        args.push(i);
    }
    return args;
}

function generateNumberArray(n: number, range: number[] = []): number[] {
    let generator = function (n: number): number {
        return n;
    }
    if (range[0] !== undefined && range[1] !== undefined) {
        generator = function (n: number) {
            let max: number = range[1] - range[0];
            return Math.round(Math.random() * max) + range[0];
        };
    }
    let args: number[] = [];
    for (let i = 1; i <= n; i++) {
        args.push(generator(i));
    }
    return args;
}

function generateNumber(min: number, max: number): number {
    let multiplier: number = max - min;
    return Math.round(Math.random() * multiplier) + min;
}

function generateNumberString(n: number): string {
    return generateString(n, CharacterSet.NUM);
}

function generateStringArray(n: number, stringLength: number, set: string | Array<string | number>, range: boolean = false): string[] {
    let arr: string[] = [];
    let currLen: number = stringLength;
    for (let i = 0; i < n; i++) {
        if (range) {
            currLen = Math.ceil(Math.random() * stringLength);
        }
        let curr: string = generateString(currLen, set);
        arr.push(curr);
    }
    return arr;
}

function generateString(n: number, characterSet: string | Array<string | number>): string {
    if (!Array.isArray(characterSet)) {
        characterSet = characterSet.split('');
    }
    let limit = characterSet.length - 1;
    let result: string = '';
    for (let i = 1; i <= n; i++) {
        let key: number = Math.round(Math.random() * limit)
        result += <string>characterSet[key];
    }
    return result;
}

function generateSuperIncreasing(n: number): number[] {
    let sum: number = 0;
    let arr: number[] = [];
    for (let i = 1; i <= n; i++) {
        sum += i;
        arr.push(sum);
    }
    return arr;
}

function generateTreeConstructorArguments(n: number): string[] {
    let args: string[] = [];
    for (let i = 1; i < n; i++) {
        let pair: string = '(' + (i + 1) + ',' + i + ')';
        args.push(pair);
    }
    return args;
}

function generateRandomTime(): string {
    let ts = Math.floor(Math.random() * (1000 * 60 * 60 * 24));
    let localString = new Date(ts).toLocaleTimeString("en-US");
    let len = localString.length;
    let timeOfDay = localString.substring(len - 2).toLowerCase();
    let parts = localString.split(':');
    return parts[0] + ':' + parts[1] + timeOfDay;
}

function generatePalindrome(n: number): string
{
    let odd: boolean = n % 2 !== 0;
    let half: number = Math.round(n/2);
    let part: string = generateString(half, CharacterSet.ALPHA);
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
    let phi = (1 + Math.sqrt(5)) / 2;
    return Math.round(Math.pow(phi, n) / Math.sqrt(5));
}

function generateNthLetterIndex(n: number): string {
    let i: number = n - 1;
    let letterPosition: number = i % 26;
    let letterCount: number = Math.floor(i / 26 + 1);
    return generateString(letterCount, CharacterSet.ALNUM[letterPosition]).toUpperCase();
}

//https://www.geeksforgeeks.org/find-the-nth-row-in-pascals-triangle/
function generatePascalsTriangleNthRow(n: number): number []
{
    let row: number [] = [1];
    for(let i = 1; i <= n; i++)
    {
        let curr = (row[i-1] * (n - i + 1)) / i;
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
}