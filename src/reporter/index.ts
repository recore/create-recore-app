import { ensureDir } from 'fs-extra';
import { homedir, tmpdir } from 'os';
import { join } from 'path';
import GoldDirection from './gold-direction';
import RecoreExplorer from './recore-explorer';
import RecoreLogFile from './recore-log-file';
import RecoreUUID from './recore-uuid';
import readPackageJSON from "../utils/read-package-json";

export default class RecoreReport {
  private context: string;
  private biz: string;
  private stage: string;

  constructor(stage: string, context: string = process.cwd()) {
    this.context = context;
    this.biz = 'recore';
    this.stage = stage;
  }

  // 黄金令箭
  // biz.stage.arrow
  async report(payload: string, arrow: string = 'command') {
    const RECORE_HOME_PATH = join(homedir(), '.nowa/recore');
    const LOG_DIR_PATH = join(tmpdir(), 'recore');
    await Promise.all([ensureDir(RECORE_HOME_PATH), ensureDir(LOG_DIR_PATH)]);

    // log to file
    const recoreLog = new RecoreLogFile(join(RECORE_HOME_PATH, `operations.${this.stage}.log`));

    // uuid
    const recoreUUID = new RecoreUUID(join(RECORE_HOME_PATH, 'uuid.txt'));

    // explore name&version
    const explorer = new RecoreExplorer(this.context);

    // get the project name
    const pkgInfo = await readPackageJSON(this.context);

    /**
     * 核心代码解释
     * 1. 将用户执行命令写入操作记录
     * 2. 创建 UUID 和加载之前写入的数据（包括本次数据）
     * 3. 构造必要参数，发送黄金令箭
     * 4. 清空操作记录
     *
     * 如果其中出现任何异常，写入系统临时文件夹
     */
    return recoreLog
      .writeOne(payload)
      .then(() => Promise.all([recoreUUID.create(), recoreLog.load(), explorer.explore()]))
      .then(([uuid, records, deps]) => {
        const goldDirection = new GoldDirection(
          this.biz,
          this.stage,
          arrow,
          {
            pkgInfo,
            uuid,
          });
        // console.log(this.context, deps);
        return goldDirection.send(records, deps);
      })
      .then(() => recoreLog.clean())
      .catch(err => {
        // console.error(err);
      });
  }
}