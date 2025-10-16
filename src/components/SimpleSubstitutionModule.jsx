// src/components/SimpleSubstitutionModule.jsx
import { useState, useEffect } from 'react';
import * as api from '../api';
import { useTheme } from '../contexts/ThemeContext';
import { AnimatedPage } from './AnimatedPage';
import { Plus } from 'lucide-react';

export default function SimpleSubstitutionModule() {
  const { theme } = useTheme();
  const [substitutions, setSubstitutions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [absentTeachers, setAbsentTeachers] = useState([]);
  const [freeTeachers, setFreeTeachers] = useState([]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    absentTeacher: '',
    period: '',
    class: '',
    regularSubject: '',
    substituteTeacher: '',
    substituteSubject: ''
  });

  // Fetch potential absent teachers
  useEffect(() => {
    async function fetchAbsentTeachers() {
      try {
        const absents = await api.getPotentialAbsentTeachers();
        // expect [{name,email}]
        setAbsentTeachers(Array.isArray(absents) ? absents : []);
      } catch (err) {
        console.error("Error fetching absent teachers:", err);
      }
    }
    fetchAbsentTeachers();
  }, []);

  // Fetch free teachers for the selected period
  useEffect(() => {
    async function fetchFreeTeachers() {
      if (!formData.date || !formData.period) {
        setFreeTeachers([]);
        return;
      }

      try {
        const free = await api.getFreeTeachers(
          formData.date, 
          formData.period, 
          formData.absentTeacher ? [formData.absentTeacher] : []
        );
        setFreeTeachers(Array.isArray(free) ? free : []);
      } catch (err) {
        console.error("Error fetching free teachers:", err);
      }
    }
    fetchFreeTeachers();
  }, [formData.date, formData.period, formData.absentTeacher]);

  // Fetch existing substitutions
  useEffect(() => {
    async function fetchSubstitutions() {
      if (!formData.date) return;
      
      try {
        const subs = await api.getDailyTimetableWithSubstitutions(formData.date);
        if (subs && Array.isArray(subs.timetable)) {
          setSubstitutions(subs.timetable);
        } else {
          setSubstitutions([]);
        }
      } catch (err) {
        console.error("Error fetching substitutions:", err);
      }
    }
    fetchSubstitutions();
  }, [formData.date]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.assignSubstitution(formData);
      
      // Refresh substitutions list
      const subs = await api.getDailyTimetableWithSubstitutions(formData.date);
      if (subs && Array.isArray(subs.timetable)) {
        setSubstitutions(subs.timetable);
      }
      
      // Reset form
      setShowForm(false);
      setFormData({
        ...formData,
        period: '',
        class: '',
        regularSubject: '',
        substituteTeacher: '',
        substituteSubject: ''
      });
    } catch (err) {
      console.error('Failed to assign substitution:', err);
    }
  };

  return (
    <AnimatedPage>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>Enhanced Substitutions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
        >
          <Plus className="h-4 w-4 mr-1" /> Assign Substitution
        </button>
      </div>

      {/* Date and Absent Teacher Selectors */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 transition-colors duration-300`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className={`w-full px-3 py-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Absent Teacher</label>
            <select
              value={formData.absentTeacher}
              onChange={(e) => setFormData({...formData, absentTeacher: e.target.value})}
              className={`w-full px-3 py-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
            >
              <option value="">Select Teacher</option>
                  {absentTeachers.map(teacher => (
                <option key={(teacher.email||teacher.name)} value={(teacher.email||teacher.name)}>{teacher.name || teacher.email}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Substitution Form */}
      {showForm && (
        <AnimatedPage>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 transition-colors duration-300`}>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'} transition-colors duration-300`}>Assign Substitution</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="animate-fadeIn">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({...formData, period: e.target.value})}
                  className={`w-full px-3 py-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 focus:scale-[1.01]`}
                  required
                >
                  <option value="">Select Period</option>
                  <option value="1">Period 1</option>
                  <option value="2">Period 2</option>
                  <option value="3">Period 3</option>
                  <option value="4">Period 4</option>
                  <option value="5">Period 5</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Class</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
                  className={`w-full px-3 py-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Regular Subject</label>
                <input
                  type="text"
                  value={formData.regularSubject}
                  onChange={(e) => setFormData({...formData, regularSubject: e.target.value})}
                  className={`w-full px-3 py-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Substitute Teacher</label>
                <select
                  value={formData.substituteTeacher}
                  onChange={(e) => setFormData({...formData, substituteTeacher: e.target.value})}
                  className={`w-full px-3 py-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                  required
                >
                  <option value="">Select Teacher</option>
                  {freeTeachers.map(teacher => (
                    <option key={(teacher.email||teacher.name)} value={(teacher.email||teacher.name)}>{teacher.name || teacher.email}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>
                  Substitute Subject
                </label>
                <input
                  type="text"
                  value={formData.substituteSubject}
                  onChange={(e) => setFormData({...formData, substituteSubject: e.target.value})}
                  placeholder="Leave empty to use same subject"
                  className={`w-full px-3 py-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={`px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg transition-all duration-300 transform hover:scale-105`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
              >
                Assign Substitution
              </button>
            </div>
          </form>
          </div>
        </AnimatedPage>
      )}

      {/* Substitutions Table */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm overflow-hidden transition-colors duration-300`}>
        <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}>
          <h2 className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'} transition-colors duration-300`}>Substitutions for {formData.date}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'} transition-colors duration-300`}>
            <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider transition-colors duration-300`}>Period</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider transition-colors duration-300`}>Class</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider transition-colors duration-300`}>Teacher</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider transition-colors duration-300`}>Subject</th>
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'} transition-colors duration-300`}>
              {substitutions
                .filter(sub => sub.isSubstitution)
                .map((sub, index) => (
                  <tr key={index} className={`${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-all duration-200 row-substitution cursor-pointer transform hover:scale-[1.01]`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'} transition-colors duration-300`}>{sub.period}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'} transition-colors duration-300`}>{sub.class}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'} transition-colors duration-300`}>{sub.teacher}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'} transition-colors duration-300`}>{sub.subject}</td>
                  </tr>
                ))}
              {!substitutions.some(sub => sub.isSubstitution) && (
                <tr>
                  <td colSpan={4} className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-center transition-colors duration-300`}>
                    No substitutions assigned for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </AnimatedPage>
  );
}