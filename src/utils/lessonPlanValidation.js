/**
 * Frontend validation functions for preventing duplicate lesson plans
 * These functions can be integrated into the React application
 */

/**
 * Validates if a lesson plan would be a duplicate based on existing plans
 * @param {Object} newPlan - The plan being submitted
 * @param {Array} existingPlans - Array of existing lesson plans
 * @returns {Object} - { isDuplicate: boolean, message: string }
 */
export const validateLessonPlan = (newPlan, existingPlans) => {
  // Skip validation if we don't have existing plans or if this is an update to existing plan
  if (!existingPlans || existingPlans.length === 0 || newPlan.lpId) {
    return { isDuplicate: false, message: '' };
  }

  const { class: cls, subject, session, chapter } = newPlan;

  // Look for duplicates with same class/subject/session/chapter
  const duplicates = existingPlans.filter(plan => {
    // Exact match conditions
    const classMatch = plan.class === cls;
    const subjectMatch = plan.subject === subject;
    const sessionMatch = Number(plan.session) === Number(session);
    
    // Chapter match conditions (either both match or both are empty)
    const chapterMatch = 
      (plan.chapter && chapter && plan.chapter === chapter) || 
      (!plan.chapter && !chapter);
    
    // If both have the same class, subject, session and matching chapter situation, it's a duplicate
    return classMatch && subjectMatch && sessionMatch && chapterMatch;
  });

  if (duplicates.length > 0) {
    // Found a duplicate plan
    return {
      isDuplicate: true,
      message: `A lesson plan already exists for ${cls}, ${subject}, Session ${session}${chapter ? `, Chapter ${chapter}` : ''}`
    };
  }

  return { isDuplicate: false, message: '' };
};

/**
 * Fetches existing lesson plans to check for duplicates before submitting
 * @param {string} teacherEmail - Email of the teacher
 * @returns {Promise<Array>} - List of existing lesson plans
 */
export const fetchExistingPlans = async (teacherEmail) => {
  try {
    const response = await fetch(`${API_BASE_URL}?action=getTeacherLessonPlans&email=${encodeURIComponent(teacherEmail)}`);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch existing plans for duplicate check:', error);
    return [];
  }
};

/**
 * Enhanced lesson plan submission with duplicate checking
 * @param {Object} planData - The lesson plan data to submit
 * @param {Array} existingPlans - The existing lesson plans for comparison
 * @returns {Promise<Object>} - Response with success or error
 */
export const submitLessonPlanWithValidation = async (planData, existingPlans) => {
  // Validate for duplicates first
  const validationResult = validateLessonPlan(planData, existingPlans);
  
  if (validationResult.isDuplicate) {
    return {
      success: false,
      error: validationResult.message
    };
  }
  
  // If validation passes, proceed with submission
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...planData,
        action: 'submitLessonPlanDetails'
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      return {
        success: false,
        error: data.error
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to submit lesson plan: ' + (error.message || 'Unknown error')
    };
  }
};