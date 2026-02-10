const nodemailer = require('nodemailer');

let transporter;
if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
} else {
  transporter = {
    sendMail: async (opts) => {
      console.log('[mailTransporter] sendMail fallback:', opts);
      return Promise.resolve();
    }
  };
}

async function sendMail(opts) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@healthcare.test',
    ...opts
  });
}

module.exports = { sendMail };
