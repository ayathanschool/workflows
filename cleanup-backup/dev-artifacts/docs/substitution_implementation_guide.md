// Implementation guide for substitution module enhancement

To integrate the enhanced substitution module into your SchoolFlow application, follow these steps:

### 1. Overview of Changes

The new substitution workflow will be:
1. Select absent teacher first
2. View their timetable
3. Select a slot from their timetable to assign a substitute
4. Choose a substitute teacher from the free teachers list
5. Assign the substitution

### 2. File Structure Changes

- New component: `components/EnhancedSubstitutionModule.jsx` - standalone component for the substitution functionality
- Using the enhanced API with offline support: `api.enhanced.js`

### 3. Integration Steps

#### Step 1: Import the new component in App.jsx

Replace the existing SubstitutionsView with the new enhanced component:

```jsx
import EnhancedSubstitutionModule from './components/EnhancedSubstitutionModule';

// Then in your renderContent function, replace:
case 'substitutions':
  return <SubstitutionsView />;

// With:
case 'substitutions':
  return <EnhancedSubstitutionModule />;
```

#### Step 2: Ensure API Backend Support

The enhanced substitution module requires these API endpoints:
- `getTeacherWeeklyTimetable` - To fetch absent teacher's timetable
- `getVacantSlotsForAbsent` - To get slots that need substitution
- `getFreeTeachers` - To get list of available substitute teachers
- `assignSubstitution` - To assign a substitute
- `getDailyTimetableWithSubstitutions` - To display current substitutions

#### Step 3: Update Daily Reporting Module

To ensure substitution assignments appear in daily reports, update the daily reporting module to check if a teacher has substitution assignments:

```jsx
// In the daily reporting component:
useEffect(() => {
  async function fetchTeacherDailyData() {
    // Fetch regular timetable
    const timetable = await api.getTeacherDailyTimetable(user.email, selectedDate);
    
    // Also fetch substitutions to include them in daily reporting
    const subs = await api.getDailyTimetableWithSubstitutions(selectedDate);
    
    // Combine regular timetable with any substitution assignments
    let allSlots = [...timetable];
    
    if (subs && Array.isArray(subs.timetable)) {
      // Filter substitutions where this teacher is the substitute
      const teacherSubstitutions = subs.timetable.filter(
        slot => slot.isSubstitution && slot.teacher === user.email
      );
      
      // Add these to the timetable with a flag
      allSlots = [
        ...allSlots,
        ...teacherSubstitutions.map(sub => ({
          ...sub,
          isSubstitutionAssignment: true
        }))
      ];
    }
    
    setDailyTimetable(allSlots);
  }
  
  fetchTeacherDailyData();
}, [user.email, selectedDate]);
```

### 4. Data Structure

The substitution assignment requires this data structure:

```javascript
{
  date: "2023-10-03",            // Date of substitution
  absentTeacher: "teacher@example.com", // Email of absent teacher
  period: "2",                   // Period number
  class: "10A",                  // Class
  regularSubject: "Mathematics", // Original subject
  substituteTeacher: "sub@example.com", // Email of substitute teacher
  substituteSubject: "Physics"   // Optional: different subject if applicable
}
```

### 5. Testing the Integration

1. Make sure you're using the enhanced API client
2. Test with at least two teacher accounts (one absent, one substitute)
3. Verify substitutions appear in the daily reports of substitute teachers
4. Check that the backend correctly records and returns substitutions

### 6. Additional Considerations

- The enhanced module has improved error handling for API failures
- It includes visual indicators for selected slots and substitution assignments
- It allows leaving the substitute subject empty to keep the same subject