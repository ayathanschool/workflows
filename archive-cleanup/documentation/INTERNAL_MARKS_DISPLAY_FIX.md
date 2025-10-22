# Internal Marks Display Fix

## Issue
In the Exam Management module, exams with internal marks were not displaying the internal marks entry field in the marks form under certain conditions. Specifically:

1. The exam was configured with `hasInternalMarks=true`
2. The internal mark component was conditionally rendered based on checking both `hasInternalMarks` and `internalMax > 0`
3. This caused internal marks fields to be hidden when internal marks were enabled but the max value was not explicitly set

## Solution
The fix removed the unnecessary condition that was checking if `internalMax > 0`. The updated code now:

1. Only checks if `hasInternalMarks` is true (or 'true' as a string)
2. Shows the internal marks field regardless of the internalMax value (defaults to 0 if not set)
3. Ensures consistent behavior between the marks entry and marks viewing modals

## Changes Made
1. Updated the condition in the marks entry form table header
2. Updated the condition in the marks entry form table cell
3. Updated the condition in the view marks modal table header
4. Updated the condition in the view marks modal table cell
5. Added fallback to show "0" for internalMax if it's not set

These changes ensure that if internal marks are enabled for an exam, teachers can always enter and view those marks regardless of the internalMax value.

## Testing
Tested with:
- Exams that have internal marks enabled (hasInternalMarks=true) with different internalMax values
- Verified that internal marks column shows up correctly in both edit and view modes

This fix has been implemented as part of the ongoing improvements to the exam management system.