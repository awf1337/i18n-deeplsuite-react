const { execSync } = require('child_process');

function runESLintCmd(directoryPath) {
  const formattedCommand = `npx eslint ${directoryPath} --fix`;

  try {
    execSync(formattedCommand, { stdio: 'inherit' });
    console.log('Files linted and fixed successfully using ESLint.');
  } catch (error) {
    console.error('Error linting files with ESLint:', error.message);
  }
}

module.exports = { runESLintCmd };