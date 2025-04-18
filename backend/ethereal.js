const nodemailer = require('nodemailer');

async function main() {
  const testAccount = await nodemailer.createTestAccount();
  console.log("Ethereal Test Credentials:");
  console.log(testAccount);
}

main().catch(console.error);
