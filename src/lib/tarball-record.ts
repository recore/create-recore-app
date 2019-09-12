/**
 * 记录 Tarball 相关信息
 */
import { readFile, writeFile } from "fs-extra";
import CacheError from "./cache-error";

export default class TarballRecord {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * 检查一致性
   */
  async checkConsistency(dist: RecoreCreate.INPMDistInfo): Promise<boolean> {
    try {
      const result = await this.load();
      return result.shasum === dist.shasum;
    } catch {
      return false;
    }
  }

  /**
   * 保存记录
   */
  async save(data: RecoreCreate.INPMDistInfo) {
    const { filePath } = this;
    return writeFile(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * 加载记录
   */
  async load(): Promise<RecoreCreate.INPMDistInfo> {
    const { filePath } = this;
    return readFile(filePath, { encoding: "utf8" })
      .then((content: string) => {
        const data = JSON.parse(content) as RecoreCreate.INPMDistInfo;
        return data;
      })
      .catch((err: Error) => Promise.reject(new CacheError(err)));
  }
}
