// Implements role-based access for exam management
import React, { useState, useEffect } from 'react';
import { formatShortDate } from '../utils/dateUtils';
import * as api from '../api';

// Role-based component for exam management
export default function ExamManagement({ user }) {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [marksData, setMarksData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  // For Class Teachers: allow toggling between their own class and other classes they teach
  const [viewScope, setViewScope] = useState('my-class'); // 'my-class' | 'other-classes'

  // Get roles from user
  const isHM = user && user.roles && user.roles.some(role => 
    role.toLowerCase() === 'h m' || role.toLowerCase() === 'hm');
  
  const isClassTeacher = user && user.roles && user.roles.some(role => 
    role.toLowerCase().includes('class teacher'));
  
  const isTeacher = user && user.roles && user.roles.some(role => 
    role.toLowerCase().includes('teacher'));

  useEffect(() => {
    loadExams();
  }, [user, viewScope]);

  // Load exams based on user role
  const loadExams = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let examData;
      
      // HM can see all exams
      if (isHM) {
        examData = await api.getExams();
      } 
      // Class Teacher: toggle between own class and other classes they teach
      else if (isClassTeacher) {
        if (viewScope === 'my-class' && user.classTeacherFor) {
          examData = await api.getExams(user.classTeacherFor);
        } else {
          // Other classes: show exams for classes/subjects the teacher teaches
          const classes = Array.isArray(user.classes) ? user.classes : [];
          const subjects = Array.isArray(user.subjects) ? user.subjects : [];
          // Fetch all and filter on client to keep API simple
          const all = await api.getExams();
          examData = all.filter(exam => classes.includes(exam.class) && subjects.includes(exam.subject));
        }
      } 
      // Teachers can see exams for their subjects in their classes
      else if (isTeacher) {
        const classes = user.classes || [];
        const subjects = user.subjects || [];
        
        // If teacher has many classes/subjects, we'll get all and filter
        examData = await api.getExams();
        examData = examData.filter(exam => 
          classes.includes(exam.class) && subjects.includes(exam.subject)
        );
      }
      
      setExams(Array.isArray(examData) ? examData : []);
    } catch (error) {
      console.error('Failed to load exams:', error);
      setMessage('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  // View exam details and marks
  const viewExamDetails = async (exam) => {
    setSelectedExam(exam);
    setLoading(true);
    
    try {
      const marks = await api.getExamMarks(exam.examId);
      setMarksData(Array.isArray(marks) ? marks : []);
    } catch (error) {
      console.error('Failed to load exam marks:', error);
      setMessage('Failed to load exam marks');
    } finally {
      setLoading(false);
    }
  };

  // Determine if user can edit marks for a specific exam
  const canEditMarks = (exam) => {
    if (isHM) return true;
    if (isClassTeacher && user.classTeacherFor === exam.class) return true;
    if (isTeacher && user.classes.includes(exam.class) && user.subjects.includes(exam.subject)) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
        <div className="flex items-center space-x-3">
          {/* Class Teacher can toggle scope */}
          {isClassTeacher && (
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">View</label>
              <select
                value={viewScope}
                onChange={(e) => setViewScope(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="my-class">My class ({user?.classTeacherFor || '-'})</option>
                <option value="other-classes">Other classes I teach</option>
              </select>
            </div>
          )}

        {/* HM can create new exams */}
          {isHM && (
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Exam
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
          <p>{message}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Exams</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {exams.map(exam => (
                  <tr key={exam.examId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.class}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.examType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatShortDate(exam.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(exam.internalMax || 0) + Number(exam.externalMax || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => viewExamDetails(exam)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                      
                      {canEditMarks(exam) && (
                        <button
                          className="text-green-600 hover:text-green-800 ml-3"
                        >
                          Edit Marks
                        </button>
                      )}
                      
                      {isHM && (
                        <button
                          className="text-red-600 hover:text-red-800 ml-3"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                
                {exams.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No exams found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {selectedExam && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            {selectedExam.subject} - {selectedExam.examType} ({selectedExam.class})
          </h2>
          
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Date</div>
              <div className="font-medium">{formatShortDate(selectedExam.date)}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Internal Max</div>
              <div className="font-medium">{selectedExam.internalMax}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">External Max</div>
              <div className="font-medium">{selectedExam.externalMax}</div>
            </div>
          </div>
          
          <h3 className="text-md font-medium mb-2">Marks</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adm No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Internal</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">External</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {marksData.map(mark => (
                  <tr key={mark.markId || mark.admNo}>
                    <td className="px-4 py-2 text-sm">{mark.admNo}</td>
                    <td className="px-4 py-2 text-sm">{mark.studentName}</td>
                    <td className="px-4 py-2 text-sm">{mark.internal !== null && mark.internal !== undefined ? mark.internal : '-'}</td>
                    <td className="px-4 py-2 text-sm">{mark.external !== null && mark.external !== undefined ? mark.external : '-'}</td>
                    <td className="px-4 py-2 text-sm font-medium">{mark.total !== null && mark.total !== undefined ? mark.total : '-'}</td>
                    <td className="px-4 py-2 text-sm">{mark.grade || '-'}</td>
                  </tr>
                ))}
                
                {marksData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-2 text-center text-sm text-gray-500">
                      No marks recorded for this exam.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setSelectedExam(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}