/* eslint-disable */
if (
  process.env.VERCEL === '1' ||
  process.env.CI === 'true' ||
  process.env.NODE_ENV === 'production'
) {
  console.log('Build environment detected (Vercel/CI/Production). Skipping husky installation.');
  process.exit(0);
}

try {
  const { execSync } = require('child_process');
  console.log('Installing husky...');
  execSync('npx husky', { stdio: 'inherit' });
} catch (e) {
  console.warn('Husky install failed, but continuing...', e.message);
}
