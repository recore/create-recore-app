/**
 * h5 模版
 */
import chalk from "chalk";
import * as spawn from "cross-spawn";
import { copy, readFile, writeFile } from "fs-extra";
import * as ora from "ora";
import { join } from "path";
import Tarball from "../lib/tarball";
import customRequire from "../utils/require-custom-script";
import RecoreTemplate from "./recore";

export default class Template {
  public tarball: Tarball;
  public ctxPath: string;
  public name: string;
  private templateDir: string;
  private registry: string;
  private autoInstall: boolean;
  private offline: boolean;
  private recoreTemplate: RecoreTemplate;

  constructor(options: { names: string[], ctxPath: string, autoInstall: boolean, offline: boolean, answer?: string }) {
    this.recoreTemplate = new RecoreTemplate({
      answer: options.answer,
      autoInstall: options.autoInstall,
      ctxPath: options.ctxPath,
      name: options.names[0],
    });
    this.name = options.names[1];
    this.ctxPath = options.ctxPath;
    this.autoInstall = options.autoInstall;
    this.registry = "http://registry.npm.alibaba-inc.com";
    this.tarball = new Tarball(options.names[1]);

    // Shell(离线包) 参数设置
    // 默认带 Shell(离线包)
    this.offline = typeof options.offline === "undefined"
      ? true
      : options.offline;
  }

  /**
   * 创建模版
   */
  public async create() {
    const spinner = ora(`creating the template: ${this.name}...`);
    spinner.start();
    await this.recoreTemplate.tarball.download();
    this.recoreTemplate.templateDir = await this.recoreTemplate.tarball.decompress();

    // 如果需要离线化功能，需要下载相应的数据包
    if (this.offline) {
      await this.tarball.download();
      this.templateDir = await this.tarball.decompress();
    }

    spinner.stop();

    await this.recoreTemplate.runCustomScript();

    const spinner2 = ora(`initializing the project...`);
    spinner2.start();
    await this.initProject();
    spinner2.stop();
    if (this.autoInstall) {
      this.installDependencies();
    }
    this.recoreTemplate.outputSuccessfully();
    console.info(chalk.green("构建离线包 $ npm run offline 或者 $ npm run offline:prod"));
  }

  /**
   * 初始化工程
   */
  public async initProject() {
    const { ctxPath, recoreTemplate } = this;

    // 如果需要离线化功能，需要将文件复制到对应文件夹
    if (this.offline) {
      await copy(this.templateDir, join(ctxPath, "offline"));
    }

    // 调用 recore 模版的初始化项目函数
    await recoreTemplate.initProject();

    const pkgJsonFile = join(ctxPath, "package.json");
    // const recoreConfigFile = join(ctxPath, "recore.config.js");
    await Promise.all([
        // this.recoreConfigForOffline(recoreConfigFile),
        this.packageForOffline(pkgJsonFile),
    ]);
  }

  /**
   * 安装依赖
   */
  public installDependencies() {
    const { ctxPath, registry, recoreTemplate } = this;

    // 调用 recore 模版的安装函数
    recoreTemplate.installDependencies();

    // 如果需要离线化能力，需要安装 offline 的依赖
    if (this.offline) {
      spawn.sync("npm", ["i", `--registry=${registry}`], { cwd: join(ctxPath, "offline"), stdio: "inherit" });
    }
  }

  /**
   * 对 recore.config.js 中 script 字段进行处理
   * 目前只是简单的字符串填充，如果是负责的、包含计算的配置会导致错误
   * TODO: 先不做 offline 判断
   */
  private async  recoreConfigForOffline(recoreConfigFile: string) {
    return customRequire(recoreConfigFile)
    .then((data: { offline?: object }) => {
      data.offline = {
        development: {},
        pages: [],
        production: {},
      };

      if (!this.offline) {
        delete data.offline;
      }

      const result = JSON.stringify(data, null, 2);
      return `module.exports = ${result}`;
    })
    .then((data: string) => {
      if (data) {
        return writeFile(recoreConfigFile, data);
      }
    })
    .catch((err: Error) => {
      // do nothing
      // ignore all error
      console.error(err);
    });
  }

  /**
   * 对 package.json 中 script 字段进行处理
   */
  private async packageForOffline(pkgJsonFile: string) {
    return readFile(pkgJsonFile, { encoding: "utf8" })
    .then((data: string) => {
      return JSON.parse(data);
    })
    .then((pkg: {
      scripts?: {
        offline: string, "offline:prod": string,
      },
    }) => {
      if (!this.offline) {
        delete pkg.scripts["offline:prod"];
        delete pkg.scripts.offline;
      }
      return JSON.stringify(pkg, null, 2);
    })
    .then((data: string) => {
      if (data) {
        return writeFile(pkgJsonFile, data);
      }
    })
    .catch(() => {
      // do nothing
      // ignore all error
    });
  }
}
