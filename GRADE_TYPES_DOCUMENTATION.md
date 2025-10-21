# GradeTypes Sheet Documentation

## Overview
The GradeTypes sheet is a crucial component of the SchoolFlow system that defines standard exam grading schemes used throughout the application. It standardizes how different exam types are structured in terms of marking allocations.

## Purpose and Significance
The GradeTypes sheet serves several important purposes:

1. **Standardization**: Ensures consistent grading structures across the school for each type of exam
2. **Automation**: Populates default values in the exam creation forms
3. **Validation**: Provides reference data to validate exam marks against maximum values
4. **Reporting**: Supports accurate report card generation by defining the maximum possible marks

## Structure
The GradeTypes sheet contains the following columns:

| Column | Description |
|--------|-------------|
| examType | The name of the exam type (e.g., "First Term Exam", "Unit Test", "Final Exam") |
| internalMax | Maximum possible internal assessment marks for this exam type |
| externalMax | Maximum possible external/written exam marks for this exam type |
| totalMax | Total maximum marks (typically the sum of internalMax and externalMax) |

## How It's Used in the Application

### Exam Creation
- When teachers or administrators create a new exam, they select an exam type from a dropdown populated from the GradeTypes sheet
- The system automatically fills in the default internal and external maximum marks based on the selected exam type
- This ensures consistency and reduces manual data entry errors

### Report Card Generation
- The report card system uses the totalMax value to calculate percentages and determine grades
- Grade boundaries are applied against percentages to assign letter grades
- Multiple exams of the same type will have consistent maximum marks for fair comparison

### Mark Entry Forms
- The mark entry forms validate that teachers cannot enter marks exceeding the defined maximums
- Internal mark fields are only shown when internalMax > 0

## Relationship with Other Components

### GradeBoundaries Sheet
Works in conjunction with the GradeTypes sheet to define how percentages map to letter grades (A+, A, B+, etc.)

### Exams Sheet
Stores actual exam instances that reference examType from GradeTypes for their structure

### ExamMarks Sheet
Contains the actual marks for students, which are validated against the maximum values defined in GradeTypes

## Maintenance Guidelines
1. Always ensure new exam types are added to the GradeTypes sheet before creating exams
2. Do not modify existing examType names once they are in use
3. When changing internalMax or externalMax values, consider the impact on existing exams
4. Ensure totalMax accurately reflects the sum of internalMax and externalMax

## Best Practices
1. Use standardized naming conventions for examTypes (e.g., "First Term Exam", "Second Term Exam")
2. Keep the number of different exam types manageable to avoid confusion
3. Document any special grading schemes in the notes section
4. Review and update grade types at the beginning of each academic year