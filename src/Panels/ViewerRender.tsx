import {CGGraphicInfo} from "../Service/CGGraphicInfo.ts";
import {useContext, useEffect, useRef} from "react";
import fs from "fs";
import config from "../Service/Config.ts";
import * as Path from "path";
import {decode} from "../Utils/BinDecoder.ts";
import binService from "../Service/BinService.ts";
import {CGPUtils} from "../Service/CGGraphicInfoUtils.ts";

export function ViewerRender({ info, bin, cgp }: { info: CGGraphicInfo, bin: string, cgp: string }) {
  let ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let fd = fs.openSync(Path.join(config.path, bin), 'r');
    let buffer = Buffer.alloc(info.Length);
    let ver = 0;
    let pal: Buffer | null = null;
    let size = 0;
    fs.readSync(fd, buffer, 0, info.Length, info.Offset);
    try {
      let res = decode(buffer);
      ver = res.ver;
      buffer = res.buffer;
      pal = res.pal;
      size = res.size;
    } catch (e) {
      console.log(e, buffer.subarray(0, 16).toString('hex'));
      return;
    }
    // console.log(buffer.subarray(0, 16));
    fs.closeSync(fd);
    let context = ref.current?.getContext('2d');
    if (context) {
      context.clearRect(0, 0, 640, 480);
      let data = context.createImageData(info.Width, info.Height);
      let cpg = binService.getCPG(cgp);
      console.log(pal?.length, size, ver, buffer.length)
      if (pal && pal.length > 0) {
        cpg = CGPUtils.convert(pal, cpg!);
        // buffer = buffer.subarray(0, size);
      }
      for (let y = 0; y < info.Height; y++) {
        for (let x = 0; x < info.Width; x++) {
          let offset = info.Width * y + x;
          if (offset < buffer.length) {
            let n = buffer.readUInt8(offset);
            for (let i = 0; i < 3; i++) {
              data.data[(info.Width * (info.Height - y) + x) * 4 + i] = cpg?.readUInt8(n * 4 + i)!;
            }
            data.data[(info.Width * (info.Height - y) + x) * 4 + 3] = cpg?.readUInt8(n * 4 + 3)!;
          }
        }
      }
      // console.log(data.data.slice(0), cpg, buffer)
      context.putImageData(data, 0, 0);
    }
  }, [info, config.path, bin, cgp])
  return <canvas className={'viewer-canvas'} ref={ref}
                 width={640}
                 height={480}
  ></canvas>;
}
