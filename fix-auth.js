const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths to source and target files
const FILES_TO_UPDATE = [
  {
    src: 'Appscript/Code.gs.fixed',
    dest: 'Appscript/Code.gs',
    backupSuffix: '.bak'
  },
  {
    src: 'src/contexts/GoogleAuthProvider.jsx.fixed',
    dest: 'src/contexts/GoogleAuthProvider.jsx',
    backupSuffix: '.bak'
  },
  {
    src: 'src/api.js.fixed',
    dest: 'src/api.js',
    backupSuffix: '.bak'
  }
];

// Function to backup a file
function backupFile(filePath, backupSuffix) {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}${backupSuffix}`;
    console.log(`Backing up ${filePath} to ${backupPath}`);
    fs.copyFileSync(filePath, backupPath);
    return true;
  }
  return false;
}

// Function to copy a file
function copyFile(srcPath, destPath) {
  if (fs.existsSync(srcPath)) {
    console.log(`Copying ${srcPath} to ${destPath}`);
    fs.copyFileSync(srcPath, destPath);
    return true;
  }
  console.error(`Source file ${srcPath} does not exist!`);
  return false;
}

// Main function to fix the Google Auth files
function fixGoogleAuth() {
  console.log('Starting Google Auth fix script...');
  console.log('This script will update your Google Auth implementation with the fixed versions.');
  
  // Check if all fixed files exist
  const missingFiles = FILES_TO_UPDATE
    .filter(file => !fs.existsSync(file.src))
    .map(file => file.src);
    
  if (missingFiles.length > 0) {
    console.error('ERROR: The following fixed files are missing:');
    missingFiles.forEach(file => console.error(`  - ${file}`));
    console.error('Please make sure all fixed files are in the correct locations before running this script.');
    return false;
  }
  
  // Backup and update each file
  for (const file of FILES_TO_UPDATE) {
    // Backup original file
    const wasBackedUp = backupFile(file.dest, file.backupSuffix);
    if (wasBackedUp) {
      console.log(`✓ Successfully backed up ${file.dest}`);
    } else {
      console.warn(`⚠ Original file ${file.dest} not found, will create new file`);
    }
    
    // Copy fixed file
    const wasCopied = copyFile(file.src, file.dest);
    if (wasCopied) {
      console.log(`✓ Successfully updated ${file.dest}`);
    } else {
      console.error(`✗ Failed to update ${file.dest}`);
      return false;
    }
  }
  
  console.log('\n✅ Google Auth fix completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Deploy the updated Code.gs file in Google Apps Script');
  console.log('   - Open your Google Apps Script project');
  console.log('   - Select Deploy > Manage deployments');
  console.log('   - Create a new version');
  console.log('   - Deploy the new version');
  console.log('2. Update your .env file with the correct Google Client ID and Apps Script URL');
  console.log('3. Clear your browser cache');
  console.log('4. Run the application and test the authentication');
  console.log('\nFor more information, refer to:');
  console.log('- GOOGLE_AUTH_SETUP.md');
  console.log('- GOOGLE_AUTH_TROUBLESHOOTING.md');
  console.log('- GOOGLE_AUTH_IMPLEMENTATION_PLAN.md');
  
  return true;
}

// Run the function
fixGoogleAuth();