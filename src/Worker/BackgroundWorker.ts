import {readGraphicInfo} from "./BinInfoReader.ts";

const fun = new Map<string, (s: string, args: any[]) => Promise<any>>();

fun.set('readGraphicInfo', readGraphicInfo);

global.addEventListener('message', async (e: MessageEvent<{ channel: string, id: bigint, args: any[] }>) => {
  const { channel, id, args } = e.data;
  let fn = fun.get(channel);
  try {
    if (fn) {
      global.postMessage({ channel, id, resp: await fn(channel, args) });
    } else {
      throw new Error('channel ' + channel + ' not found. id: ' + id);
    }
  } catch (e: any) {
    global.postMessage({ channel, id, error: e?.message || (e + '') });
  }
})

function Loop() {
  setTimeout(Loop, 1000);
}

Loop();
