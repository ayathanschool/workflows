/**
 * User Management Helper Functions for SchoolFlow
 * These functions help manage user accounts in the Users sheet
 */

/**
 * Helper function to hash passwords (simple implementation)
 * In production, use a proper hashing library
 */
function _hashPassword(password) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password));
}

/**
 * Add a new user to the Users sheet
 * @param {string} email - User's email address
 * @param {string} name - User's full name
 * @param {string} password - User's password (will be hashed)
 * @param {string} roles - Comma-separated roles (teacher, class teacher, h m)
 * @param {string} classes - Comma-separated classes (10A, 10B, etc.)
 * @param {string} subjects - Comma-separated subjects (Mathematics, English, etc.)
 * @param {string} classTeacherFor - Class this teacher is the class teacher for
 */
function addUser(email, name, password, roles = 'teacher', classes = '', subjects = '', classTeacherFor = '') {
  try {
    _bootstrapSheets();
    const sh = _getSheet('Users');
    const headers = _headers(sh);
    
    // Check if user already exists
    const existingUsers = _rows(sh).map(r => _indexByHeader(r, headers));
    const existing = existingUsers.find(u => String(u.email || '').toLowerCase() === email.toLowerCase());
    
    if (existing) {
      throw new Error(`User with email ${email} already exists`);
    }
    
    // Hash the password for security
    const hashedPassword = password ? _hashPassword(password) : '';
    
    // Create new user row
    const newRow = [
      email.toLowerCase().trim(),
      name.trim(),
      hashedPassword,
      roles.trim(),
      classes.trim(),
      subjects.trim(),
      classTeacherFor.trim()
    ];
    
    sh.appendRow(newRow);
    Logger.log(`User ${email} added successfully`);
    return { success: true, message: `User ${email} added successfully` };
    
  } catch (error) {
    Logger.log(`Error adding user: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Update user password
 * @param {string} email - User's email address
 * @param {string} newPassword - New password
 */
function updateUserPassword(email, newPassword) {
  try {
    _bootstrapSheets();
    const sh = _getSheet('Users');
    const headers = _headers(sh);
    const values = sh.getDataRange().getValues();
    
    // Find user row
    for (let i = 1; i < values.length; i++) {
      const row = _indexByHeader(values[i], headers);
      if (String(row.email || '').toLowerCase() === email.toLowerCase()) {
        const hashedPassword = newPassword ? _hashPassword(newPassword) : '';
        const passwordColIndex = headers.indexOf('password') + 1;
        sh.getRange(i + 1, passwordColIndex).setValue(hashedPassword);
        Logger.log(`Password updated for user ${email}`);
        return { success: true, message: `Password updated for ${email}` };
      }
    }
    
    throw new Error(`User ${email} not found`);
    
  } catch (error) {
    Logger.log(`Error updating password: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * List all users in the system
 */
function listAllUsers() {
  try {
    _bootstrapSheets();
    const sh = _getSheet('Users');
    const headers = _headers(sh);
    const users = _rows(sh).map(r => _indexByHeader(r, headers));
    
    // Return users without passwords for security
    return users.map(user => ({
      email: user.email || '',
      name: user.name || '',
      roles: user.roles || '',
      classes: user.classes || '',
      subjects: user.subjects || '',
      classTeacherFor: user.classTeacherFor || ''
    }));
    
  } catch (error) {
    Logger.log(`Error listing users: ${error.toString()}`);
    return [];
  }
}

/**
 * Remove a user from the system
 * @param {string} email - User's email address
 */
function removeUser(email) {
  try {
    _bootstrapSheets();
    const sh = _getSheet('Users');
    const headers = _headers(sh);
    const values = sh.getDataRange().getValues();
    
    // Find and remove user row
    for (let i = 1; i < values.length; i++) {
      const row = _indexByHeader(values[i], headers);
      if (String(row.email || '').toLowerCase() === email.toLowerCase()) {
        sh.deleteRow(i + 1);
        Logger.log(`User ${email} removed successfully`);
        return { success: true, message: `User ${email} removed successfully` };
      }
    }
    
    throw new Error(`User ${email} not found`);
    
  } catch (error) {
    Logger.log(`Error removing user: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Create sample users for testing
 */
function createSampleUsers() {
  try {
    // Add sample teachers
    addUser('john.smith@school.com', 'John Smith', 'password123', 'teacher', '10A,10B', 'Mathematics,Physics', '10A');
    addUser('mary.johnson@school.com', 'Mary Johnson', 'password123', 'teacher,class teacher', '9A,9B', 'English,History', '9A');
    addUser('hm@school.com', 'Dr. Williams', 'admin123', 'h m', '', '', '');
    addUser('sarah.davis@school.com', 'Sarah Davis', 'password123', 'teacher', '8A,8B', 'Science,Chemistry', '');
    
    Logger.log('Sample users created successfully');
    return { success: true, message: 'Sample users created successfully' };
    
  } catch (error) {
    Logger.log(`Error creating sample users: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * Test authentication for development
 * @param {string} email - User's email
 * @param {string} password - User's password
 */
function testLogin(email, password) {
  try {
    _bootstrapSheets();
    const sh = _getSheet('Users');
    const headers = _headers(sh);
    const users = _rows(sh).map(r => _indexByHeader(r, headers));
    
    const found = users.find(u => String(u.email || '').toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, error: 'User not found' };
    }
    
    if (password && found.password) {
      const hashedInput = _hashPassword(password);
      if (hashedInput !== found.password) {
        return { success: false, error: 'Invalid password' };
      }
    }
    
    return { 
      success: true, 
      user: {
        email: found.email,
        name: found.name,
        roles: found.roles,
        classes: found.classes,
        subjects: found.subjects,
        classTeacherFor: found.classTeacherFor
      }
    };
    
  } catch (error) {
    Logger.log(`Test login error: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}