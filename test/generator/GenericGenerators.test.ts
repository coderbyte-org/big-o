import {CharacterSet, generateNthLetterIndex} from '../../dist';
import assert = require('assert');

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