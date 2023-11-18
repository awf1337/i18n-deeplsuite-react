const fs = require('fs');
const path = require('path');

const mkdirp = require('mkdirp');

const {
  LutManager,
  lutToLanguageCodeHelper,
  randomChineseLutConverter,
} = require('./lut');

const i18DirSystem = 'i18n'
const localesDirSystem = "locales"
const templatesDirSystem = "templates"
const templateFileSystem = "template-EN.js"
const generateTranslationScript = 'generateTranslationScript.js'

// TODO: Generate these files with babel too
const generateI18nFiles = (outputDir, sourceDir) => {

  mkdirp.sync(path.join(outputDir, sourceDir, i18DirSystem));
  fs.writeFileSync(path.join(outputDir, sourceDir, i18DirSystem, 'keys.js'), `module.exports = ${JSON.stringify(LutManager.getKeys(), null, 2)}`);
  const initJsPath = path.resolve(path.join(__dirname, '../injectedTemplates/init.js'));
  fs.writeFileSync(path.join(outputDir, sourceDir, i18DirSystem, 'init.js'), fs.readFileSync(initJsPath));

  const englishLut = LutManager.getLut();
  fs.writeFileSync(path.join(outputDir, sourceDir, i18DirSystem, 'english.js'), lutToLanguageCodeHelper(englishLut));
  const chineseLut = randomChineseLutConverter(LutManager.getLut());
  fs.writeFileSync(path.join(outputDir, sourceDir, i18DirSystem, 'chinese.js'), lutToLanguageCodeHelper(chineseLut));
};

const generateI18FilesTs = (outputDir, sourceDir) => {

  mkdirp.sync(path.join(outputDir, sourceDir, i18DirSystem));
  mkdirp.sync(path.join(outputDir, sourceDir, i18DirSystem, localesDirSystem));
  mkdirp.sync(path.join(outputDir, sourceDir, i18DirSystem, templatesDirSystem));

  const indexJsPath = path.join(__dirname, 'generateTranslationScript/index.js');
  const indexJsContent = fs.readFileSync(indexJsPath, 'utf8');

  const generateTranslationScriptPath = path.join(outputDir, sourceDir, i18DirSystem, generateTranslationScript);
  fs.writeFileSync(generateTranslationScriptPath, indexJsContent);

  fs.writeFileSync(path.join(outputDir, sourceDir, i18DirSystem, 'keys.ts'), `export default  ${JSON.stringify(LutManager.getKeys(), null, 2)}`);

  const initIndexPath = path.resolve(path.join(__dirname, '../injectedTemplatesTS/index.js'));
  fs.writeFileSync(path.join(outputDir, sourceDir, i18DirSystem, 'index.ts'), fs.readFileSync(initIndexPath));

  const initResourcesPath = path.resolve(path.join(__dirname, '../injectedTemplatesTS/resources.js'));
  fs.writeFileSync(path.join(outputDir, sourceDir, i18DirSystem, 'resources.ts'), fs.readFileSync(initResourcesPath));

  const fileContent = 'export default {}\n';
  const englishFilePath = path.join(outputDir, sourceDir, i18DirSystem, localesDirSystem, 'english.ts');
  fs.writeFileSync(englishFilePath, fileContent);
  const romanianFilePath = path.join(outputDir, sourceDir, i18DirSystem, localesDirSystem, 'romanian.ts');
  fs.writeFileSync(romanianFilePath, fileContent)

  const englishLut = LutManager.getLut();
  const templatesPath  = path.join(outputDir, sourceDir, i18DirSystem, templatesDirSystem, templateFileSystem)

  fs.writeFileSync(templatesPath, lutToLanguageCodeHelper(englishLut, true));
};

module.exports = { generateI18nFiles, generateI18FilesTs };
