// DailyReportTimetable.jsx - Enhanced Daily Reporting with Timetable Integration
import React, { useEffect, useState } from "react";
import {
  getTeacherDailyTimetable,
  getTeacherDailyReportsForDate,
  submitDailyReport,
  getApprovedLessonPlansForReport,
} from "./api";
import { todayLocalISO, formatLocalDate, periodToTimeString } from "./utils/dateUtils";

const COMPLETION = [
  "Not Started",
  "Partially Completed", 
  "Fully Completed",
];

const PLAN_TYPES = [
  "in plan",
  "not planned",
];

export default function DailyReportTimetable({ user }) {
  const [date, setDate] = useState(todayLocalISO());
  const [rows, setRows] = useState([]);              // timetable rows for the day
  const [statusMap, setStatusMap] = useState({});    // key -> "Submitted" | "Not Submitted"
  const [drafts, setDrafts] = useState({});          // key -> { planType, lessonPlanId, chapter, objectives, activities, completed, notes }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});          // key -> boolean
  const [message, setMessage] = useState("");        // top level message
  const [lessonPlans, setLessonPlans] = useState({}); // key -> array of approved lesson plans for class/subject

  const email = user?.email || "";
  const teacherName = user?.name || "";

  function keyOf(r) {
    // stable per-period key
    return `${r.period}|${r.class}|${r.subject}`;
  }

  async function fetchLessonPlans(cls, subject) {
    if (!cls || !subject || !email) return [];
    try {
      const plans = await getApprovedLessonPlansForReport(email, cls, subject);
      return Array.isArray(plans) ? plans : [];
    } catch (e) {
      console.error('Failed to fetch lesson plans:', e);
      return [];
    }
  }

  async function load() {
    if (!email) return;
    setLoading(true);
    setMessage("");
    try {
      const [tt, rep] = await Promise.all([
        getTeacherDailyTimetable(email, date),            // [{period, class, subject, teacherName, chapter}]
        getTeacherDailyReportsForDate(email, date),       // [{class, subject, period, planType, lessonPlanId, status}]
      ]);

      // Normalize timetable list
      const ttList = Array.isArray(tt) ? tt : [];
      setRows(ttList);

      // status map: Submitted/Not Submitted
      const sm = {};
      (Array.isArray(rep) ? rep : []).forEach(r => {
        sm[`${r.period}|${r.class}|${r.subject}`] = r.status || "Not Submitted";
      });
      setStatusMap(sm);

      // Fetch lesson plans for each unique class/subject combination
      const lessonPlansMap = {};
      const uniqueClassSubjects = new Set();
      ttList.forEach(r => {
        const key = `${r.class}|${r.subject}`;
        if (!uniqueClassSubjects.has(key)) {
          uniqueClassSubjects.add(key);
        }
      });

      for (const key of uniqueClassSubjects) {
        const [cls, subject] = key.split('|');
        const plans = await fetchLessonPlans(cls, subject);
        lessonPlansMap[key] = plans;
      }
      setLessonPlans(lessonPlansMap);

      // initialize drafts for not-submitted rows
      const nextDrafts = {};
      ttList.forEach(r => {
        const k = keyOf(r);
        if (!sm[k] || sm[k] === "Not Submitted") {
          nextDrafts[k] = {
            planType: "not planned",
            lessonPlanId: "",
            chapter: r.chapter || "",
            objectives: "",
            activities: "",
            completed: "Not Started",
            notes: "",
          };
        }
      });
      setDrafts(nextDrafts);

      if (!ttList.length) setMessage("No periods on this day.");
    } catch (e) {
      console.error(e);
      setMessage("Unable to load timetable or reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [date, email]);

  function setDraft(k, field, value) {
    setDrafts(prev => ({ ...prev, [k]: { ...(prev[k] || {}), [field]: value } }));
  }

  function handleLessonPlanChange(k, lessonPlanId) {
    const r = rows.find(row => keyOf(row) === k);
    if (!r) return;

    const plansKey = `${r.class}|${r.subject}`;
    const selectedPlan = lessonPlans[plansKey]?.find(plan => plan.lpId === lessonPlanId);

    if (selectedPlan) {
      setDrafts(prev => ({
        ...prev,
        [k]: {
          ...(prev[k] || {}),
          lessonPlanId: lessonPlanId,
          chapter: selectedPlan.chapter || "",
          objectives: selectedPlan.objectives || "",
          activities: selectedPlan.activities || "",
        }
      }));
    } else {
      // Clear lesson plan fields if no plan selected
      setDrafts(prev => ({
        ...prev,
        [k]: {
          ...(prev[k] || {}),
          lessonPlanId: "",
          chapter: prev[k]?.chapter || "",
          objectives: prev[k]?.objectives || "",
          activities: prev[k]?.activities || "",
        }
      }));
    }
  }

  async function handleSubmitOne(r) {
    const k = keyOf(r);
    const d = drafts[k] || {};
    if (statusMap[k] === "Submitted") return;

    // simple validation: at least one of objectives/activities/completed should be non-empty / not default
    const hasContent =
      (d.objectives && d.objectives.trim()) ||
      (d.activities && d.activities.trim()) ||
      d.completed !== "Not Started" ||
      (d.notes && d.notes.trim());
    if (!hasContent) {
      setMessage("Please fill something (objectives/activities/completion/notes) before submitting.");
      return;
    }

    setSaving(s => ({ ...s, [k]: true }));
    setMessage("");

    try {
      const payload = {
        date,
        teacherEmail: email,
        teacherName,
        class: r.class,
        subject: r.subject,
        period: Number(r.period),
        planType: d.planType || "not planned",
        lessonPlanId: d.lessonPlanId || "",
        chapter: d.chapter || r.chapter || "",
        objectives: d.objectives || "",
        activities: d.activities || "",
        completed: d.completed || "Not Started",
        notes: d.notes || "",
      };

      const res = await submitDailyReport(payload);
      if (res && res.submitted) {
        // mark as submitted
        setStatusMap(m => ({ ...m, [k]: "Submitted" }));
        // clear draft for that row
        setDrafts(prev => {
          const copy = { ...prev };
          delete copy[k];
          return copy;
        });
        setMessage("Report submitted successfully!");
      } else {
        setMessage("Failed to submit report.");
      }
    } catch (e) {
      console.error(e);
      setMessage("Error submitting report: " + (e.message || e));
    } finally {
      setSaving(s => ({ ...s, [k]: false }));
    }
  }

  async function handleSubmitAll() {
    const notSubmittedRows = rows.filter(r => statusMap[keyOf(r)] !== "Submitted");
    if (!notSubmittedRows.length) {
      setMessage("All reports already submitted.");
      return;
    }
    for (const r of notSubmittedRows) {
      await handleSubmitOne(r);
    }
  }

  const displayDate = date ? formatLocalDate(date) : '';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Daily Reporting</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors" 
            onClick={load} 
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          {rows.length > 0 && (
            <button 
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
              onClick={handleSubmitAll}
            >
              Submit All
            </button>
          )}
        </div>
      </div>

      {displayDate && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">{displayDate}</p>
        </div>
      )}

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('success') 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : message.includes('Error') || message.includes('Failed')
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
        }`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="ml-3 text-gray-600">Loading timetable...</div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Plan Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Chapter</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Objectives</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Activities</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">Completed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map(r => {
                  const k = keyOf(r);
                  const submitted = statusMap[k] === "Submitted";
                  const d = drafts[k] || {};
                  const isLoading = saving[k];
                  return (
                    <tr key={k} className={submitted ? "bg-green-50" : ""}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{r.period}
                        <div className="text-xs text-gray-500 mt-1">{periodToTimeString(r.period)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.class}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.subject}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <select
                            value={d.planType || "not planned"}
                            disabled={submitted}
                            onChange={e => setDraft(k, "planType", e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          >
                            {PLAN_TYPES.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          {d.planType === "in plan" && (
                            <select
                              value={d.lessonPlanId || ""}
                              disabled={submitted}
                              onChange={e => handleLessonPlanChange(k, e.target.value)}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            >
                              <option value="">Select Lesson Plan</option>
                              {(lessonPlans[`${r.class}|${r.subject}`] || []).map(plan => (
                                <option key={plan.lpId} value={plan.lpId}>
                                  {plan.chapter} (Session {plan.session})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Chapter name"
                          disabled={submitted}
                          value={d.chapter || r.chapter || ""}
                          onChange={e => setDraft(k, "chapter", e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <textarea
                          placeholder="Brief objectives"
                          disabled={submitted}
                          value={d.objectives || ""}
                          onChange={e => setDraft(k, "objectives", e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          rows="2"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <textarea
                          placeholder="What was done"
                          disabled={submitted}
                          value={d.activities || ""}
                          onChange={e => setDraft(k, "activities", e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          rows="2"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={d.completed || "Not Started"}
                          disabled={submitted}
                          onChange={e => setDraft(k, "completed", e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        >
                          {COMPLETION.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <textarea
                          placeholder="Extra notes"
                          disabled={submitted}
                          value={d.notes || ""}
                          onChange={e => setDraft(k, "notes", e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          rows="2"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {submitted ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Submitted
                          </span>
                        ) : (
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            onClick={() => handleSubmitOne(r)}
                            disabled={isLoading}
                          >
                            {isLoading ? "..." : "Submit"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && !loading && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      No periods scheduled for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}