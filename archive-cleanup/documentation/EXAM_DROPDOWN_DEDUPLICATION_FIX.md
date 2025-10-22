# Exam Dropdown Deduplication Fix

## Issue
When a class teacher created multiple exams for different subjects with the same exam type (e.g., "First Term HS"), the Report Card exam dropdown would show duplicate entries of the same exam type - one for each subject.

For example:
- First Term HS (for English)
- First Term HS (for Math)
- First Term HS (for Science)
- etc.

This created a confusing user experience because:
1. Teachers only need to select the exam type (e.g., "First Term HS"), not individual subject exams
2. The dropdown was cluttered with repeated entries
3. It wasn't clear which option to select to generate a complete report card

## Root Cause
In the SchoolFlow system, exams are stored at the subject level:
- When a teacher creates a "First Term" exam for multiple subjects
- The system creates separate exam records for each subject-exam combination
- Each record has the same exam type but a different subject
- The Report Card dropdown was showing every individual exam record, not deduplicated exam types

## Solution
We modified the ReportCard.jsx component to deduplicate the exam types in the dropdown:

1. Instead of directly mapping over all exams, we first extract unique exam types:
   ```jsx
   Array.from(new Set(exams.map(exam => exam.examType || exam.examName.split(' - ')[0])))
   ```

2. For each unique exam type, we find the first exam with that type:
   ```jsx
   const firstExamWithType = exams.find(exam => 
     (exam.examType || exam.examName.split(' - ')[0]) === examType
   );
   ```

3. We use that exam's ID as the value for the dropdown option:
   ```jsx
   <option key={firstExamWithType.examId} value={firstExamWithType.examId}>
     {examType}
   </option>
   ```

## Benefits
1. **Cleaner UI**: The dropdown now shows each exam type only once
2. **Improved User Experience**: Class teachers can easily select the correct exam type
3. **Consistent Behavior**: All subjects under the same exam type are associated with one dropdown option

## Testing
This fix has been tested to ensure:
1. Each exam type appears only once in the dropdown
2. Selecting an exam type properly generates a report card with all relevant subjects
3. The system uses the first exam's ID for each type to retrieve all related subject exam data

## Implementation Details
The key change was to use JavaScript's Set object to extract unique exam type values before rendering the dropdown options.