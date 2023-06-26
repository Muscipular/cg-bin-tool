import BackgroundWorker from "./BackgroundWorker.ts?worker"
import {CGGraphicInfo} from "../Service/CGGraphicInfo.ts";

interface Defer {
  resolve(o?: any): void;

  reject(o?: any): void;
}

export class WorkerWrapper {
  #worker: Worker[];
  #seq: bigint = 0n;
  #map = new Map<bigint, Defer>();

  constructor() {
    this.#worker = [new BackgroundWorker(), new BackgroundWorker(), new BackgroundWorker()];
    for (const w of this.#worker) {
      w.addEventListener('message', (e: MessageEvent<{ channel: string, id: bigint, resp: any, error: string }>) => {
        const { channel, id, resp, error } = e.data;
        // console.log('message', channel, id, resp, error);
        let defer = this.#map.get(id);
        if (defer) {
          this.#map.delete(id);
          if (error) {
            defer.reject(error);
          } else {
            defer.resolve(resp);
          }
        }
      })
    }
  }

  #run<T>(channel: string, ...args: any[]): Promise<T> {
    let seq = this.#seq;
    let defer: any = {};
    let promise = new Promise((resolve, reject) => {
      defer.resolve = resolve;
      defer.reject = reject;
    });
    this.#map.set(seq, defer);
    this.#worker[+(seq % BigInt(this.#worker.length)).toString()].postMessage({ channel, id: seq, args });
    this.#seq++;
    return promise as Promise<T>;
  }

  readGraphicInfo(path: string) {
    return this.#run<CGGraphicInfo[]>('readGraphicInfo', path);
  }
}

export default new WorkerWrapper();
