const Queue = require('bull');

const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;

// Export a queue instance only. Processing is handled by a separate worker process.
const emailQueue = new Queue('email', redisUrl);

module.exports = emailQueue;
