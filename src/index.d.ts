declare module "compressing";
declare module "cross-spawn";
declare module "download";
declare module "fs-extra";
declare module "glob";
declare module "inquirer";
declare module "ora";
declare module "yargs-parser";
declare module 'getmac';

declare namespace RecoreCreate {
  interface INPMDistInfo {
    shasum: string;
    size: number;
    key: string;
    tarball: string;
  }
  
  type UUID = string;

  type Timestamp = string;

  interface ILogFn {
    (msg: string, ...args: any[]): void;
    (obj: object, msg?: string, ...args: any[]): void;
  }

  interface ILog {
    debug: ILogFn;
    info: ILogFn;
    error: ILogFn;
  }

  interface IRecord {
    runAt: Timestamp;
    payload: string;
  }

  interface IDependency {
    name: string;
    version: string;
  }

  interface INetworkInterface {
    mac?: string;
  }

  interface IPackageInformation {
    name: string;
    version: string;
  }
}