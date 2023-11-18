const fs = require('fs');
const path = require('path');

// TODO: Ignore all directories listed in .gitignore
const checkIfDirectoryShouldBeIgnored = fullPath => !!fullPath
  .match(/node_modules/);

// TODO: Ignore all directories listed in .gitignore
const checkIfFileShouldBeIgnored = (fullPath, isTypeScript) => {
  const hasJsExtension = isTypeScript ? fullPath.trim().match(/\.tsx?$/) : fullPath.trim().match(/\.[jt]sx?$/);
  const isTestFile = fullPath.trim().match(/(test.[jt]sx?|spec.[jt]sx?)/);
  const pathNameIncludes = fullPath.trim().match(/\/(assets|icons|utils|providers|hooks)\//);
  const excludeExtensions = fullPath.trim().match(/\.css$/);

  // console.log('excludeExtensions', excludeExtensions)

  return !(hasJsExtension && !isTestFile && !pathNameIncludes && !excludeExtensions);
};

const walk = (rootDir, isTypeScript, allFiles = []) => {
  const files = fs.readdirSync(rootDir);
  files.forEach((file) => {
    const fullPath = path.join(rootDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!checkIfDirectoryShouldBeIgnored(fullPath)) {
        walk(fullPath, isTypeScript, allFiles);
      }
    } else if (!checkIfFileShouldBeIgnored(fullPath, isTypeScript)) {
      allFiles.push(fullPath);
    }
  });
  return allFiles;
};

module.exports = {
  walk,
  checkIfDirectoryShouldBeIgnored,
  checkIfFileShouldBeIgnored,
};
