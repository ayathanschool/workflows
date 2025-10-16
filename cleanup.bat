@echo off
echo ===============================
echo SchoolFlow Cleanup Script
echo ===============================
echo This script will remove test, debug and mock files from the project.
echo A backup of removed files will be created in the 'cleanup-backup' folder.

echo.
echo Creating backup directory...
mkdir cleanup-backup 2>nul

echo.
echo Backing up files before removal...
xcopy testAPI.js cleanup-backup\ /Y
xcopy testRealAPI.js cleanup-backup\ /Y
xcopy testMockTimetable.js cleanup-backup\ /Y
xcopy testTimetableLoading.js cleanup-backup\ /Y
xcopy test-duplicates.js cleanup-backup\ /Y
xcopy testLessonPlanDuplicateDetection.js cleanup-backup\ /Y
xcopy token-test.js cleanup-backup\ /Y
xcopy src\tests\timetable-times.test.js cleanup-backup\ /Y
xcopy backend-deployable\testAPI.js cleanup-backup\ /Y
xcopy fix-app.js cleanup-backup\ /Y
xcopy login-test.html cleanup-backup\ /Y
xcopy public\calendar_test.html cleanup-backup\ /Y
xcopy public\date-format-test.html cleanup-backup\ /Y
xcopy public\google-auth-test.html cleanup-backup\ /Y
xcopy src\App.jsx.new cleanup-backup\ /Y
xcopy src\demoData.js cleanup-backup\ /Y
xcopy src\disableMockData.js cleanup-backup\ /Y
xcopy src\App.jsx.lessonplan.patch cleanup-backup\ /Y
xcopy src\GoogleAuthProvider.update.jsx cleanup-backup\ /Y
xcopy src\DailyReportTimetableFixed.jsx cleanup-backup\ /Y
xcopy src\utils\apiTest.js cleanup-backup\ /Y
xcopy src\api.js.enhanced cleanup-backup\ /Y

echo Backing up dev-artifacts folder (if present)...
xcopy dev-artifacts cleanup-backup\dev-artifacts\ /E /I /Y

echo.
echo Backing up unwanted Apps Script files...
xcopy Appscript\Code.gs.fixed cleanup-backup\Appscript\ /Y
xcopy Appscript\Code.gs.update cleanup-backup\Appscript\ /Y
xcopy Appscript\Code.gs.updated cleanup-backup\Appscript\ /Y
xcopy Appscript\_handleGoogleLogin.gs cleanup-backup\Appscript\ /Y
xcopy Appscript\GOOGLE_LOGIN_FIX.gs cleanup-backup\Appscript\ /Y
xcopy Appscript\google_login_additions.gs cleanup-backup\Appscript\ /Y
xcopy Appscript\SimpleAuthTest.gs cleanup-backup\Appscript\ /Y
xcopy Appscript\types.d.ts.reference cleanup-backup\Appscript\ /Y
xcopy Appscript\types.gs.reference cleanup-backup\Appscript\ /Y
xcopy Appscript\TestGoogleAuth.gs cleanup-backup\Appscript\ /Y
xcopy Appscript\TestOAuth.gs cleanup-backup\Appscript\ /Y
xcopy Appscript\TestCalendarAPI.gs cleanup-backup\Appscript\ /Y
xcopy Appscript\Appscript\code.gs.update.js cleanup-backup\Appscript\ /Y

echo.
echo Removing test and debug files...
del testAPI.js 2>nul
del testRealAPI.js 2>nul
del testMockTimetable.js 2>nul
del testTimetableLoading.js 2>nul
del test-duplicates.js 2>nul
del testLessonPlanDuplicateDetection.js 2>nul
del token-test.js 2>nul
del src\tests\timetable-times.test.js 2>nul
del backend-deployable\testAPI.js 2>nul
del fix-app.js 2>nul

echo.
echo Removing HTML test pages...
del login-test.html 2>nul
del public\calendar_test.html 2>nul
del public\date-format-test.html 2>nul
del public\google-auth-test.html 2>nul

echo.
echo Removing backup and duplicate files...
del src\App.jsx.new 2>nul
del src\App.jsx.lessonplan.patch 2>nul
del src\GoogleAuthProvider.update.jsx 2>nul
del src\DailyReportTimetableFixed.jsx 2>nul
del src\utils\apiTest.js 2>nul
del src\api.js.enhanced 2>nul

echo.
echo Removing mock and demo data...
del src\demoData.js 2>nul
del src\disableMockData.js 2>nul

echo.
echo Removing dev-artifacts folder (if present)...
rmdir /S /Q dev-artifacts 2>nul

echo.
echo Removing unwanted Apps Script files...
del Appscript\Code.gs.fixed 2>nul
del Appscript\Code.gs.update 2>nul
del Appscript\Code.gs.updated 2>nul
del Appscript\_handleGoogleLogin.gs 2>nul
del Appscript\GOOGLE_LOGIN_FIX.gs 2>nul
del Appscript\google_login_additions.gs 2>nul
del Appscript\SimpleAuthTest.gs 2>nul
del Appscript\types.d.ts.reference 2>nul
del Appscript\types.gs.reference 2>nul
del Appscript\TestGoogleAuth.gs 2>nul
del Appscript\TestOAuth.gs 2>nul
del Appscript\TestCalendarAPI.gs 2>nul
rmdir /S /Q Appscript\Appscript 2>nul

echo.
echo Cleanup complete!
echo A log of removed files can be found in REMOVED_FILES.md

echo.
pause