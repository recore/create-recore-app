import { HttpsAgent } from "agentkeepalive";
import axios from "axios";
import pMap from "p-map";

const httpAgent = new HttpsAgent({
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
  maxFreeSockets: 10,
  maxSockets: 100,
  timeout: 60000 // active socket keepalive for 60 seconds
});

export default class AliGoldDirection {
  private concurrency: number = 5;
  private baseURL: string;
  private biz: string;
  private stage: string;
  private arrow: string;
  private uuid: RecoreCreate.UUID;
  private pkgInfo: RecoreCreate.IPackageInformation;
  private timeout: number = 6000;

  constructor(
    biz: string,
    stage: string,
    arrow: string,
    options?: {
      uuid: RecoreCreate.UUID;
      pkgInfo?: RecoreCreate.IPackageInformation;
    }
  ) {
    this.baseURL = "http://gm.mmstat.com";
    this.biz = biz;
    this.stage = stage;
    this.arrow = arrow;
    this.uuid = options.uuid;
    this.pkgInfo = options.pkgInfo;
  }

  public async send(
    records: RecoreCreate.IRecord[],
    deps: RecoreCreate.IDependency[]
  ) {
    return pMap(records, this.sendRecord.bind(this, deps), {
      concurrency: this.concurrency
    });
  }

  private async sendRecord(
    deps: RecoreCreate.IDependency[],
    record: RecoreCreate.IRecord
  ) {
    const url = this.createURL();
    const params = {
      deps: JSON.stringify(deps),
      name: this.pkgInfo && this.pkgInfo.name,
      payload: record.payload,
      run_at: record.runAt,
      uuid: this.uuid
    };
    return axios.get(url, {
      httpAgent,
      params,
      timeout: this.timeout
    });
  }

  private createURL(): string {
    return `${this.baseURL}/${this.biz}.${this.stage}.${this.arrow}`;
  }
}
