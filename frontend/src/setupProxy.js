const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Only proxy API requests under /api to backend to preserve SPA routes
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: { '^/api': '/api' }
    })
  );
};
