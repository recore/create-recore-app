/**
 * 更改 build 目录下 package.json 的版本
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

const readFilePromise = util.promisify(fs.readFile);
const writeFilePromise = util.promisify(fs.writeFile);
const PROJECT_PATH = path.join(__dirname, '../');
const PACKAGE_JSON_FILE = path.join(PROJECT_PATH, './package.json');
const PUBLISHED_PACKAGE_JSON_FILE = path.join(PROJECT_PATH, './build/package.json');

async function run() {
  const pkg = await readFilePromise(PACKAGE_JSON_FILE, { encoding: 'utf8' });
  const { version } = JSON.parse(pkg);
  const pkg2 = JSON.parse(await readFilePromise(PUBLISHED_PACKAGE_JSON_FILE, { encoding: 'utf8' }));
  pkg2.version = version;
  await writeFilePromise(PUBLISHED_PACKAGE_JSON_FILE, JSON.stringify(pkg2, null, 2));
}

run();
