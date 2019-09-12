/**
 * PC 模版
 */
import chalk from "chalk";
import * as spawn from "cross-spawn";
import { copy, readFile, remove, writeFile } from "fs-extra";
import * as inquirer from "inquirer";
import * as ora from "ora";
import { join } from "path";
import Tarball from "../lib/tarball";
import glob from "../utils/glob";
import requireCustomScript from "../utils/require-custom-script";
import getRegistry from "../utils/get-registry";

export default class Template {
  tarball: Tarball;
  ctxPath: string;
  templateDir: string;
  answer: { [key: string]: string };
  private name: string;
  private autoInstall: boolean;

  constructor(options: { name: string, ctxPath: string, autoInstall: boolean, answer?: string }) {
    this.name = options.name;
    this.ctxPath = options.ctxPath;
    this.autoInstall = options.autoInstall;
    this.tarball = new Tarball(options.name);
    if (options.answer) {
      this.answer = JSON.parse(options.answer);
    }
  }

  /**
   * 创建模版
   */
  async create() {
    let spinner = ora(`Getting template: ${this.name}...`).start();
    await this.tarball.download();
    this.templateDir = await this.tarball.decompress();
    spinner.stop();

    await this.runCustomScript();

    spinner = ora(`Initializing the project...`).start();
    await this.initProject();
    spinner.succeed('Project initilized');
    
    if (await this.installDependencies()) {
      this.outputSuccessfully();
    }
  }

  outputSuccessfully() {
    console.info(`\n🎉  Successfully created the project ${chalk.yellow(this.answer.projectName)}.\n`);
    console.info(chalk.green("Now you can:\n"));
    console.info(chalk.blueBright("Dev-Debug $ npm start"));
    console.info(chalk.blueBright("Build $ npm run build"));
    console.info(chalk.blueBright("Test $ npm test"));
  }

  /**
   * 运行用户自定义脚本
   */
  async runCustomScript() {
    if (this.answer) {
      return;
    }
    const nowaOptionsFilePath = join(this.templateDir, "nowa-questions.js");
    try {
      const questions = await requireCustomScript(nowaOptionsFilePath);
      const result = await inquirer.prompt(questions({
        ctxPath: this.ctxPath,
      }));
      this.answer = result;
    } catch {
      return {};
    }
  }

  /**
   * 初始化工程
   */
  async initProject() {
    const { ctxPath, answer } = this;
    // 复制必要的文件到工作目录
    await copy(join(this.templateDir, "proj"), ctxPath);

    const files = await glob("**/*.tpl", {
      cwd: ctxPath,
      ignore: ["node_modules", "src"],
      nodir: true,
    });
    const jobs = files.map(async (filename: string) => {
      if (!/\.tpl$/.test(filename)) {
        return;
      }
      const targetFile = join(ctxPath, filename);
      const content = await readFile(targetFile, { encoding: "utf8" });
      await remove(targetFile);
      const newTargetFile = targetFile.replace(/\.tpl$/, "").replace(/~/g, "");
      await writeFile(newTargetFile, content.replace(/{{(.+?)}}/g, (matched: string, key: string) => {
        return answer[key.trim()] || "";
      }));
    });
    await Promise.all(jobs);
  }

  /**
   * 安装依赖
   */
  async installDependencies() {
    if (!this.autoInstall) {
      return true;
    }

    console.info("");
    const { ctxPath } = this;
    const registry = await getRegistry();
    const { signal, status } = spawn.sync("npm", ["i", `--registry=${registry}`], { cwd: ctxPath, stdio: "inherit" });
    
    if (signal || status) {
      if (status) {
        console.info(chalk.yellowBright('\nTry npm install in project dir again.'));
      }
      return false;
    }

    return true;
  }
}
