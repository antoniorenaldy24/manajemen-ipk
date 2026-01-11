"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertGradeToPoint = convertGradeToPoint;
/**
 * Converts a letter grade/score to a numerical weight (bobot).
 * Standard Mapping:
 * A  = 4.0
 * A- = 3.7
 * B+ = 3.3
 * B  = 3.0
 * B- = 2.7
 * C+ = 2.3
 * C  = 2.0
 * D  = 1.0
 * E  = 0.0
 *
 * @param grade - The letter grade (case-insensitive).
 * @returns The grade point (number) or 0.0 if invalid.
 */
function convertGradeToPoint(grade) {
    var _a;
    if (!grade)
        return 0.0;
    // Normalize input
    const normalizedGrade = grade.trim().toUpperCase();
    const gradeMap = {
        'A': 4.0,
        'A-': 3.7,
        'B+': 3.3,
        'B': 3.0,
        'B-': 2.7,
        'C+': 2.3,
        'C': 2.0,
        'D': 1.0,
        'E': 0.0,
    };
    // Return mapped value or default to 0.0 if not found
    return (_a = gradeMap[normalizedGrade]) !== null && _a !== void 0 ? _a : 0.0;
}
