# Report Card Exam Display Fix

## Issue
In the class teacher's report card view, the exam dropdown was showing too much information, including:
- Full exam name (which includes class and subject)
- Class
- Date

This made the dropdown cluttered and confusing, especially when multiple exams for different subjects within the same exam type (like "First Term Exam") were displayed.

## Solution
1. Modified the exam dropdown in ReportCard.jsx to only display the exam type (e.g., "First Term Exam") instead of the full exam name with class and date.

2. Updated the report card header to show only the exam type rather than the full exam name.

## Benefits
1. **Simplified UI**: Cleaner, more concise dropdown options
2. **Better Classification**: Shows only the meaningful part of the exam name (the type)
3. **Consistent Display**: Exams of the same type now appear as the same item
4. **Reduced Confusion**: Class teachers can now clearly identify the exam type they want to generate reports for

## Implementation Details
Modified the exam option display in the dropdown from:
```jsx
{exam.examName} - {exam.class} ({formatShortDate(exam.examDate)})
```

To:
```jsx
{exam.examType || exam.examName.split(' - ')[0]}
```

This ensures that only the exam type is displayed in the dropdown, making it much easier for class teachers to select the correct exam when generating report cards.

## Related Components
- **ExamManagement.jsx**: Creates exams with names in the format "{examType} - {class} - {subject}"
- **ReportCard.jsx**: Now displays only the exam type in the dropdown
- **GradeTypes Sheet**: Defines the standard exam types used throughout the system