const emailQueue = require('../queues/emailQueue');
const mailTransporter = require('../services/mailTransporter');

console.log('Email worker starting...');

emailQueue.process(async (job) => {
  const data = job.data || {};
  try {
    await mailTransporter.sendMail({
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html
    });
    return Promise.resolve();
  } catch (err) {
    console.error('Email job failed', err);
    throw err;
  }
});

emailQueue.on('failed', (job, err) => {
  console.error('Email job failed', job.id, err);
});

emailQueue.on('completed', (job) => {
  console.log('Email job completed', job.id);
});

process.on('SIGINT', () => {
  console.log('Shutting down email worker');
  process.exit(0);
});
