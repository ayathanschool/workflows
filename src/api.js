// src/api.js
// Configure this to your deployed Google Apps Script Web App URL (ends with /exec)
// In development we proxy requests via Vite at /gas to avoid CORS issues.
const PROD_BASE = import.meta.env.VITE_GAS_WEB_APP_URL || '';
const BASE_URL = import.meta.env.DEV ? '/gas' : PROD_BASE;

// Lightweight logger: disabled in production build to avoid noise
const __DEV_LOG__ = !!import.meta.env.DEV && (import.meta.env.VITE_VERBOSE_API === 'true');
const devLog = (...args) => { if (__DEV_LOG__) console.log('[api]', ...args); };

// Cache for API responses to reduce duplicate calls
const apiCache = new Map();
const pendingRequests = new Map();

// Cache duration in milliseconds
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const SHORT_CACHE_DURATION = 30 * 1000; // 30 seconds for frequently changing data

function getCacheKey(url) {
  return url;
}

function isCacheValid(cacheEntry) {
  return cacheEntry && (Date.now() - cacheEntry.timestamp) < cacheEntry.duration;
}

function setCacheEntry(key, data, duration = CACHE_DURATION) {
  apiCache.set(key, {
    data,
    timestamp: Date.now(),
    duration
  });
}

async function getJSON(url) {
  const cacheKey = getCacheKey(url);
  
  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (isCacheValid(cached)) {
  devLog('cache hit', url);
    return cached.data;
  }
  
  // Check if request is already pending to avoid duplicates
  if (pendingRequests.has(cacheKey)) {
  devLog('dedupe', url);
    return pendingRequests.get(cacheKey);
  }
  
  try {
  devLog('GET', url);
    const requestPromise = fetch(url, { method: 'GET' })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          const err = new Error(`HTTP ${res.status} ${text}`);
          throw err;
        }
        return res.json();
      });
    
    // Store pending request
    pendingRequests.set(cacheKey, requestPromise);
    
    const result = await requestPromise;
    
    // Cache the result
    const duration = url.includes('getHmInsights') || url.includes('getAllClasses') ? CACHE_DURATION : SHORT_CACHE_DURATION;
    setCacheEntry(cacheKey, result, duration);
    
    // Clear pending request
    pendingRequests.delete(cacheKey);
    
    return result;
  } catch (err) {
    // Clear pending request on error
    pendingRequests.delete(cacheKey);
    
    console.error('API GET failed', url, err);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-error', { detail: { message: String(err.message || err), url } }));
    }
    const e2 = new Error(`Failed to fetch ${url}: ${String(err && err.message ? err.message : err)}`);
    throw e2;
  }
}

async function postJSON(url, payload) {
  // Clear related cache entries on mutations
  if (url.includes('assignSubstitution')) {
    // Clear substitution-related caches
    for (const [key] of apiCache) {
      if (
        key.includes('getVacantSlotsForAbsent') ||
        key.includes('getTeacherDailyTimetable') ||
        key.includes('getDailyTimetableWithSubstitutions') ||
        key.includes('getAssignedSubstitutions')
      ) {
        apiCache.delete(key);
      }
    }
  }
  
  const body = JSON.stringify(payload);
  try {
  devLog('POST', url, payload);
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err = new Error(`HTTP ${res.status} ${text}`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api-error', { detail: { message: err.message, url, status: res.status } }));
      }
      throw err;
    }
    return await res.json()
  } catch (err) {
    console.error('API POST failed', url, err);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-error', { detail: { message: String(err.message || err), url } }));
    }
    const e2 = new Error(`Failed to post ${url}: ${String(err && err.message ? err.message : err)}`);
    throw e2;
  }
}

// Utility to clear cache
export function clearCache(pattern) {
  if (pattern) {
    for (const [key] of apiCache) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
  } else {
    apiCache.clear();
  }
}

export async function ping() {
  return getJSON(`${BASE_URL}?action=ping`)
}

// Basic auth by email and password (server maps to Users sheet)
export async function login(email, password = '') {
  const url = `${BASE_URL}?action=login&email=${encodeURIComponent(email)}`;
  const fullUrl = password ? `${url}&password=${encodeURIComponent(password)}` : url;
  return getJSON(fullUrl);
}

// Google OAuth exchange: send auth info to backend; backend validates and returns user profile & roles
export async function googleLogin(googleAuthInfo) {
  try {
    devLog('Sending Google auth info to backend (POST)');
    return await postJSON(`${BASE_URL}?action=googleLogin`, googleAuthInfo);
  } catch (err) {
    // If POST 404, attempt GET fallback (legacy / troubleshooting scenario)
    if (String(err.message||'').includes('HTTP 404')) {
      devLog('googleLogin POST 404, attempting GET fallback');
      try {
        devLog('Sending Google auth info via GET fallback');
        // For GET, just send the email as the main identifier
        return await getJSON(`${BASE_URL}?action=googleLogin&email=${encodeURIComponent(googleAuthInfo.email)}`);
      } catch (err2) {
        console.error('Both POST and GET Google login attempts failed:', 
                      { postError: err.message, getError: err2.message });
        throw new Error(`Google login failed. Please ensure your Google Apps Script deployment is up to date and has the doPost handler. If the problem persists, try clearing your browser cache.`);
      }
    }
    
    // Improved error message for common issues
    let errorMessage = String(err.message || '');
    if (errorMessage.includes('Invalid Google token')) {
      console.error('Invalid Google token error. Token might be expired or malformed.');
      throw new Error('Authentication failed. Your Google authentication token could not be verified. Please try signing in again or check if cookies are enabled.');
    } else if (errorMessage.includes('Email not verified') || errorMessage.includes('Token missing email')) {
      throw new Error('Your Google account email is either not verified or not available. Please ensure you have a verified email in your Google account.');
    } else if (errorMessage.includes('User not registered')) {
      throw new Error('Your Google account is not registered in the system. Please contact your administrator to register your email.');
    }
    
    throw err;
  }
}

export async function getTeacherWeeklyTimetable(email) {
  return getJSON(`${BASE_URL}?action=getTeacherWeeklyTimetable&email=${encodeURIComponent(email)}`)
}

export async function getTeacherDailyTimetable(email, date) {
  return getJSON(`${BASE_URL}?action=getTeacherDailyTimetable&email=${encodeURIComponent(email)}&date=${encodeURIComponent(date)}`)
}

export async function getTeacherLessonPlanFilters(email) {
  return getJSON(`${BASE_URL}?action=getTeacherLessonPlanFilters&email=${encodeURIComponent(email)}`)
}

export async function getTeacherLessonPlans(email, subject='', cls='', status='', search='') {
  const q = new URLSearchParams({ action: 'getTeacherLessonPlans', email, subject, class: cls, status, search })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

export async function submitPlan(email, planData) {
  return postJSON(`${BASE_URL}?action=submitPlan`, { email, ...planData })
}

export async function getPendingPlans(page=1, pageSize=10, teacher='', cls='', subject='', month='') {
  const q = new URLSearchParams({ action: 'getPendingPlans', page, pageSize, teacher, class: cls, subject, month })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

export async function updatePlanStatus(schemeId, status) {
  return postJSON(`${BASE_URL}?action=updatePlanStatus`, { schemeId, status })
}

export async function getLessonReviewFilters() {
  return getJSON(`${BASE_URL}?action=getLessonReviewFilters`)
}

export async function getPendingLessonReviews(teacher='', cls='', subject='', status='Pending Review') {
  const q = new URLSearchParams({ action: 'getPendingLessonReviews', teacher, class: cls, subject, status })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

export async function getPendingPreparationLessonPlans(email) {
  return getJSON(`${BASE_URL}?action=getPendingPreparationLessonPlans&email=${encodeURIComponent(email)}`)
}

export async function submitLessonPlanDetails(lpId, data) {
  return postJSON(`${BASE_URL}?action=submitLessonPlanDetails`, { lpId, ...data })
}

// NOTE: The client performs duplicate detection before calling submitLessonPlanDetails
// to prevent creating lesson plans with the same class/subject/session and scheme.
// It's strongly recommended to implement the same duplicate check on the server
// (Apps Script) inside `submitLessonPlanDetails` to ensure data integrity when
// multiple clients or retries are involved.

export async function updateLessonPlanDetailsStatus(lpId, status, remarks='') {
  return postJSON(`${BASE_URL}?action=updateLessonPlanDetailsStatus`, { lpId, status, remarks })
}

export async function getApprovedLessonPlansForReport(email, cls, subject) {
  const q = new URLSearchParams({ action: 'getApprovedLessonPlansForReport', email, class: cls, subject })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

export async function submitDailyReport(data) {
  return postJSON(`${BASE_URL}?action=submitDailyReport`, data)
}

export async function getTeacherDailyReportsForDate(email, date) {
  const q = new URLSearchParams({ action: 'getTeacherDailyReportsForDate', email, date })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

export async function getAllClasses() {
  return getJSON(`${BASE_URL}?action=getAllClasses`)
}

export async function getAllSubjects() {
  return getJSON(`${BASE_URL}?action=getAllSubjects`)
}

export async function getDailyReportSummary(cls, date) {
  const q = new URLSearchParams({ action: 'getDailyReportSummary', class: cls, date })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

// Substitutions
export async function getVacantSlotsForAbsent(date, absent=[], options={}) {
  const { noCache = false } = options || {};
  const q = new URLSearchParams({ action: 'getVacantSlotsForAbsent', date })
  absent.forEach(a => q.append('absent', a))
  if (noCache) q.append('_', String(Date.now()))
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

export async function getPotentialAbsentTeachers() {
  return getJSON(`${BASE_URL}?action=getPotentialAbsentTeachers`)
}

export async function getFreeTeachers(date, period, absent=[]) {
  const q = new URLSearchParams({ action: 'getFreeTeachers', date, period })
  absent.forEach(a => q.append('absent', a))
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

export async function assignSubstitution(data) {
  return postJSON(`${BASE_URL}?action=assignSubstitution`, data)
}

// Fetch all schemes submitted by a particular teacher (regardless of status).
// Returns an array of scheme objects with fields: schemeId, class, subject,
// chapter, month, term, unit, noOfSessions, and status.  This allows
// teachers and class teachers to view all of their submitted schemes and
// their current approval status.
export async function getTeacherSchemes(email) {
  const q = new URLSearchParams({ action: 'getTeacherSchemes', email })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

export async function getDailyTimetableWithSubstitutions(date, options={}) {
  const { noCache = false } = options || {};
  const q = new URLSearchParams({ action: 'getDailyTimetableWithSubstitutions', date })
  if (noCache) q.append('_', String(Date.now()))
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

export async function getAssignedSubstitutions(date, options={}) {
  const { noCache = false } = options || {};
  const q = new URLSearchParams({ action: 'getAssignedSubstitutions', date })
  if (noCache) q.append('_', String(Date.now()))
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

// HM Insights & Analytics (basic)
export async function getHmInsights() {
  return getJSON(`${BASE_URL}?action=getHmInsights`)
}

export async function getAnalyticsData() {
  return getJSON(`${BASE_URL}?action=getAnalyticsData`)
}

export async function getFullTimetable() {
  return getJSON(`${BASE_URL}?action=getFullTimetable`)
}

export async function getFullTimetableFiltered(cls = '', subject = '', teacher = '', date = '') {
  const q = new URLSearchParams({ action: 'getFullTimetableFiltered', class: cls, subject, teacher, date })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

// App settings (used to control lesson planning rules and period times)
export async function getAppSettings() {
  // Expect either an object with settings or { settings: { ... } }
  const res = await getJSON(`${BASE_URL}?action=getAppSettings`);
  if (res && res.settings && typeof res.settings === 'object') return res.settings;
  return res || {};
}

// Exams API

// Retrieve a list of exams.  Optional filters (class, subject, examType) can
// be provided to limit the results.  Returns an array of exam objects.
export async function getExams(cls = '', subject = '', examType = '') {
  const q = new URLSearchParams({ action: 'getExams', class: cls, subject, examType })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

// Create a new exam.  Requires the creator's email and a payload with
// creatorName, class, subject, examType, internalMax, externalMax,
// totalMax and date.  Returns { ok: true, examId } on success.
export async function createExam(email, examData) {
  return postJSON(`${BASE_URL}?action=createExam`, { email, ...examData })
}

// Submit exam marks.  The payload must include examId, class, subject,
// teacherEmail, teacherName and an array of marks ({ admNo, studentName,
// internal, external }).  Returns { ok: true } on success.
export async function submitExamMarks(data) {
  return postJSON(`${BASE_URL}?action=submitExamMarks`, data)
}

// Retrieve all marks for a given examId.  Returns an array of mark records.
export async function getExamMarks(examId) {
  const q = new URLSearchParams({ action: 'getExamMarks', examId })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

// Administrative API
// Fetch all plans (schemes and lesson plans) with optional filters.
// Parameters: teacher (email or part of name), class, subject, status.
export async function getAllPlans(teacher = '', cls = '', subject = '', status = '') {
  const q = new URLSearchParams({ action: 'getAllPlans', teacher, class: cls, subject, status })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

// Fetch all approved schemes across the school, used to populate teacher dropdowns
export async function getAllApprovedSchemes() {
  try {
    const res = await getJSON(`${BASE_URL}?action=getAllPlans&status=Approved`);
    // Some deployments return { plans: [...] }, others return an array directly
    const plans = Array.isArray(res) ? res : (Array.isArray(res?.plans) ? res.plans : []);
    // Heuristic: schemes have schemeId and typically noOfSessions/month info
    const approvedSchemes = plans.filter((item) => {
      const isApproved = String(item?.status || '').toLowerCase() === 'approved';
      const looksLikeScheme = !!(item?.schemeId) || (item?.noOfSessions != null);
      return isApproved && looksLikeScheme;
    });
    return approvedSchemes;
  } catch (err) {
    // Surface API error and rethrow so callers can fallback
    console.warn('getAllApprovedSchemes failed:', err?.message || err);
    throw err;
  }
}

// Retrieve daily reports across the school.  Useful for headmasters to
// browse all reports.  Optional filters: teacher, class, subject,
// date, fromDate, toDate, status (completion status).
export async function getDailyReports({ teacher = '', cls = '', subject = '', date = '', fromDate = '', toDate = '', status = '' } = {}) {
  const params = new URLSearchParams({ action: 'getDailyReports', teacher, class: cls, subject, date, fromDate, toDate, status })
  return getJSON(`${BASE_URL}?${params.toString()}`)
}

// Students and Attendance

// Get a list of students.  If a class is supplied, return only students in
// that class; otherwise return all students.
export async function getStudents(cls = '') {
  const q = new URLSearchParams({ action: 'getStudents', class: cls })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

// Retrieve exam grade types from the GradeTypes sheet.  Each entry contains
// examType and the maximum marks.  Useful for populating dynamic exam
// creation forms.
export async function getGradeTypes() {
  return getJSON(`${BASE_URL}?action=getGradeTypes`)
}

// Fetch grade boundaries used to assign letter grades based on percentage
export async function getGradeBoundaries() {
  return getJSON(`${BASE_URL}?action=getGradeBoundaries`)
}

// Submit attendance records.  The payload should include date, class,
// teacherEmail, teacherName and an array of records with admNo,
// studentName and status (e.g. "Present" or "Absent").
export async function submitAttendance(data) {
  return postJSON(`${BASE_URL}?action=submitAttendance`, data)
}

// Retrieve attendance records.  Optional filters: class and date.
export async function getAttendance(cls = '', date = '') {
  const q = new URLSearchParams({ action: 'getAttendance', class: cls, date })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

// Retrieve student performance data for a class.  Returns an array of
// { admNo, name, average, examCount } sorted by average descending.
export async function getStudentPerformance(cls) {
  const q = new URLSearchParams({ action: 'getStudentPerformance', class: cls })
  return getJSON(`${BASE_URL}?${q.toString()}`)
}

// Calendar Integration
export async function getCalendarEvents(email, startDate, endDate) {
  const q = new URLSearchParams({
    action: 'getCalendarEvents',
    email,
    startDate: startDate || '',
    endDate: endDate || ''
  });
  return getJSON(`${BASE_URL}?${q.toString()}`);
}

// Save a personal calendar event
export async function saveCalendarEvent(eventData) {
  return postJSON(`${BASE_URL}?action=saveCalendarEvent`, eventData);
}

// Delete a personal calendar event
export async function deleteCalendarEvent(eventId) {
  return postJSON(`${BASE_URL}?action=deleteCalendarEvent`, { eventId });
}