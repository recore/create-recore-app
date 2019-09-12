import { readFile, remove, writeFile } from "fs-extra";

export default class RecoreLogFile {
  private file: string;
  private separator: string = "\n";

  constructor(file: string) {
    this.file = file;
  }

  async writeOne(command: string) {
    const record = `${Date.now()} ${command}${this.separator}`;
    return writeFile(this.file, record, { flag: "a+" });
  }

  async clean() {
    return remove(this.file);
  }

  async load(): Promise<RecoreCreate.IRecord[]> {
    const records: string = await readFile(this.file, { encoding: "utf8" });
    return records
      .trim()
      .split(this.separator)
      .map(record => {
        const [runAt, payload] = record.split(" ");
        return {
          payload,
          runAt
        };
      });
  }
}