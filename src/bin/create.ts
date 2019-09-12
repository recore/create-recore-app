import Reporter from "../reporter";
import chalk from "chalk";
import { readdir } from "fs-extra";
import * as inquirer from "inquirer";
import { resolve } from "path";
import * as yargs from "yargs-parser";
import RecoreTemplate from "../template/recore";

function argvParser() {
  // 参数解析
  const argv = yargs(process.argv);
  const proj = argv._[2] === "init" && argv._[3] === "recore"
    ? argv._[4]
    : argv._[2];
  const ctxPath = resolve(proj || ".");

  return {
    ...argv,
    ctxPath,
  };
}

async function isEmptyDir(ctxPath: string): Promise<boolean> {
  try {
    const files = await readdir(ctxPath);
    return files.length === 0;
  } catch (err) {
    if (err.code === "ENOENT") {
      return true;
    }
    throw err;
  }
}

async function checkProjectDir(ctxPath: string) {
  const inCurrent = [{
    message: "Start initialize a Recore project",
    name: "ok",
    type: "confirm",
  }];

  if (!await isEmptyDir(ctxPath)) {
    console.warn(chalk.red("Current directory is not empty!"));
    const { ok } = await inquirer.prompt(inCurrent);
    if (!ok) {
      process.exit(0);
    }
  }
}

async function run(argv: {
  _: string[], t: string, ctxPath: string, install?: boolean, offline?: boolean, p?: string, answer?: string,
}) {
  // 记录用户初始化行为
  const reporter = new Reporter("project");
  // 初始化时不需要查找依赖
  // 将 context 置为 null，避免读取错误的值
  reporter.report("init", null);

  // console.log('parameters: ', JSON.stringify(argv, null, 2));
  await checkProjectDir(argv.ctxPath);

  // 自动安装的标志
  const autoInstall = typeof argv.install === "undefined"
    ? true
    : argv.install;
    
  const templateParams = {
    answer: argv.answer,
    autoInstall,
    ctxPath: argv.ctxPath,
    name: argv.t || "@recore/recore-template",
  };
 

  const t = new RecoreTemplate(templateParams);
  t.create();
}

run(argvParser());
