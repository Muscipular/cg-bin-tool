import BackgroundWorker from "./BackgroundWorker.ts?worker"
import {CGAnimeInfo, CGGraphicInfo} from "../Service/CGGraphicInfo.ts";

interface Defer {
  resolve(o?: any): void;

  reject(o?: any): void;
}

export class WorkerWrapper {
  #worker: Worker[];
  #seq: bigint = 0n;
  #map = new Map<bigint, Defer>();
  #que: { channel: string, id: bigint, args: any[] }[] = [];
  #count = 0;

  constructor() {
    this.#worker = [new BackgroundWorker(), new BackgroundWorker(), new BackgroundWorker(), new BackgroundWorker()];
    for (const w of this.#worker) {
      ((w) => {
        w.addEventListener('message', (e: MessageEvent<{ channel: string, id: bigint, resp: any, error: string }>) => {
          this.#count--;
          if (this.#que.length > 0) {
            let shift = this.#que.shift();
            // console.log('unque', shift);
            w.postMessage(shift);
            this.#count++;
          }
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
      })(w);
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
    if (this.#count < this.#worker.length) {
      this.#worker[this.#count].postMessage({ channel, id: seq, args });
      this.#count++;
    } else {
      this.#que.push({ channel, id: seq, args });
      // console.log('que', channel, seq, args)
    }
    this.#seq++;
    return promise as Promise<T>;
  }

  readGraphicInfo(path: string) {
    return this.#run<CGGraphicInfo[]>('readGraphicInfo', path);
  }

  readAnimeInfo(path: string) {
    return this.#run<CGAnimeInfo[]>('readAnimeInfo', path);
  }
}

export default new WorkerWrapper();
