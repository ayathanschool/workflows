# Files Removed From Project

The following files were removed as part of cleanup to prepare the application for production:

## Test and Debug Files
- `testAPI.js` - Debug utility for API testing
- `testRealAPI.js` - Test script for live API endpoints
- `testMockTimetable.js` - Test script for mock timetable data
- `testTimetableLoading.js` - Test for timetable loading performance
- `src/tests/timetable-times.test.js` - Unit test for timetable time calculations
- `backend-deployable/testAPI.js` - Test script for backend API
- `fix-app.js` - Debug script for App.jsx fixes

## HTML Test Pages
- `login-test.html` - Debug page for testing login flow
- `public/calendar_test.html` - Test page for calendar functionality
- `public/date-format-test.html` - Test for date formatting

## Backup and Duplicate Files
- `src/App.jsx.new` - Backup copy of App.jsx

## Mock and Demo Data
- `src/demoData.js` - Demo data used during development
- `src/disableMockData.js` - Utility for toggling mock data

## Explanation

These files were identified as non-essential to the application's production functionality. They were primarily used during development for testing, debugging, and demonstration purposes. Removing them helps:

1. Reduce project size
2. Eliminate potential sources of confusion
3. Remove non-production code paths
4. Improve security by removing development test pages

No production functionality is affected by these removals.