/**
 * npm 服务
 */
import * as spawn from "cross-spawn";
import * as vm from "vm";
import TimeoutError from "./timeout-error";
import getRegistry from "../utils/get-registry";

/**
 * 解析
 */
function parseDistData(data: Buffer): RecoreCreate.INPMDistInfo {
  const sandbox = { a: {} };
  vm.createContext(sandbox);
  vm.runInContext(`var a = ${data.toString()}`, sandbox);
  return sandbox.a as RecoreCreate.INPMDistInfo;
}

export default class NPM {
  /**
   * 查看最新 dist 信息
   */
  async viewDist(template: string): Promise<RecoreCreate.INPMDistInfo> {
    const registry = await getRegistry();
    return new Promise((resolve, reject) => {
      const child = spawn("npm", [`--registry=${registry}`, "view", template, "dist"], { stdio: "pipe" });

      const killTimeID = setTimeout(() => {
        child.kill();
        reject(new TimeoutError("Got the latest template information FAILED"));
      }, 2000);

      child.stdout.on("data", (data: Buffer) => {
        clearTimeout(killTimeID);
        const result = parseDistData(data);
        resolve(result);
      });

      child.on("error", (err: Error) => {
        clearTimeout(killTimeID);
        reject(err);
      });
    });
  }
}
