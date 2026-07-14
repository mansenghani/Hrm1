const { execSync } = require('child_process');
const fs = require('fs');

try {
  const diff = execSync('git diff frontend/shared/layouts/MainLayout.jsx').toString();
  console.log('--- GIT DIFF START ---');
  console.log(diff);
  console.log('--- GIT DIFF END ---');
} catch (e) {
  console.error('Error running git diff:', e.message);
}
