import * as spawn from "cross-spawn";
const npmDefaultRegistry = 'http://registry.npmjs.org/';
let npmGettedRegistry = '';

export default function getRegistry(): Promise<string> {
  if (npmGettedRegistry) {
    return Promise.resolve(npmGettedRegistry);
  }
  return new Promise((resolve) => {
    const child = spawn("npm", ["config", "get", "registry"], { stdio: "pipe" });

    const killTimeID = setTimeout(() => {
      child.kill();
      npmGettedRegistry = npmDefaultRegistry;
      resolve(npmGettedRegistry);
    }, 1000);

    child.stdout.on("data", (data: Buffer) => {
      clearTimeout(killTimeID);
      npmGettedRegistry = data.toString();
      resolve(npmGettedRegistry);
    });

    child.on("error", () => {
      clearTimeout(killTimeID);
      npmGettedRegistry = npmDefaultRegistry;
      resolve(npmGettedRegistry);
    });
  })
}
