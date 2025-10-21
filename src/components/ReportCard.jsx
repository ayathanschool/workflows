import React, { useState, useEffect } from 'react';
import * as api from '../api';
import { formatShortDate } from '../utils/dateUtils';

const ReportCard = ({ user }) => {
  const [examId, setExamId] = useState('');
  const [reportData, setReportData] = useState({ students: [], subjects: [] });
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examsLoading, setExamsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('class'); // 'class' or 'student'
  const [selectedStudent, setSelectedStudent] = useState('');

  // Helper function to check if user is a class teacher
  const isClassTeacher = () => {
    const userRoles = user?.roles || [];
    return userRoles.some(role => 
      role.toLowerCase().includes('class teacher') || 
      role.toLowerCase().includes('teacher')
    );
  };

  // Helper function to check if user is a student
  const isStudent = () => {
    const userRoles = user?.roles || [];
    return userRoles.some(role => role.toLowerCase().includes('student'));
  };

  // Helper function to check if user is HM (Head Master)
  const isHM = () => {
    const userRoles = user?.roles || [];
    console.log('ReportCard - User roles:', userRoles);
    console.log('ReportCard - Role checks:', {
      isStudent: isStudent(),
      isClassTeacher: isClassTeacher(),
      isHM: userRoles.some(role => {
        const normalizedRole = role.toLowerCase().trim();
        return normalizedRole.includes('hm') || 
               normalizedRole.includes('h m') ||
               normalizedRole === 'h m' ||
               normalizedRole.includes('head master') ||
               normalizedRole.includes('headmaster') ||
               normalizedRole.includes('admin');
      })
    });
    return userRoles.some(role => {
      const normalizedRole = role.toLowerCase().trim();
      return normalizedRole.includes('hm') || 
             normalizedRole.includes('h m') ||
             normalizedRole === 'h m' ||
             normalizedRole.includes('head master') ||
             normalizedRole.includes('headmaster') ||
             normalizedRole.includes('admin');
    });
  };

  // Load available exams
  useEffect(() => {
    const loadExams = async () => {
      try {
        setExamsLoading(true);
        console.log('Loading exams...');
        const examData = await api.getAllExams();
        console.log('Exam data received:', examData);
        
        if (Array.isArray(examData)) {
          setExams(examData);
          console.log(`Loaded ${examData.length} exams`);
        } else if (examData && examData.error) {
          console.error('Backend error:', examData.error);
          setError(`Failed to load exams: ${examData.error}`);
          setExams([]);
        } else {
          console.warn('Invalid exam data format:', examData);
          setExams([]);
        }
      } catch (err) {
        console.error('Failed to load exams:', err);
        setError(`Failed to load exams: ${err.message || 'Unknown error'}`);
        setExams([]);
      } finally {
        setExamsLoading(false);
      }
    };
    loadExams();
  }, []);

  // Debug reportData changes
  useEffect(() => {
    console.log('ReportData changed:', reportData);
  }, [reportData]);

  // Debug function to check exam marks
  const debugExamMarks = async () => {
    try {
      const debugData = await api.debugExamMarks();
      console.log('Debug Exam Marks Data:', debugData);
      alert('Debug data logged to console. Check browser console for details.');
    } catch (err) {
      console.error('Debug failed:', err);
      alert('Debug failed: ' + err.message);
    }
  };

  // Load report card data
  const loadReportCard = async () => {
    if (!examId) {
      setError('Please select an exam');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let data;
      if (isStudent()) {
        // For students, show their own report card using their admission number
        data = await api.getStudentReportCard(examId, user.admNo || user.email);
      } else if (isClassTeacher()) {
        if (viewMode === 'class') {
          // For class teachers, show all students in their class
          const userClass = user.classes?.[0] || user.classTeacherFor || '';
          if (!userClass) {
            setError('No class assigned to you');
            return;
          }
          data = await api.getStudentReportCard(examId, '', userClass);
        } else {
          // Show specific student
          if (!selectedStudent) {
            setError('Please select a student');
            return;
          }
          data = await api.getStudentReportCard(examId, selectedStudent);
        }
      } else if (isHM()) {
        // HM can view any student's report card
        if (viewMode === 'class') {
          // Show all students in selected class (implement later)
          data = await api.getStudentReportCard(examId, ''); // Get all students
        } else {
          // Show specific student
          if (!selectedStudent) {
            setError('Please select a student');
            return;
          }
          data = await api.getStudentReportCard(examId, selectedStudent);
        }
      } else {
        setError('Access denied. Only students, class teachers, and HM can view report cards.');
        return;
      }

      // Ensure data has proper structure
      const safeData = data || { students: [], subjects: [] };
      setReportData({
        students: Array.isArray(safeData.students) ? safeData.students : [],
        subjects: Array.isArray(safeData.subjects) ? safeData.subjects : []
      });
    } catch (err) {
      console.error('Error loading report card:', err);
      setError(err.message || 'Failed to load report card');
      setReportData({ students: [], subjects: [] }); // Reset to safe default
    } finally {
      setLoading(false);
    }
  };

  // Format grade display
  const formatGrade = (subjectData) => {
    if (!subjectData || subjectData.grade === 'N/A') {
      return 'N/A';
    }
    return `${subjectData.total}/${subjectData.grade}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Report Card
        </h2>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Exam Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Exam
            </label>
            <select
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              disabled={examsLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {examsLoading ? 'Loading exams...' : 
                 exams.length === 0 ? 'No exams available' : 
                 'Choose exam...'}
              </option>
              {/* Deduplicate exam types and show only one option per exam type */}
              {Array.from(new Set(exams.map(exam => exam.examType || exam.examName.split(' - ')[0])))
                .map(examType => {
                  // Find the first exam with this type to use its ID
                  const firstExamWithType = exams.find(exam => 
                    (exam.examType || exam.examName.split(' - ')[0]) === examType
                  );
                  return (
                    <option key={firstExamWithType.examId} value={firstExamWithType.examId}>
                      {examType}
                    </option>
                  );
                })
              }
            </select>
          </div>

          {/* View Mode Selection (for teachers and HM only) */}
          {(isClassTeacher() || isHM()) && !isStudent() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Mode
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="class">Entire Class</option>
                <option value="student">Individual Student</option>
              </select>
            </div>
          )}

          {/* Student Selection (when in student mode) */}
          {isClassTeacher() && !isStudent() && viewMode === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Admission No.
              </label>
              <input
                type="text"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                placeholder="Enter admission number..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={loadReportCard}
            disabled={loading || examsLoading || exams.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Generate Report Card'}
          </button>
          
          <button
            onClick={debugExamMarks}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Debug Data
          </button>
        </div>

        {/* Info message when no exams */}
        {!examsLoading && exams.length === 0 && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>No exams found.</strong> Please contact your administrator to create exams before generating report cards.
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Report Card Table */}
      {reportData && reportData.students && reportData.subjects && 
       reportData.students.length > 0 && reportData.subjects.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Report Card - {exams.find(e => e.examId === examId)?.examType || 'Selected Exam'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {reportData.students.length} student(s) across {reportData.subjects.length} subject(s)
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adm No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  {reportData.subjects.map(subject => (
                    <th key={subject} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {subject}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.students.map((student, index) => {
                  const totalMarks = reportData.subjects.reduce((sum, subject) => {
                    return sum + (student.subjects[subject]?.total || 0);
                  }, 0);
                  const averageMarks = totalMarks / reportData.subjects.length;
                  const overallGrade = averageMarks >= 90 ? 'A+' : 
                                     averageMarks >= 80 ? 'A' : 
                                     averageMarks >= 70 ? 'B+' : 
                                     averageMarks >= 60 ? 'B' : 
                                     averageMarks >= 50 ? 'C+' : 
                                     averageMarks >= 40 ? 'C' : 
                                     averageMarks >= 35 ? 'D' : 'F';

                  return (
                    <tr key={student.admNo} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.admNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.studentName}
                      </td>
                      {reportData.subjects.map(subject => (
                        <td key={subject} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {student.subjects[subject]?.total || 0}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                              student.subjects[subject]?.grade === 'A+' ? 'bg-green-100 text-green-800' :
                              student.subjects[subject]?.grade === 'A' ? 'bg-green-100 text-green-700' :
                              student.subjects[subject]?.grade === 'B+' || student.subjects[subject]?.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                              student.subjects[subject]?.grade === 'C+' || student.subjects[subject]?.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                              student.subjects[subject]?.grade === 'D' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {student.subjects[subject]?.grade || 'N/A'}
                            </div>
                          </div>
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {averageMarks.toFixed(1)}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                            overallGrade === 'A+' ? 'bg-green-100 text-green-800' :
                            overallGrade === 'A' ? 'bg-green-100 text-green-700' :
                            overallGrade === 'B+' || overallGrade === 'B' ? 'bg-blue-100 text-blue-700' :
                            overallGrade === 'C+' || overallGrade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                            overallGrade === 'D' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {overallGrade}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Print Button */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Print Report Card
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && reportData && reportData.students && reportData.students.length === 0 && examId && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No report card data found for the selected exam.</p>
        </div>
      )}
    </div>
  );
};

export default ReportCard;