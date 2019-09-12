/**
 * Tarball
 */
import * as compressing from "compressing";
import * as download from "download";
import { ensureDirSync, remove } from "fs-extra";
import { homedir } from "os";
import { join } from "path";
import shasum from "../utils/shasum";
import DecompressError from "./decompress-error";
import DownloadError from "./download-error";
import NPM from "./npm";
import TarballRecord from "./tarball-record";

export default class Tarball {
  public packageName: string;
  public record: TarballRecord;
  private source: string;
  private filename: string;
  private cacheDir: string;
  private npm: NPM;

  constructor(name: string) {
    this.packageName = name;
    this.filename = encodeURIComponent(name);

    // 缓存目录
    this.cacheDir = join(homedir(), ".nowa/template-cache", this.filename);
    ensureDirSync(this.cacheDir);

    // npm 服务
    this.npm = new NPM();

    // 记录器
    const distFile = join(this.cacheDir, "dist.json");
    this.record = new TarballRecord(distFile);
  }

  /**
   * 下载
   */
  async download(): Promise<string|Error> {
    // TODO: 断网情况下，是继续使用旧包？还是直接终止安装？
    const dist = await this.fetch();
    const url = dist.tarball;
    const filename = `${this.filename}.tgz`;
    // 构造压缩包位置
    this.source = join(this.cacheDir, filename);

    // 先检查是否有更新，再检查缓存 tarball 是否正常
    if (await this.record.checkConsistency(dist) && await this.verify(dist)) {
      return this.source;
    }

    await remove(this.source);

    try {
      // console.log('downloading...')
      await download(url, this.cacheDir, {
        filename,
        timeout: 60 * 1000,
      });

      if (await this.verify(dist)) {
        await this.record.save(dist);
        return this.source;
      }

      throw new Error("Check the download tarball FAILED!");
    } catch (err) {
      throw new DownloadError(url, err);
    }
  }

  /**
   * 解压
   */
  async decompress(): Promise<string> {
    const { source } = this;
    const templateDir = join(this.cacheDir, "package");

    await remove(templateDir);

    try {
      await compressing.tgz.uncompress(source, this.cacheDir);
      return templateDir;
    } catch (err) {
      throw new DecompressError(source, err);
    }
  }

  /**
   * 获取远程信息
   */
  async fetch() {
    const result = await this.npm.viewDist(this.packageName);
    return result as RecoreCreate.INPMDistInfo;
  }

  /**
   * 验证下载内容
   */
  async verify(dist: RecoreCreate.INPMDistInfo) {
    try {
      const result = await shasum(this.source);
      return dist.shasum === result;
    } catch {
      return false;
    }
  }
}
