const path = require("path")
const dotenv = require("dotenv")
const tsnode = require("ts-node")

dotenv.config()

const fs = require("fs")
const deepl = require("deepl-node")
const { execSync } = require("child_process")

checkFileStructure()

const initialTranslations = require("./templates/template-EN")

const envPathName = "../../.env" // change path to your .env file

const envPath = path.join(__dirname, envPathName)
dotenv.config({ path: envPath })

if (!process.env.DEEPL_TOKEN) {
  throw new Error("DEEPL_TOKEN is undefined")
}

const apiKey = process.env.DEEPL_TOKEN
const translator = new deepl.Translator(apiKey)
const targetLanguage = "en-US"
const sourceLanguage = "EN"
const newLanguageFileName = "locales/english.ts"

async function translateText(text, source_lang, target_lang) {
  try {
    if (text.trim().length === 0) {
      return ``
    }
    const response = await translator.translateText(
      text,
      source_lang,
      target_lang
    )

    return response.text
  } catch (error) {
    console.error("Translation error:", error)
    return text
  }
}

async function translateObject(object, source_lang, targetLang) {
  const translatedObject = {}

  for (const [key, value] of Object.entries(object)) {
    if (typeof value === "string") {
      translatedObject[key] = await translateText(
        value,
        source_lang,
        targetLang
      )
    } else if (typeof value === "object") {
      translatedObject[key] = await translateObject(
        value,
        source_lang,
        targetLang
      )
    } else {
      translatedObject[key] = value
    }
  }

  return translatedObject
}

async function writeNestedTranslations(outputFile, translation) {
  for (const nestedKey in translation) {
    if (Object.hasOwn(translation, nestedKey)) {
      const nestedTranslation = translation[nestedKey]
      if (typeof nestedTranslation === "object") {
        fs.appendFileSync(outputFile, `    ${nestedKey}: {\n`)
        await writeNestedTranslations(outputFile, nestedTranslation)
        fs.appendFileSync(outputFile, "    },\n")
      } else {
        fs.appendFileSync(
          outputFile,
          `    ${nestedKey}: "${nestedTranslation}",\n`
        )
      }
    }
  }
}

function removeCommonProperties(obj1, obj2) {
  for (const key in obj1) {
    if (Object.hasOwn(obj2, key)) {
      delete obj1[key]
    }
  }
}

function removeLastCharacters(filePath, searchString) {
  let fileContent = fs.readFileSync(filePath, "utf8")

  const lastIndex = fileContent.lastIndexOf(searchString)

  if (lastIndex !== -1) {
    fileContent = fileContent.substring(0, lastIndex)

    fs.writeFileSync(filePath, fileContent)
  }
}

function checkFileStructure() {
  const localesDirSystem = "locales"
  const templatesDirSystem = "templates"
  const templateFileSystem = "templates/template-EN.js"

  if (!fs.existsSync(localesDirSystem)) {
    fs.mkdirSync(localesDirSystem)
    console.log(`The ${localesDirSystem} directory has been created.`)
  }

  if (!fs.existsSync(templatesDirSystem)) {
    fs.mkdirSync(templatesDirSystem)
    console.log(`The ${templatesDirSystem} directory has been created.`)
  }

  if (!fs.existsSync(templateFileSystem)) {
    fs.writeFileSync(
      templateFileSystem,
      'const k = require("./generalKeys")\n\n'
    )
    fs.appendFileSync(
      templateFileSystem,
      `module.exports = {\n HOME:{Nested:"Home Page"}}`
    )
    runPrettierCmd(templateFileSystem)
    console.log(`The ${templateFileSystem} file has been created.`)
  }

  if (
    fs.existsSync(localesDirSystem) &&
    fs.existsSync(templatesDirSystem) &&
    fs.existsSync(templateFileSystem)
  ) {
    console.log("File structure checked")
  } else {
    throw new Error("Something went wrong with file structure")
  }
}

async function writeTranslationsToFile(
  filename,
  sourceTranslations,
  source_lang,
  target_lang
) {
  const sourceTranslationsCopy = JSON.parse(JSON.stringify(sourceTranslations))

  const doesTargetFileExist = fs.existsSync(newLanguageFileName)
  if (doesTargetFileExist) {
    tsnode.register({
      compilerOptions: {
        module: "commonjs",
      },
    })
    const importedModule = require(`./${newLanguageFileName}`)
    const targetTranslations = importedModule.default

    removeCommonProperties(sourceTranslationsCopy, targetTranslations)
  }
  const targetTranslations = await translateObject(
    sourceTranslationsCopy,
    source_lang,
    target_lang
  )

  const outputFile = filename

  if (!doesTargetFileExist) {
    fs.writeFileSync(outputFile, "export default {\n")
  } else {
    removeLastCharacters(outputFile, "}")
  }

  for (const key in targetTranslations) {
    if (Object.hasOwn(targetTranslations, key)) {
      const translation =
        typeof targetTranslations[key] === "string"
          ? targetTranslations[key].replace(/\n\s*/g, " ")
          : targetTranslations[key]

      if (typeof translation === "object") {
        fs.appendFileSync(outputFile, `  ${key}: {\n`)
        await writeNestedTranslations(outputFile, translation)
        fs.appendFileSync(outputFile, "  },\n")
      } else {
        fs.appendFileSync(outputFile, `  ${key}: "${translation}",\n`)
      }
    }
  }

  fs.appendFileSync(outputFile, "};\n")

  generateKeysFile(initialTranslations).catch((error) =>
    console.error("Error on generateKeysFile", error)
  )

  runPrettierCmd(newLanguageFileName)

  console.log(`Translations written to ${outputFile}`)
}

function runPrettierCmd(fileName) {
  const formattedCommand = `npx prettier --write ${fileName}`

  try {
    execSync(formattedCommand, { stdio: "inherit" })
    console.log("File formatted successfully using Prettier.")
  } catch (error) {
    console.error("Error formatting file with Prettier:", error.message)
  }
}

function transformObjectValuesToPath(obj, parentKey = "") {
  const transformedObject = {}

  for (const [key, value] of Object.entries(obj)) {
    const currentKey = parentKey ? `${parentKey}.${key}` : key

    if (typeof value === "object" && !Array.isArray(value)) {
      transformedObject[key] = transformObjectValuesToPath(value, currentKey)
    } else {
      transformedObject[key] = currentKey
    }
  }

  return transformedObject
}

async function generateKeysFile(sourceTranslations) {
  const keysFilePath = "keys.ts"

  const objValuesAsPath = transformObjectValuesToPath(sourceTranslations)

  const formattedContent = `export default ${formatObject(objValuesAsPath)};\n`

  fs.writeFileSync(keysFilePath, formattedContent, "utf8")

  const formattedCommand = `npx prettier --write ${keysFilePath}`

  try {
    execSync(formattedCommand, { stdio: "inherit" })
    console.log("File formatted successfully using Prettier.")
  } catch (error) {
    console.error("Error formatting file with Prettier:", error.message)
  }
}

function formatObject(obj) {
  const formatted = Object.entries(obj).map(([key, value]) => {
    if (typeof value === "object") {
      return `${key}: ${formatObject(value)}`
    } else {
      return `${key}: '${value}'`
    }
  })

  return `{ ${formatted.join(", ")} }`
}

writeTranslationsToFile(
  newLanguageFileName,
  initialTranslations,
  sourceLanguage,
  targetLanguage
)
