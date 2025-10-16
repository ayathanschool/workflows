// src/demoData.js
// This file contains demo data for when the app is in offline mode
// These are more comprehensive mock data sets than the simple ones in api.enhanced.js

// Demo user data
export const demoUsers = [
  {
    email: 'demo.teacher@example.com',
    name: 'Demo Teacher',
    role: ['teacher'],
    id: 'demo-teacher-1'
  },
  {
    email: 'demo.hm@example.com',
    name: 'Demo Headmaster',
    role: ['headmaster', 'teacher'],
    id: 'demo-hm-1'
  },
  {
    email: 'demo.ct@example.com',
    name: 'Demo Class Teacher',
    role: ['classteacher', 'teacher'],
    id: 'demo-ct-1'
  }
];

// Demo classes
export const demoClasses = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];

// Demo subjects organized by class
export const demoSubjectsByClass = {
  'Class 1': ['Mathematics', 'English', 'Science', 'Social Studies', 'Art'],
  'Class 2': ['Mathematics', 'English', 'Science', 'Social Studies', 'Physical Education'],
  'Class 3': ['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'History'],
  'Class 4': ['Mathematics', 'English Literature', 'Biology', 'Chemistry', 'Physics', 'Geography'],
  'Class 5': ['Advanced Mathematics', 'English Literature', 'Biology', 'Chemistry', 'Physics', 'Economics']
};

// All subjects flattened (for when class filter is not applied)
export const demoAllSubjects = [...new Set(
  Object.values(demoSubjectsByClass).flat()
)].sort();

// Demo exam types
export const demoExamTypes = [
  { examType: 'Unit Test', internalMax: 20, externalMax: 0, totalMax: 20 },
  { examType: 'Term Exam', internalMax: 30, externalMax: 70, totalMax: 100 },
  { examType: 'Mid Term', internalMax: 20, externalMax: 30, totalMax: 50 },
  { examType: 'Final Exam', internalMax: 30, externalMax: 70, totalMax: 100 }
];

// Demo exams
export const demoExams = [
  {
    examId: 'demo-exam-1',
    class: 'Class 1',
    subject: 'Mathematics',
    examType: 'Unit Test',
    date: '2023-05-15',
    creatorName: 'Demo Teacher',
    internalMax: 20,
    externalMax: 0,
    totalMax: 20
  },
  {
    examId: 'demo-exam-2',
    class: 'Class 2',
    subject: 'Science',
    examType: 'Final Exam',
    date: '2023-05-20',
    creatorName: 'Demo Teacher',
    internalMax: 30,
    externalMax: 70,
    totalMax: 100
  },
  {
    examId: 'demo-exam-3',
    class: 'Class 3',
    subject: 'Biology',
    examType: 'Mid Term',
    date: '2023-06-01',
    creatorName: 'Demo Teacher',
    internalMax: 20,
    externalMax: 30,
    totalMax: 50
  },
  {
    examId: 'demo-exam-4',
    class: 'Class 1',
    subject: 'English',
    examType: 'Term Exam',
    date: '2023-06-05',
    creatorName: 'Demo Headmaster',
    internalMax: 30,
    externalMax: 70,
    totalMax: 100
  }
];

// Demo students for classes
export const demoStudents = {
  'Class 1': [
    { admNo: '001', studentName: 'Alice Johnson' },
    { admNo: '002', studentName: 'Bob Smith' },
    { admNo: '003', studentName: 'Charlie Davis' },
    { admNo: '004', studentName: 'Diana Roberts' }
  ],
  'Class 2': [
    { admNo: '021', studentName: 'Ethan Wilson' },
    { admNo: '022', studentName: 'Fiona Brown' },
    { admNo: '023', studentName: 'George Miller' },
    { admNo: '024', studentName: 'Hannah Clark' }
  ],
  'Class 3': [
    { admNo: '031', studentName: 'Ian Wright' },
    { admNo: '032', studentName: 'Jane Adams' },
    { admNo: '033', studentName: 'Kevin Lewis' },
    { admNo: '034', studentName: 'Lily Moore' }
  ],
  'Class 4': [
    { admNo: '041', studentName: 'Mike Johnson' },
    { admNo: '042', studentName: 'Nancy Garcia' },
    { admNo: '043', studentName: 'Oliver Lee' },
    { admNo: '044', studentName: 'Patricia King' }
  ],
  'Class 5': [
    { admNo: '051', studentName: 'Quentin Harris' },
    { admNo: '052', studentName: 'Rachel White' },
    { admNo: '053', studentName: 'Sam Thompson' },
    { admNo: '054', studentName: 'Tina Martinez' }
  ]
};

// Demo exam marks
export const demoExamMarks = {
  'demo-exam-1': [
    { admNo: '001', studentName: 'Alice Johnson', internal: 18, external: null, total: 18, grade: 'A' },
    { admNo: '002', studentName: 'Bob Smith', internal: 15, external: null, total: 15, grade: 'B' },
    { admNo: '003', studentName: 'Charlie Davis', internal: 20, external: null, total: 20, grade: 'A+' },
    { admNo: '004', studentName: 'Diana Roberts', internal: 17, external: null, total: 17, grade: 'A' }
  ],
  'demo-exam-2': [
    { admNo: '021', studentName: 'Ethan Wilson', internal: 25, external: 60, total: 85, grade: 'A' },
    { admNo: '022', studentName: 'Fiona Brown', internal: 28, external: 65, total: 93, grade: 'A+' },
    { admNo: '023', studentName: 'George Miller', internal: 22, external: 55, total: 77, grade: 'B+' },
    { admNo: '024', studentName: 'Hannah Clark', internal: 26, external: 62, total: 88, grade: 'A' }
  ]
};

// Demo timetable data
export const demoTimetable = {
  'Monday': [
    { period: 1, class: 'Class 1', subject: 'Mathematics', teacher: 'Demo Teacher' },
    { period: 2, class: 'Class 2', subject: 'Science', teacher: 'Demo Teacher' },
    { period: 3, class: 'Class 3', subject: 'Biology', teacher: 'Demo Teacher' },
    { period: 4, class: 'Class 4', subject: 'Physics', teacher: 'Demo Headmaster' },
    { period: 5, class: 'Class 5', subject: 'Chemistry', teacher: 'Demo Class Teacher' }
  ],
  'Tuesday': [
    { period: 1, class: 'Class 2', subject: 'English', teacher: 'Demo Teacher' },
    { period: 2, class: 'Class 3', subject: 'Physics', teacher: 'Demo Teacher' },
    { period: 3, class: 'Class 1', subject: 'Social Studies', teacher: 'Demo Teacher' },
    { period: 4, class: 'Class 5', subject: 'Advanced Mathematics', teacher: 'Demo Headmaster' },
    { period: 5, class: 'Class 4', subject: 'Geography', teacher: 'Demo Class Teacher' }
  ],
  'Wednesday': [
    { period: 1, class: 'Class 3', subject: 'Chemistry', teacher: 'Demo Teacher' },
    { period: 2, class: 'Class 1', subject: 'Art', teacher: 'Demo Teacher' },
    { period: 3, class: 'Class 5', subject: 'Economics', teacher: 'Demo Teacher' },
    { period: 4, class: 'Class 2', subject: 'Physical Education', teacher: 'Demo Headmaster' },
    { period: 5, class: 'Class 4', subject: 'Biology', teacher: 'Demo Class Teacher' }
  ],
  'Thursday': [
    { period: 1, class: 'Class 4', subject: 'English Literature', teacher: 'Demo Teacher' },
    { period: 2, class: 'Class 5', subject: 'Physics', teacher: 'Demo Teacher' },
    { period: 3, class: 'Class 2', subject: 'Mathematics', teacher: 'Demo Teacher' },
    { period: 4, class: 'Class 3', subject: 'History', teacher: 'Demo Headmaster' },
    { period: 5, class: 'Class 1', subject: 'English', teacher: 'Demo Class Teacher' }
  ],
  'Friday': [
    { period: 1, class: 'Class 5', subject: 'Biology', teacher: 'Demo Teacher' },
    { period: 2, class: 'Class 4', subject: 'Chemistry', teacher: 'Demo Teacher' },
    { period: 3, class: 'Class 3', subject: 'Mathematics', teacher: 'Demo Teacher' },
    { period: 4, class: 'Class 2', subject: 'Social Studies', teacher: 'Demo Headmaster' },
    { period: 5, class: 'Class 1', subject: 'Science', teacher: 'Demo Class Teacher' }
  ]
};

// Demo attendance data
export const demoAttendance = {
  'Class 1': {
    '2023-05-15': [
      { admNo: '001', studentName: 'Alice Johnson', status: 'Present' },
      { admNo: '002', studentName: 'Bob Smith', status: 'Present' },
      { admNo: '003', studentName: 'Charlie Davis', status: 'Absent' },
      { admNo: '004', studentName: 'Diana Roberts', status: 'Present' }
    ]
  },
  'Class 2': {
    '2023-05-15': [
      { admNo: '021', studentName: 'Ethan Wilson', status: 'Present' },
      { admNo: '022', studentName: 'Fiona Brown', status: 'Present' },
      { admNo: '023', studentName: 'George Miller', status: 'Present' },
      { admNo: '024', studentName: 'Hannah Clark', status: 'Present' }
    ]
  }
};

// Demo grade boundaries
export const demoGradeBoundaries = [
  { grade: 'A+', minScore: 90 },
  { grade: 'A', minScore: 80 },
  { grade: 'B+', minScore: 75 },
  { grade: 'B', minScore: 70 },
  { grade: 'C+', minScore: 65 },
  { grade: 'C', minScore: 60 },
  { grade: 'D+', minScore: 55 },
  { grade: 'D', minScore: 50 },
  { grade: 'E', minScore: 0 }
];

// Demo student performance data
export const demoStudentPerformance = {
  'Class 1': [
    { admNo: '003', name: 'Charlie Davis', average: 95.5, examCount: 2 },
    { admNo: '001', name: 'Alice Johnson', average: 89.0, examCount: 2 },
    { admNo: '004', name: 'Diana Roberts', average: 85.5, examCount: 2 },
    { admNo: '002', name: 'Bob Smith', average: 77.5, examCount: 2 }
  ],
  'Class 2': [
    { admNo: '022', name: 'Fiona Brown', average: 93.0, examCount: 1 },
    { admNo: '024', name: 'Hannah Clark', average: 88.0, examCount: 1 },
    { admNo: '021', name: 'Ethan Wilson', average: 85.0, examCount: 1 },
    { admNo: '023', name: 'George Miller', average: 77.0, examCount: 1 }
  ]
};

// Demo function to get specific data by API endpoint name
export function getDemoDataByEndpoint(endpoint, params = {}) {
  switch (endpoint) {
    case 'login': {
      const email = params.email?.toLowerCase();
      const user = demoUsers.find(u => u.email.toLowerCase() === email);
      if (user) {
        return { ...user, demoMode: true };
      }
      // Default to teacher if no match
      return { ...demoUsers[0], demoMode: true };
    }
    case 'getAllClasses':
      return demoClasses;
    case 'getExams': {
      let result = [...demoExams];
      if (params.class) {
        result = result.filter(exam => exam.class === params.class);
      }
      if (params.subject) {
        result = result.filter(exam => exam.subject === params.subject);
      }
      if (params.examType) {
        result = result.filter(exam => exam.examType === params.examType);
      }
      return result;
    }
    case 'getStudents': {
      if (params.class && demoStudents[params.class]) {
        return demoStudents[params.class];
      }
      // If no class specified or class not found, return all students
      return Object.values(demoStudents).flat();
    }
    case 'getExamMarks': {
      const examId = params.examId;
      if (demoExamMarks[examId]) {
        return demoExamMarks[examId];
      }
      return [];
    }
    case 'getGradeTypes':
      return demoExamTypes;
    case 'getGradeBoundaries':
      return demoGradeBoundaries;
    case 'getStudentPerformance': {
      if (params.class && demoStudentPerformance[params.class]) {
        return demoStudentPerformance[params.class];
      }
      return [];
    }
    case 'getTeacherWeeklyTimetable':
    case 'getFullTimetable':
      return demoTimetable;
    case 'getAttendance': {
      const cls = params.class;
      const date = params.date || '2023-05-15'; // Default date
      if (cls && demoAttendance[cls] && demoAttendance[cls][date]) {
        return demoAttendance[cls][date];
      }
      return [];
    }
    default:
      return { demoMode: true, message: "Demo data not available for this endpoint" };
  }
}
