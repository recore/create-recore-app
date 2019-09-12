import { readFile } from "fs-extra";
import * as vm from "vm";

export default async function customRequire(filePath: string) {
  const code = await readFile(filePath, { encoding: "utf8" });
  const script = new vm.Script(code);
  const func = script.runInNewContext(/* replace with NODE_GLOBAL_VARIABLE */{
    console, exports, module, process, require,
  });
  return func;
}
