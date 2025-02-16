const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY); // Make sure RESEND_API_KEY is set in your .env

resend.emails.send({
  from: 'onboarding@resend.dev', // Use a verified sender email (or your verified sender)
  to: 'azambata.1984@gmail.com',
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
})
.then(response => {
  console.log("Email sent successfully!", response);
})
.catch(error => {
  console.error("Error sending email:", error);
});
