import crypto = require("crypto");
import { readFile, writeFile } from "fs-extra";
import getMacAddress from '../utils/get-mac';

export default class RecoreUUID {
  private uuidFile: string;

  constructor(file: string) {
    this.uuidFile = file;
  }

  public async create(): Promise<RecoreCreate.UUID> {
    try {
      const content: string = await this.readFromFile();
      return content;
    } catch (err) {
      if (err.code === "ENOENT") {
        const uuid: string = await this.generate();
        writeFile(this.uuidFile, uuid);
        return uuid;
      }
      throw err;
    }
  }

  private async readFromFile() {
    return readFile(this.uuidFile, { encoding: "utf8" });
  }

  private generate(): Promise<RecoreCreate.UUID> {
    return new Promise((resolve) => {
      const macAddress = getMacAddress();
      const hash = crypto.createHash("sha1");
      // 如果没有找到 mac 地址，通过随机数生成唯一值
      hash.update(macAddress || Math.random().toString());
      resolve(hash.digest("hex"));
    });
  }
}