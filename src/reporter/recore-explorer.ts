import { readFile } from 'fs';
import { join } from 'path';

export default class RecoreExplorer {
  public context: string;
  private targets: string[];

  constructor(context: string) {
    this.context = context;
    this.targets = ['@recore/fx', '@recore/solution', '@recore/recore-loader'];
  }

  /**
   * 开始探索
   */
  public async explore(): Promise<RecoreCreate.IDependency[]> {
    if (!this.context) {
      // 当上下文为空，则不查找
      return Promise.resolve([]);
    }

    const jobs = this.targets.map(t => join(this.context, 'node_modules', t, 'package.json')).map(file => this.read(file));

    const result = await Promise.all(jobs).then((data: string[]) => {
      return data
        .filter(r => r)
        .map(r => this.extract(r))
        .filter(r => r);
    });

    return result;

    // 整理结果
    // {
    //  "@ali/recore": "1.0.0",
    //  "@ali/nowa-recore-solution": "1.0.0",
    //  "@ali/recore-loader": "1.0.0",
    // }
    // const deps: RecoreReporter.IDependencies = {}; // 存放结果
    // result.forEach(item => {
    //   const { name, version } = item;
    //   deps[name] = version;
    // });
    // return deps;
  }

  private extract(data: string): RecoreCreate.IDependency | null {
    try {
      const result = JSON.parse(data);
      return {
        name: result.name,
        version: result.version,
      };
    } catch (err) {
      return null;
    }
  }

  private read(file: string): Promise<string> | Promise<null> {
    return new Promise((resolve) => {
      readFile(file, { encoding: 'utf8' }, (err, data) => {
        if (err) {
          resolve();
          return;
        }
        resolve(data);
      });
    });
  }
}