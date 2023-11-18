const { execSync } = require('child_process');

function runPrettierCmd(filePath) {
  const formattedCommand = `npx prettier --write ${filePath}`

  try {
    execSync(formattedCommand, { stdio: "inherit" })
    console.log("File formatted successfully using Prettier.")
  } catch (error) {
    console.error("Error formatting file with Prettier:", error.message)
  }
}

module.exports = { runPrettierCmd }