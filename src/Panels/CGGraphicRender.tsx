import {CGAnimeInfo, CGGraphicInfo} from "../Service/CGGraphicInfo.ts";
import {useContext, useEffect, useRef} from "react";
import fs from "fs";
import config from "../Service/Config.ts";
import * as Path from "path";
import {decode} from "../Utils/BinDecoder.ts";
import binService from "../Service/BinService.ts";

import {CGPUtils} from "../Service/CGPUtils.ts";
import {BinReaderSync} from "../Utils/BinReader.ts";

function readGraphicData(info: CGGraphicInfo, bin: string, cgp: string) {
  let fd = fs.openSync(Path.join(config.path, bin), 'r');
  let buffer = Buffer.alloc(info.Length);
  let ver = 0;
  let palSize = 0;
  let size = 0;
  let pad = 0;
  fs.readSync(fd, buffer, 0, info.Length, info.Offset);
  try {
    let res = decode(buffer);
    ver = res.ver;
    buffer = res.buffer;
    palSize = res.palSize;
    size = res.size;
    pad = res.pad;
  } catch (e) {
    console.error(e, info, buffer.subarray(0, 16).toString('hex'));
    return {};
  } finally {
    fs.closeSync(fd);
  }
  let cpg = binService.getCPG(cgp);
  console.log(palSize, size, ver, buffer.length, pad.toString(2))
  if (palSize > 0) {
    cpg = CGPUtils.convert(buffer.subarray(size, size + palSize), cpg!);
    buffer = buffer.subarray(0, size);
  }
  return { pal: cpg, image: buffer, ver, size, pad, palSize };
}

export function CGGraphicRender({ info, bin, cgp }: { info: CGGraphicInfo, bin: string, cgp: string }) {
  let ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let { image: buffer, pal: cpg } = readGraphicData(info, bin, cgp);
    if (!buffer) {
      return;
    }
    // console.log(buffer.subarray(0, 16));
    let context = ref.current?.getContext('2d');
    if (context) {
      context.clearRect(0, 0, 640, 480);
      let data = context.createImageData(info.Width, info.Height);
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
                 width={info.Width}
                 height={info.Height}
  ></canvas>;
}

export function CGAnimeRender({ info, bin, cgp }: { info: CGAnimeInfo, bin: string, cgp: string }) {
  let ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let fd = fs.openSync(Path.join(config.path, bin), 'r');
    let rd = new BinReaderSync(fd);
    rd.position = info.Offset;
    rd.readUInt16LE()

  }, [info, config.path, bin, cgp])
  return <canvas className={'viewer-canvas'} ref={ref}
                 width={256}
                 height={256}
  ></canvas>;
}
