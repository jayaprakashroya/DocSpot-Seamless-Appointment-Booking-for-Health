const emailQueue = require('../queues/emailQueue');
const mailTransporter = require('./mailTransporter');

async function sendEmailNow({ to, subject, text, html }) {
  if (!to) return;
  try {
    await mailTransporter.sendMail({ to, subject, text, html });
  } catch (err) {
    console.error('Failed to send email immediately', err);
  }
}

async function enqueueEmail({ to, subject, text, html }) {
  if (!to) return;
  try {
    await emailQueue.add({ to, subject, text, html }, { attempts: 3, backoff: 5000 });
  } catch (err) {
    console.error('Failed to enqueue email', err);
    // fallback to immediate send
    await sendEmailNow({ to, subject, text, html });
  }
}

module.exports = { sendEmailNow, enqueueEmail };
