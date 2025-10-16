/**
 * Implementation guide for fixing duplicate lesson plans
 * 
 * This document provides instructions for implementing the fix to prevent 
 * duplicate lesson plans in the SchoolFlow application.
 */

# Duplicate Lesson Plan Prevention

The issue reported is that multiple lesson plans (up to 6) are being created for the same period 
when they should be unique. This implementation guide explains the changes needed to fix this issue.

## Backend Changes (Google Apps Script)

### 1. Add the new LessonPlanDuplicateDetection.gs file

The `LessonPlanDuplicateDetection.gs` file contains helper functions for improved duplicate detection:

- `checkDuplicateLessonPlan()` - Checks if a lesson plan with the same class/subject/session/chapter exists
- `findBestLessonPlanMatch()` - Finds the best candidate row to update based on a priority system
- `submitLessonPlanDetailsEnhanced()` - Enhanced version of the function with better duplicate detection
- `testLessonPlanDuplicateDetection()` - Test function to verify the implementation

Add this file to your Apps Script project by copying the content from:
`c:\Users\LENOVO\Downloads\schoolflow-ready\Appscript\LessonPlanDuplicateDetection.gs`

### 2. Modify the Code.gs file

Replace the `submitLessonPlanDetails` function in Code.gs with the updated version from:
`c:\Users\LENOVO\Downloads\schoolflow-ready\Appscript\submitLessonPlanDetails.fix.js`

This modification:
- Adds robust duplicate detection based on class/subject/session/chapter
- Returns clear error messages when duplicates are detected
- Prioritizes updating existing rows instead of creating duplicates
- Adds detailed logging for troubleshooting

## Frontend Changes (React)

### 1. Add the lesson plan validation utility

Add the new validation utility file:
`c:\Users\LENOVO\Downloads\schoolflow-ready\src\utils\lessonPlanValidation.js`

This file provides:
- `validateLessonPlan()` - Checks if a plan would be a duplicate before submission
- `fetchExistingPlans()` - Fetches current plans to check against
- `submitLessonPlanWithValidation()` - Enhanced submission with validation

### 2. Update the lesson plan submission in App.jsx

Update the `handleSubmitPreparation` function in App.jsx to add the following validation before submission:

```jsx
// At the top of the file
import { validateLessonPlan, fetchExistingPlans } from './utils/lessonPlanValidation';

// In the handleSubmitPreparation function, before the existing duplicate check
// Add this code at around line 1190, before the try/catch block
const validationResult = validateLessonPlan({
  class: selectedSlot.class,
  subject: selectedSlot.subject,
  session: Number(preparationData.session || selectedSlot.period),
  chapter: schemes.find(s => s.schemeId === preparationData.schemeId)?.chapter || '',
  lpId: selectedSlot.lpId
}, lessonPlans);

if (validationResult.isDuplicate) {
  setToast({ 
    type: 'warning', 
    text: validationResult.message
  });
  setTimeout(() => setToast(null), 3000);
  return;
}
```

Also add a warning notification in the preparation form to inform users:

```jsx
{/* Add this above the form inputs in the preparation form */}
<div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
  <p className="font-bold">Important:</p>
  <p>Lesson plans are specific to a class-subject-session-chapter combination.</p>
  <p>You cannot create multiple plans for the same combination.</p>
</div>
```

## Testing the Implementation

1. Deploy the updated Apps Script code to your Google Apps Script project
2. Build and deploy the updated React frontend
3. Test the lesson plan creation flow:
   - Try to create a lesson plan for a specific class, subject, session and chapter
   - Then try to create another plan for the same combination
   - Verify that the system prevents the duplicate and shows a clear error message

## Notes

- The backend validation serves as the source of truth, since it will prevent duplicates even if frontend validation is bypassed
- The frontend validation improves the user experience by catching duplicates earlier
- Detailed logs are added to help troubleshoot any remaining issues
- The code is designed to be non-disruptive to other functionality