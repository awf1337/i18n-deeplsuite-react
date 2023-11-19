const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

function isReactI18NextInstalled() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    return !!packageJson.dependencies['react-i18next'];
  } catch (error) {
    return false;
  }
}

function installReactI18Next() {
  if (isReactI18NextInstalled()) {
    return;
  }

  const installCommand = 'npm install react-i18next';

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Do you want to install react-i18next? (y/n) ', (answer) => {
    rl.close();

    if (answer.toLowerCase() === 'y') {
      try {
        execSync(installCommand, { stdio: 'inherit' });
        console.log('react-i18next installed successfully.');
      } catch (error) {
        console.error('Error installing react-i18next:', error.message);
      }
    } else {
      console.log('Installation canceled by user.');
    }
  });
}

module.exports = { installReactI18Next };
