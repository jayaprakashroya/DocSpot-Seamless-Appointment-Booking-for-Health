#!/usr/bin/env node
/**
 * Run backend and frontend concurrently for development
 * Usage: npm run dev:all (from root)
 */
const { spawn } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

console.log('Starting DocSpot in development mode...\n');

// Start backend
const backend = spawn('npm', ['run', 'dev'], { cwd: backendDir, stdio: 'inherit' });
backend.on('error', (err) => console.error('Backend error:', err));

// Start frontend
const frontend = spawn('npm', ['start'], { cwd: frontendDir, stdio: 'inherit' });
frontend.on('error', (err) => console.error('Frontend error:', err));

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});
