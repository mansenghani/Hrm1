const bcrypt = require('bcryptjs');

async function testPassword() {
  const hash = '$2b$10$gskEuz2A36tVHshnormTXemHu4iaDGMfUTpeT3wDipm5beO3XP4.W';
  
  // Let's test a few common passwords
  const potentialPasswords = [
    'admin123',
    'password123',
    '123123123123Man@',
    'hr@2026',
    'managerpassword123',
    'bhavik123',
    'fluidhr123',
    'bhavik@123',
    'fluidhr@123',
    'bhavik'
  ];

  for (const pw of potentialPasswords) {
    const isMatch = await bcrypt.compare(pw, hash);
    if (isMatch) {
      console.log(`FOUND PASSWORD MATCH: "${pw}"`);
      process.exit(0);
    }
  }

  console.log('No matches found in potential passwords list.');
  process.exit(0);
}

testPassword().catch(console.error);
