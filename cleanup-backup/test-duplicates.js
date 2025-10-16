#!/usr/bin/env node

/**
 * This script tests the lesson plan duplicate detection logic
 * To run: node test-duplicates.js
 */

// Simulated API response for lesson plans
const sampleLessonPlans = [
  {
    lpId: "plan1",
    class: "STD 7A",
    subject: "Math",
    session: 2,
    chapter: "Algebra",
    status: "Ready"
  },
  {
    lpId: "plan2",
    class: "STD 7A",
    subject: "English",
    session: 3,
    chapter: "Poetry",
    status: "Pending Review"
  },
  {
    lpId: "plan3",
    class: "STD 8B",
    subject: "Science",
    session: 1,
    chapter: "Cells",
    status: "Pending Preparation"
  }
];

// Import validation logic
const validateLessonPlan = (newPlan, existingPlans) => {
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

// Test cases
const testCases = [
  {
    name: "Test Case 1: Exact Duplicate",
    plan: {
      class: "STD 7A",
      subject: "Math",
      session: 2,
      chapter: "Algebra"
    },
    expectDuplicate: true
  },
  {
    name: "Test Case 2: Different Chapter",
    plan: {
      class: "STD 7A",
      subject: "Math",
      session: 2,
      chapter: "Geometry"
    },
    expectDuplicate: false
  },
  {
    name: "Test Case 3: Different Session",
    plan: {
      class: "STD 7A",
      subject: "Math",
      session: 3,
      chapter: "Algebra"
    },
    expectDuplicate: false
  },
  {
    name: "Test Case 4: Different Subject",
    plan: {
      class: "STD 7A",
      subject: "Science",
      session: 2,
      chapter: "Algebra"
    },
    expectDuplicate: false
  },
  {
    name: "Test Case 5: Different Class",
    plan: {
      class: "STD 8A",
      subject: "Math",
      session: 2,
      chapter: "Algebra"
    },
    expectDuplicate: false
  },
  {
    name: "Test Case 6: Update Existing Plan",
    plan: {
      lpId: "plan1", // This indicates we're updating an existing plan
      class: "STD 7A",
      subject: "Math",
      session: 2,
      chapter: "Algebra"
    },
    expectDuplicate: false // Should not count as duplicate since we're updating
  }
];

// Run tests
console.log("===== Testing Lesson Plan Duplicate Detection =====\n");

let passedTests = 0;
let failedTests = 0;

testCases.forEach(test => {
  console.log(`Running: ${test.name}`);
  
  const result = validateLessonPlan(test.plan, sampleLessonPlans);
  const passed = result.isDuplicate === test.expectDuplicate;
  
  if (passed) {
    console.log(`✅ PASSED: Expected duplicate=${test.expectDuplicate}, Got duplicate=${result.isDuplicate}`);
    if (result.isDuplicate) {
      console.log(`   Message: "${result.message}"`);
    }
    passedTests++;
  } else {
    console.log(`❌ FAILED: Expected duplicate=${test.expectDuplicate}, Got duplicate=${result.isDuplicate}`);
    if (result.message) {
      console.log(`   Message: "${result.message}"`);
    }
    failedTests++;
  }
  
  console.log("");
});

console.log(`===== Test Summary =====`);
console.log(`Total Tests: ${testCases.length}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failedTests === 0) {
  console.log("\n✅ All tests passed! The duplicate detection logic is working correctly.");
} else {
  console.log("\n❌ Some tests failed. Please review the implementation.");
}