import {CharacterSet, generateNthLetterIndex} from '../../dist';
import assert = require('assert');
import {generateNumberArray} from '../../src';

describe('generateNthLetterIndex', () => {
    CharacterSet.ALPHA.split('').forEach((letter, index) => {
        const ucLetter: string = letter.toUpperCase();
        it('should return ' + ucLetter, () => {
            assert.strictEqual(generateNthLetterIndex(index + 1), ucLetter);
        });
    });

    it('should return AA', () => {
        assert.strictEqual(generateNthLetterIndex(27), 'AA');
    });
    it('should return BB', () => {
        assert.strictEqual(generateNthLetterIndex(28), 'BB');
    });
    it('should return ZZ', () => {
        assert.strictEqual(generateNthLetterIndex(52), 'ZZ');
    });
    it('should return AAA', () => {
        assert.strictEqual(generateNthLetterIndex(53), 'AAA');
    });
});

describe('generateNumberArray', () => {
    it('should generate consecutive numbers', () => {
        assert.deepStrictEqual(
            generateNumberArray(3),
            [1,2,3]
        );
    });
    it('should generate numbers in range', () => {
        assert.deepStrictEqual(
            generateNumberArray(5, [0,0]),
            [0,0,0,0,0]
        );
    });
});