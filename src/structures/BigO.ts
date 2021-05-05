enum BigO {
    CONSTANT = 'O(1)',
    LOGARITHMIC = 'O(log n)',
    LINEAR = 'O(n)',
    LOGLINEAR = 'O(n log n)',
    QUADRATIC = 'O(n^2)',
    POLYNOMIAL = 'O(n^c)',
    EXPONENTIAL = 'O(c^n)',
    FACTORIAL = 'O(n!)',
    UNKNOWN = 'unknown'
}

export {BigO};