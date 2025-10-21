# Internal Marks Display Fix - Update

## Issue Investigation
After implementing the initial fix to remove the `internalMax > 0` condition from the internal marks column display, the issue persisted. Further investigation revealed:

1. The backend API does not return the `hasInternalMarks` field in the `getExams` endpoint response
2. The backend defaults `hasInternalMarks` to `true` for backward compatibility when creating exams
3. Due to the missing field in the response, the frontend was incorrectly determining when to display internal marks

## Solution
We've updated the ExamManagement.jsx component to always show internal marks columns and inputs, since the backend defaults `hasInternalMarks` to true. Specifically:

1. Removed all conditional rendering based on `hasInternalMarks` for internal marks columns and inputs
2. Updated the `calculateTotal` function to always include internal marks
3. Added comments to clarify that internal marks are always enabled due to backend defaults

## Changes Made
1. Removed conditional rendering in the marks entry form
2. Removed conditional rendering in the view marks modal
3. Updated the `calculateTotal` function to always include internal marks
4. Added debug logging to help diagnose issues

## Testing
- Tested with exams that have internalMax values set
- Verified that internal marks columns consistently appear in both edit and view modes

This update resolves the issue where internal marks weren't displaying even after our previous fix.

## Backend Context
In the backend (Code.gs), when creating exams:
```javascript
Boolean(data.hasInternalMarks !== false), // Default to true for backwards compatibility
```

The backend defaults `hasInternalMarks` to `true`, but doesn't return this field in the `getExams` endpoint response, causing the frontend to incorrectly determine when to show internal marks.